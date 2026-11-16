import React,{useEffect,useMemo,useState} from 'react';
import {Alert,KeyboardAvoidingView,Platform,RefreshControl,ScrollView,Text,TouchableOpacity,View} from 'react-native';
import {api,getApiUrl,setApiUrl,saveSession} from '../api';
import {C,S} from '../theme';
import {Button,DateField,Empty,ErrorMessage,Field,FormModal,Section,SelectField,StatusBadge} from '../components';
import {asMoney,clean,cleanAssistantText,futureISO,isPositiveInt,money,rules,todayISO,validate} from '../form-utils';
import {PRODUCT_FIELDS,PURCHASE_FIELDS,LOT_FIELDS,optionsFromProducts,toArray,labelOf,useData,action,PageHeading,Record,FormButtons} from './shared';

export default function Catalog({token}){
  const list=useData(token,'/api/catalog/products');
  const [open,setOpen]=useState(false),[form,setForm]=useState(PRODUCT_FIELDS),[errors,setErrors]=useState({}),[saving,setSaving]=useState(false),[filter,setFilter]=useState('');
  const [categories,setCategories]=useState([]);
  useEffect(()=>{api('/api/catalog/categories',{token}).then(rows=>{setCategories(toArray(rows).filter(x=>x.id!=null).map(x=>({value:String(x.id),label:x.name||`Categoría #${x.id}`})))}).catch(()=>{})},[token]);
  const set=(k,v)=>{setForm(f=>({...f,[k]:v}));setErrors(e=>({...e,[k]:undefined}))};
  const openForm=()=>{setForm({...PRODUCT_FIELDS});setErrors({});setOpen(true)};
  const found=useMemo(()=>list.data.filter(p=>[p.name,p.sku,p.generic_name].join(' ').toLocaleLowerCase().includes(filter.toLocaleLowerCase())),[list.data,filter]);
  const known=useMemo(()=>{const base=categories.length?categories:list.data.filter(x=>x.category_id!=null).map(x=>({value:String(x.category_id),label:`Categoría #${x.category_id}`}));return [...new Map(base.map(x=>[x.value,x])).values()]},[categories,list.data]);
  const save=async()=>{
    const e=validate(form,{sku:v=>/^[A-Za-z0-9._-]{2,40}$/.test(clean(v))?'':'SKU obligatorio: de 2 a 40 letras, números, puntos, guiones o guion bajo.',name:v=>clean(v).length>=2?'':'Introduce el nombre del medicamento.',presentation:rules.required('la presentación'),price:rules.amount('Precio'),reorder_level:rules.nonnegative('Stock mínimo'),category_id:rules.positive('Categoría')});setErrors(e);if(Object.keys(e).length)return;
    setSaving(true);try{const ok=await action(()=>api('/api/catalog/products',{method:'POST',token,body:{...form,sku:clean(form.sku).toUpperCase(),name:clean(form.name),generic_name:clean(form.generic_name),presentation:clean(form.presentation),price:asMoney(form.price),reorder_level:Number(form.reorder_level),category_id:Number(form.category_id)}}),async()=>{setOpen(false);await list.refresh()},{success:'Medicamento registrado en el catálogo.'});if(ok)setFilter('')}finally{setSaving(false)};
  };
  return <ScrollView contentContainerStyle={S.content} refreshControl={<RefreshControl refreshing={list.busy} onRefresh={list.refresh}/>} keyboardShouldPersistTaps="handled"><PageHeading title="Medicamentos" subtitle="Consulta y administra tu catálogo."/><Button onPress={openForm}>+ Agregar medicamento</Button><ErrorMessage message={list.error} onRetry={list.refresh}/><Section title={`Catálogo · ${found.length}`}><Field label="Buscar medicamento" value={filter} onChange={setFilter} placeholder="Nombre, SKU o genérico" autoCapitalize="none"/>{found.map(p=><Record key={p.id} title={p.name} subtitle={`${p.sku} · ${p.presentation||'Sin presentación'} · Mín. ${p.reorder_level}`} right={money(p.price)}/>)}{!found.length&&<Empty message={filter?'No encontramos ese medicamento.':'Todavía no hay medicamentos.'} icon="medkit-outline"/>}</Section>
    <FormModal visible={open} title="Nuevo medicamento" subtitle="Completa los campos marcados con * para registrar el producto." onClose={()=>!saving&&setOpen(false)}>
      <Field label="Código SKU" required value={form.sku} onChange={v=>set('sku',v)} error={errors.sku} placeholder="PARA-500" autoCapitalize="characters" helper="Código único de identificación."/>
      <Field label="Nombre comercial" required value={form.name} onChange={v=>set('name',v)} error={errors.name}/>
      <Field label="Nombre genérico" value={form.generic_name} onChange={v=>set('generic_name',v)} helper="Opcional."/>
      <Field label="Presentación" required value={form.presentation} onChange={v=>set('presentation',v)} error={errors.presentation} placeholder="Caja, frasco, unidad..."/>
      {known.length>0?<SelectField label="Categoría" required value={form.category_id} onChange={v=>set('category_id',v)} options={known} error={errors.category_id} helper="Selecciona una categoría existente del catálogo."/>:<Field label="ID de categoría" required value={form.category_id} onChange={v=>set('category_id',v)} keyboardType="number-pad" error={errors.category_id} helper="La API no devolvió categorías; introduce un ID existente (por ejemplo, 1)."/>}
      <Field label="Precio de venta (MXN)" required value={form.price} onChange={v=>set('price',v)} error={errors.price} keyboardType="decimal-pad" placeholder="25.00"/>
      <Field label="Stock mínimo" required value={form.reorder_level} onChange={v=>set('reorder_level',v)} error={errors.reorder_level} keyboardType="number-pad" helper="Generaremos alertas cuando el inventario alcance este nivel."/>
      <FormButtons label="Guardar medicamento" busy={saving} onSave={save} onCancel={()=>setOpen(false)}/>
    </FormModal>
  </ScrollView>;
}
