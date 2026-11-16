const storedBase = () => (localStorage.getItem('farmastock_api_base') || import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
export function getBaseUrl(){ return storedBase(); }
export function setBaseUrl(next){
 const url=String(next||'').trim().replace(/\/$/,'');
 if(url && !/^https?:\/\/[^\s]+$/.test(url))throw Error('Escribe una URL HTTP(S) válida');
 localStorage.setItem('farmastock_api_base',url);
}
export async function request(path,{method='GET',token,body}={}){
 const controller=new AbortController(); const timeout=setTimeout(()=>controller.abort(),18000);
 try {
  const response=await fetch(storedBase()+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:body===undefined?undefined:JSON.stringify(body),signal:controller.signal});
  const raw=await response.text();let value;try{value=raw?JSON.parse(raw):null}catch{value={error:raw}};
  if(!response.ok)throw Error(value?.error || `Error HTTP ${response.status}`);
  return value;
 }catch(e){if(e.name==='AbortError')throw Error('La conexión tardó demasiado; revisa el Gateway');if(e instanceof TypeError)throw Error('No se pudo conectar al Gateway. Verifica Docker y la dirección de la API.');throw e;}finally{clearTimeout(timeout);}
}
export const paths={products:'/api/catalog/products',categories:'/api/catalog/categories',batches:'/api/inventory/batches',stock:'/api/inventory/stock',movements:'/api/inventory/movements',suppliers:'/api/purchases/suppliers',orders:'/api/purchases/orders',sales:'/api/sales',notifications:'/api/notifications',risks:'/api/ai/risks',users:'/api/auth/users'};
