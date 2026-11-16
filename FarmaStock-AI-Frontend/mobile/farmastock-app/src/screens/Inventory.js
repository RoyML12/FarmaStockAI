import React,{useEffect,useMemo,useState} from 'react';
import {Alert,KeyboardAvoidingView,Platform,RefreshControl,ScrollView,Text,TouchableOpacity,View} from 'react-native';
import {api,getApiUrl,setApiUrl,saveSession} from '../api';
import {C,S} from '../theme';
import {Button,DateField,Empty,ErrorMessage,Field,FormModal,Section,SelectField,StatusBadge} from '../components';
import {asMoney,clean,cleanAssistantText,futureISO,isPositiveInt,money,rules,todayISO,validate} from '../form-utils';
import {PRODUCT_FIELDS,PURCHASE_FIELDS,LOT_FIELDS,optionsFromProducts,toArray,labelOf,useData,action,PageHeading,Record,FormButtons} from './shared';

export default function Inventory({token}){
  const batches=useData(token,'/api/inventory/batches'),products=useData(token,'/api/catalog/products');
  const [open,setOpen]=useState(false),[form,setForm]=useState(LOT_FIELDS),[errors,setErrors]=useState({}),[saving,setSaving]=useState(false),[search,setSearch]=useState('');
  const set=(k,v)=>{setForm(x=>({...x,[k]:v}));setErrors(e=>({...e,[k]:undefined}))};
  const show=()=>{setForm({...LOT_FIELDS,expiry_date:futureISO()});setErrors({});products.refresh();setOpen(true)};
  const save=async()=>{
    const e=validate(form,{product_id:rules.positive('Medicamento'),lot_number:rules.required('el número de lote'),expiry_date:rules.date('Caducidad'),quantity:rules.positive('Unidades'),unit_cost:rules.amount('Costo unitario',true)});setErrors(e);if(Object.keys(e).length)return;
    setSaving(true);try{await action(()=>api('/api/inventory/batches',{method:'POST',token,body:{...form,product_id:Number(form.product_id),lot_number:clean(form.lot_number),quantity:Number(form.quantity),unit_cost:asMoney(form.unit_cost)}}),async()=>{setOpen(false);await batches.refresh()},{success:'Lote ingresado correctamente al inventario.'})}finally{setSaving(false)};
  };
  const found=useMemo(()=>batches.data.filter(b=>[b.lot_number,labelOf(products.data,b.product_id)].join(' ').toLocaleLowerCase().includes(search.toLocaleLowerCase())),[batches.data,products.data,search]);
  return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={S.content} refreshControl={<RefreshControl refreshing={batches.busy||products.busy} onRefresh={()=>{batches.refresh();products.refresh()}}/>}><PageHeading title="Inventario" subtitle="Controla las existencias por lote y caducidad."/><Button onPress={show}>+ Recibir lote</Button><ErrorMessage message={batches.error} onRetry={batches.refresh}/><Section title={`Lotes · ${found.length}`}><Field label="Buscar lote" value={search} onChange={setSearch} placeholder="Medicamento o código de lote" autoCapitalize="none"/>{found.map(b=><Record key={b.id} title={labelOf(products.data,b.product_id)} subtitle={`Lote ${b.lot_number} · Vence ${String(b.expiry_date).slice(0,10)}`} right={`${b.available??(Number(b.quantity||0)-Number(b.reserved||0))} disp.`}><Text style={[S.small,{marginTop:5}]}>Total: {b.quantity} · Reservadas: {b.reserved||0}</Text></Record>)}{!found.length&&<Empty message={search?'No se encontraron lotes.':'Todavía no hay lotes registrados.'} icon="cube-outline"/>}</Section>
    <FormModal visible={open} title="Recibir lote" subtitle="Selecciona el medicamento, identifica el lote y registra la entrada." onClose={()=>!saving&&setOpen(false)}>
      <SelectField label="Medicamento" required value={form.product_id} onChange={v=>set('product_id',v)} options={optionsFromProducts(products.data)} loading={products.busy} error={errors.product_id} helper={products.error?'No se pudo cargar el catálogo. Revisa la conexión.':'Busca por nombre o SKU.'}/>
      <Field label="Número de lote" required value={form.lot_number} onChange={v=>set('lot_number',v)} error={errors.lot_number} placeholder="LOTE-2027-001" autoCapitalize="characters"/>
      <DateField label="Fecha de caducidad" required value={form.expiry_date} onChange={v=>set('expiry_date',v)} error={errors.expiry_date}/>
      <Field label="Unidades recibidas" required keyboardType="number-pad" value={form.quantity} onChange={v=>set('quantity',v)} error={errors.quantity}/>
      <Field label="Costo unitario (MXN)" required keyboardType="decimal-pad" value={form.unit_cost} onChange={v=>set('unit_cost',v)} error={errors.unit_cost}/>
      <FormButtons label="Registrar entrada" busy={saving} onSave={save} onCancel={()=>setOpen(false)}/>
    </FormModal>
  </ScrollView>;
}
