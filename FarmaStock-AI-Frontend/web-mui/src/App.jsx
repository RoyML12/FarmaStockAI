import React,{useCallback,useEffect,useMemo,useState} from 'react';
import {Alert,Box,Button,LinearProgress,Snackbar} from '@mui/material';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import {CatalogPage,InventoryPage,PurchasesPage,SalesPage} from './pages/Operations';
import {IntelligencePage,NotificationsPage,SettingsPage} from './pages/Insights';
import {demoData} from './data/demo';
import {getBaseUrl,setBaseUrl,paths,request} from './lib/api';
const START={products:[],categories:[],batches:[],stock:[],sales:[],notifications:[],risks:[],suppliers:[],orders:[],movements:[],users:[]};
const demoUser={full_name:'Equipo FarmaStock',email:'demo@farmastock.local',role:'admin'};
function syncStock(batches){const byId=new Map();for(const b of batches){const pid=Number(b.product_id);const s=byId.get(pid)||{product_id:pid,quantity:0,reserved:0,available:0};s.quantity+=Number(b.quantity||0);s.reserved+=Number(b.reserved||0);s.available+=Number(b.available??(Number(b.quantity||0)-Number(b.reserved||0)));byId.set(pid,s)}return [...byId.values()]}
export default function App(){
 const [session,setSession]=useState(()=>{try{const x=sessionStorage.getItem('farmastock_session');return x?JSON.parse(x):null}catch{return null}});
 const [mode,setMode]=useState(()=>sessionStorage.getItem('farmastock_mode')||'real');
 const [page,setPage]=useState('dashboard');
 const [data,setData]=useState(()=>sessionStorage.getItem('farmastock_mode')==='demo'?demoData():START);
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');
 const [toast,setToast]=useState('');
 const [apiBase,setApiBaseState]=useState(getBaseUrl());
 const isDemo=mode==='demo';
 const token=session?.token;
 const refresh=useCallback(async()=>{
  if(!session)return;
  if(isDemo){setToast('Datos de ejemplo actualizados');return;}
  setLoading(true);
  try{
   const entries=Object.entries(paths);const results=await Promise.allSettled(entries.map(([,path])=>request(path,{token})));
   const updates={};const errors=[];
   results.forEach((r,i)=>{if(r.status==='fulfilled')updates[entries[i][0]]=Array.isArray(r.value)?r.value:[];else errors.push(entries[i][0])});
   if(Object.keys(updates).length===0)throw Error('El backend no respondió a ninguna consulta. Revisa Docker, tu sesión o la URL del Gateway.');
   setData(previous=>({...previous,...updates}));
   if(errors.length)setToast('Se cargaron datos parcialmente. Revisa: '+errors.join(', '));
  }catch(e){setToast(e.message)}finally{setLoading(false)}
 },[isDemo,session,token]);
 useEffect(()=>{if(session&&!isDemo)refresh()},[session,isDemo,refresh]);
 async function login(email,password){setBusy(true);setError('');try{const found=await request('/api/auth/login',{method:'POST',body:{email,password}});if(!found?.token||!found?.user)throw Error('La respuesta del servidor no contiene una sesión válida');sessionStorage.setItem('farmastock_session',JSON.stringify(found));sessionStorage.setItem('farmastock_mode','real');setSession(found);setMode('real');setData(START);setPage('dashboard')}catch(e){setError(e.message)}finally{setBusy(false)}}
 function demo(){const s={user:demoUser,token:'demo-no-real'};sessionStorage.setItem('farmastock_session',JSON.stringify(s));sessionStorage.setItem('farmastock_mode','demo');setData(demoData());setSession(s);setMode('demo');setPage('dashboard');setError('')}
 function logout(){sessionStorage.removeItem('farmastock_session');sessionStorage.removeItem('farmastock_mode');setSession(null);setData(START);setPage('dashboard');setError('')}
 function setApiBase(value){setBaseUrl(value);setApiBaseState(getBaseUrl())}
 async function mutate(kind,payload={}){
  setBusy(true);
  try{
   let result={};
   if(isDemo){
    switch(kind){
     case 'product':{const id=Math.max(0,...data.products.map(x=>x.id))+1;const category=data.categories.find(c=>Number(c.id)===Number(payload.category_id));setData(p=>({...p,products:[{...payload,id,category_name:category?.name||'General'},...p.products]}));break;}
     case 'batch':{const id=Math.max(0,...data.batches.map(x=>x.id))+1;setData(p=>{const batches=[{...payload,id,quantity:Number(payload.quantity),reserved:0,available:Number(payload.quantity)},...p.batches];return {...p,batches,stock:syncStock(batches)}});break;}
     case 'sale':{const {product_id,quantity}=payload.items[0];const available=data.stock.find(s=>Number(s.product_id)===Number(product_id))?.available||0;if(Number(quantity)<=0)throw Error('La cantidad debe ser mayor a cero');if(Number(quantity)>Number(available))throw Error('No hay suficiente inventario disponible');const product=data.products.find(p=>Number(p.id)===Number(product_id));const id=Math.max(1000,...data.sales.map(s=>s.id))+1;setData(prev=>{let remaining=Number(quantity);const batches=[...prev.batches].sort((a,b)=>new Date(a.expiry_date)-new Date(b.expiry_date)).map(b=>{if(Number(b.product_id)!==Number(product_id)||remaining===0)return b;const take=Math.min(remaining,Number(b.available));remaining-=take;return {...b,quantity:Number(b.quantity)-take,available:Number(b.available)-take}});return {...prev,batches,stock:syncStock(batches),sales:[{id,total:Number(product?.price||0)*Number(quantity),status:'completed',created_at:new Date().toISOString()},...prev.sales]}});break;}
     case 'supplier':{const id=Math.max(0,...data.suppliers.map(x=>x.id))+1;setData(p=>({...p,suppliers:[{...payload,id},...p.suppliers]}));break;}
     case 'order':{const id=Math.max(200,...data.orders.map(o=>o.id))+1;const supplier=data.suppliers.find(s=>s.id===payload.supplier_id);setData(p=>({...p,orders:[{id,...payload,supplier_name:supplier?.name,status:'pending',created_at:new Date().toISOString()},...p.orders]}));break;}
     case 'receiveOrder':{setData(p=>({...p,orders:p.orders.map(o=>o.id===payload.id?{...o,status:'received'}:o)}));break;}
     case 'readNotification':{setData(p=>({...p,notifications:p.notifications.map(n=>n.id===payload.id?{...n,is_read:1}:n)}));break;}
     case 'scan':{setData(p=>({...p,risks:p.batches.map((b,i)=>{const d=Math.round((new Date(String(b.expiry_date).slice(0,10)+'T12:00:00')-new Date())/86400000);const prod=p.products.find(x=>x.id===Number(b.product_id));const demand=1;const leftover=Math.max(0,Math.ceil(Number(b.available??b.quantity)-Math.max(0,d)*demand));return {id:i+1,product_id:b.product_id,product_name:prod?.name||`Producto #${b.product_id}`,lot_number:b.lot_number,days_remaining:d,estimated_leftover:leftover,risk_level:d<=15?'high':d<=45?'medium':'low',quantity:b.quantity}})}));break;}
     case 'ask':{result={answer:`En esta demostración existen ${data.risks.filter(x=>x.risk_level==='high').length} lotes con riesgo alto y ${data.products.length} productos registrados. Para obtener el análisis real, inicia sesión con el backend.`,mode:'demo'};break;}
     default:throw Error('Acción de demostración no soportada');
    }
   }else{
    const map={product:['POST','/api/catalog/products'],batch:['POST','/api/inventory/batches'],sale:['POST','/api/sales'],supplier:['POST','/api/purchases/suppliers'],order:['POST','/api/purchases/orders'],receiveOrder:['POST',`/api/purchases/orders/${payload.id}/receive`],readNotification:['PATCH',`/api/notifications/${payload.id}/read`],scan:['POST','/api/ai/scan'],ask:['POST','/api/ai/ask']};
    if(!map[kind])throw Error('Operación no soportada');const [method,path]=map[kind];result=await request(path,{method,token,body:kind==='receiveOrder'||kind==='readNotification'?{}:payload});
    if(!['ask'].includes(kind))await refresh();
   }
   if(kind!=='ask')setToast(isDemo?'Operación aplicada en los datos ficticios':'Operación realizada correctamente');
   return kind==='ask'?result:true;
  }catch(e){setToast(e.message);return false}finally{setBusy(false)}
 }
 if(!session)return <Login onLogin={login} onDemo={demo} busy={busy} error={error}/>;
 const common={data,mutate,busy,refresh};
 const panes={dashboard:<Dashboard {...common} mode={mode} onPage={setPage} onScan={()=>mutate('scan',{})}/>,catalog:<CatalogPage {...common}/>,inventory:<InventoryPage {...common}/>,purchases:<PurchasesPage {...common}/>,sales:<SalesPage {...common}/>,notifications:<NotificationsPage {...common}/>,ai:<IntelligencePage {...common}/>,settings:<SettingsPage {...common} user={session.user} mode={mode} apiBase={apiBase} setApiBase={setApiBase} onLogout={logout}/>};
 return <><Layout page={page} onPage={setPage} onLogout={logout} user={session.user} mode={mode} loading={loading} unread={data.notifications.filter(n=>!n.is_read).length}>{loading&&<LinearProgress sx={{mt:-4,mb:3}}/>}{panes[page]||panes.dashboard}</Layout><Snackbar open={Boolean(toast)} autoHideDuration={6000} anchorOrigin={{vertical:'bottom',horizontal:'right'}} onClose={()=>setToast('')}><Alert variant="filled" severity={/(error|no |falla|inválido|suficiente|revisa|no se)/i.test(toast)?'warning':'success'} onClose={()=>setToast('')} sx={{maxWidth:420}}>{toast}</Alert></Snackbar></>;
}
