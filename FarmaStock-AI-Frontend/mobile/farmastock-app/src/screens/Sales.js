import React,{useEffect,useMemo,useState} from 'react';
import {Alert,KeyboardAvoidingView,Platform,RefreshControl,ScrollView,Text,TouchableOpacity,View} from 'react-native';
import {api,getApiUrl,setApiUrl,saveSession} from '../api';
import {C,S} from '../theme';
import {Button,DateField,Empty,ErrorMessage,Field,FormModal,Section,SelectField,StatusBadge} from '../components';
import {asMoney,clean,cleanAssistantText,futureISO,isPositiveInt,money,rules,todayISO,validate} from '../form-utils';
import {PRODUCT_FIELDS,PURCHASE_FIELDS,LOT_FIELDS,optionsFromProducts,toArray,labelOf,useData,action,PageHeading,Record,FormButtons} from './shared';

export default function Sales({token}){
  const sales=useData(token,'/api/sales'),products=useData(token,'/api/catalog/products'),stock=useData(token,'/api/inventory/stock');
  const [open,setOpen]=useState(false),[cart,setCart]=useState([]),[productId,setProductId]=useState(''),[qty,setQty]=useState('1'),[errors,setErrors]=useState({}),[busy,setBusy]=useState(false),[requestId,setRequestId]=useState('');
  const show=()=>{setCart([]);setQty('1');setProductId('');setErrors({});setRequestId(`mobile-${Date.now()}-${Math.random().toString(36).slice(2)}`);products.refresh();stock.refresh();setOpen(true)};
  const availableById=useMemo(()=>{const map=new Map();for(const row of stock.data){if(row.product_id!=null && row.available!=null)map.set(String(row.product_id),(map.get(String(row.product_id))||0)+Number(row.available||0))}return map},[stock.data]);
  const add=()=>{const e=validate({productId,qty},{productId:rules.positive('Medicamento'),qty:rules.positive('Cantidad')});const chosen=products.data.find(p=>String(p.id)===String(productId));if(!chosen)e.productId='Selecciona un medicamento del catálogo.';
    if(!e.qty&&chosen){const already=cart.find(c=>c.product_id===Number(productId))?.quantity||0;const available=availableById.get(String(productId));if(available!=null&&available<already+Number(qty))e.qty=`Solo hay ${available} unidades disponibles para este medicamento.`}
    setErrors(e);if(Object.keys(e).length)return;
    setCart(x=>{const found=x.find(y=>y.product_id===Number(productId));return found?x.map(y=>y.product_id===Number(productId)?{...y,quantity:y.quantity+Number(qty)}:y):[...x,{product_id:Number(productId),quantity:Number(qty)}]});setProductId('');setQty('1');setErrors({});
  };
  const total=cart.reduce((sum,x)=>sum+Number(products.data.find(p=>Number(p.id)===x.product_id)?.price||0)*x.quantity,0);
  const confirm=()=>{if(!cart.length){Alert.alert('Venta vacía','Agrega al menos un medicamento.');return}Alert.alert('Confirmar venta',`¿Registrar ${cart.reduce((s,x)=>s+x.quantity,0)} unidades? El total estimado es ${money(total)}.`,[{text:'Cancelar',style:'cancel'},{text:'Registrar',onPress:save}])};
  const save=async()=>{setBusy(true);try{await action(()=>api('/api/sales',{method:'POST',token,body:{client_request_id:requestId,items:cart}}),async()=>{setCart([]);setOpen(false);await sales.refresh();await stock.refresh()},{success:'Venta registrada y existencias actualizadas.'})}finally{setBusy(false)}};
  return <ScrollView contentContainerStyle={S.content} refreshControl={<RefreshControl refreshing={sales.busy} onRefresh={sales.refresh}/>}><PageHeading title="Ventas" subtitle="Registra movimientos con control de existencias."/><Button onPress={show}>+ Nueva venta</Button><ErrorMessage message={sales.error} onRetry={sales.refresh}/><Section title="Historial de ventas">{sales.data.map(s=><Record key={s.id} title={`Venta #${s.id}`} subtitle={`${String(s.status||'').toUpperCase()} · ${String(s.created_at||'').slice(0,16).replace('T',' ')}`} right={money(s.total)}/>)}{!sales.data.length&&<Empty message="Aún no hay ventas registradas." icon="cart-outline"/>}</Section>
    <FormModal visible={open} title="Nueva venta" subtitle="Busca un medicamento y agrégalo al carrito." onClose={()=>!busy&&setOpen(false)}>
      <SelectField label="Medicamento" required value={productId} onChange={v=>{setProductId(v);setErrors(e=>({...e,productId:undefined}))}} options={products.data.map(p=>({value:String(p.id),label:p.name,subtitle:`${p.sku} · ${money(p.price)}${availableById.has(String(p.id))?` · ${availableById.get(String(p.id))} disponibles`:''}`}))} loading={products.busy} error={errors.productId}/>
      <Field label="Cantidad" required value={qty} onChange={v=>{setQty(v);setErrors(e=>({...e,qty:undefined}))}} keyboardType="number-pad" error={errors.qty}/>
      <Button variant="secondary" onPress={add}>+ Agregar al carrito</Button>
      <View style={{backgroundColor:C.faint,borderRadius:16,padding:14,gap:8}}><Text style={S.cardTitle}>Resumen de la venta</Text>{cart.map(x=><View style={[S.row,{alignItems:'flex-start'}]} key={x.product_id}><View style={{flex:1}}><Text style={{color:C.ink,fontWeight:'700'}}>{labelOf(products.data,x.product_id)} × {x.quantity}</Text><Text style={S.small}>{money(products.data.find(p=>Number(p.id)===x.product_id)?.price)} por unidad</Text></View><TouchableOpacity accessibilityRole="button" accessibilityLabel={'Eliminar '+labelOf(products.data,x.product_id)} onPress={()=>setCart(cs=>cs.filter(a=>a.product_id!==x.product_id))}><Text style={{color:C.red,fontWeight:'800'}}>Quitar</Text></TouchableOpacity></View>)}{!cart.length&&<Empty message="Agrega un medicamento para comenzar." icon="basket-outline"/>}<View style={[S.row,{borderTopWidth:1,borderColor:C.border,paddingTop:12}]}><Text style={{color:C.ink,fontWeight:'800'}}>Total estimado</Text><Text style={{color:C.greenDeep,fontWeight:'900',fontSize:21}}>{money(total)}</Text></View><Text style={S.small}>El servidor calcula el total definitivo y realiza el descuento de stock siguiendo FEFO.</Text></View>
      <FormButtons label="Confirmar venta" busy={busy} onSave={confirm} onCancel={()=>setOpen(false)}/>
    </FormModal>
  </ScrollView>;
}
