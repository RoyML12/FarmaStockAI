import React,{useCallback,useEffect,useState} from 'react';
import {Alert,Text,View} from 'react-native';
import {api} from '../api';
import {C,S} from '../theme';
import {Button,StatusBadge} from '../components';
import {futureISO,money} from '../form-utils';

export const PRODUCT_FIELDS={sku:'',name:'',generic_name:'',presentation:'Unidad',price:'',reorder_level:'10',category_id:''};
export const PURCHASE_FIELDS={supplier_id:'',product_id:'',quantity:'',unit_cost:'',lot_number:'',expiry_date:futureISO()};
export const LOT_FIELDS={product_id:'',lot_number:'',expiry_date:futureISO(),quantity:'',unit_cost:'0'};
export const optionsFromProducts=items=>items.map(p=>({value:String(p.id),label:p.name,subtitle:`${p.sku||'Sin SKU'} · ${money(p.price)}`}));
export const toArray=value=>Array.isArray(value)?value:[];
export const labelOf=(items,id)=>items.find(x=>String(x.id)===String(id))?.name||`Producto #${id}`;
export function useData(token,path){
  const [data,setData]=useState([]),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const refresh=useCallback(async()=>{setBusy(true);setError('');try{const result=await api(path,{token});setData(toArray(result))}catch(e){setError(e.message)}finally{setBusy(false)}},[token,path]);
  useEffect(()=>{refresh()},[refresh]);return {data,busy,error,refresh};
}
export async function action(fn,onSuccess,{success='Operación realizada correctamente.'}={}){
  try{await fn();if(onSuccess)await onSuccess();Alert.alert('Listo',success);return true}catch(e){Alert.alert('No se pudo completar',e.message);return false}
}
export function PageHeading({title,subtitle}){
  return <View style={{gap:4,marginBottom:2}}><Text style={{fontSize:22,fontWeight:'900',color:C.ink,letterSpacing:-.55}}>{title}</Text>{subtitle?<Text style={[S.muted,{fontSize:13,lineHeight:19}]}>{subtitle}</Text>:null}</View>;
}
export function Record({title,subtitle,right,badge,children}){
  return <View style={S.item}><View style={[S.row,{alignItems:'flex-start'}]}><View style={{flex:1,gap:4}}><Text style={{color:C.ink,fontWeight:'800',fontSize:15}}>{title}</Text>{subtitle?<Text style={S.small}>{subtitle}</Text>:null}</View>{right?<Text style={{color:C.greenDeep,fontSize:15,fontWeight:'800'}}>{right}</Text>:badge?<StatusBadge level={badge}/>:null}</View>{children}</View>;
}
export function FormButtons({label,onSave,onCancel,busy}){
  return <View style={{gap:9,marginTop:6}}><Button loading={busy} onPress={onSave}>{label}</Button><Button variant="outline" disabled={busy} onPress={onCancel}>Cancelar</Button></View>;
}
