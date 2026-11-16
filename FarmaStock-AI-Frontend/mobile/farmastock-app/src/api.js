import * as SecureStore from 'expo-secure-store';
// La dirección se toma de la compilación o del ajuste guardado en el dispositivo.
const DEFAULT_API=process.env.EXPO_PUBLIC_API_URL||'';
export async function getApiUrl(){return await SecureStore.getItemAsync('farm_api_url')||DEFAULT_API;}
export async function setApiUrl(value){const url=String(value||'').trim().replace(/\/$/,'');if(!/^https?:\/\/[^\s]+$/.test(url))throw Error('Introduce una URL válida con http:// o https://');await SecureStore.setItemAsync('farm_api_url',url);return url;}
export const readSession=async()=>{const raw=await SecureStore.getItemAsync('farm_session');return raw?JSON.parse(raw):null};
export const saveSession=async(session)=>SecureStore.setItemAsync('farm_session',JSON.stringify(session));
export const clearSession=async()=>SecureStore.deleteItemAsync('farm_session');
export async function api(path,{method='GET',body,token}={}){const base=await getApiUrl();if(!base)throw Error('El servidor no está configurado.');let response;
try{response=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:body===undefined?undefined:JSON.stringify(body)})}catch(e){throw Error('No se puede conectar al servidor. Revisa la URL, Wi-Fi o ngrok. '+e.message)}
const text=await response.text();let data;try{data=JSON.parse(text)}catch(_){data={error:text}};if(!response.ok)throw Error(data.error||'Error HTTP '+response.status);return data;
}
