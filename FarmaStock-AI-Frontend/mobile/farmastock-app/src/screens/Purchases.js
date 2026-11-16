import React,{useEffect,useMemo,useState} from 'react';
import {Alert,KeyboardAvoidingView,Platform,RefreshControl,ScrollView,Text,TouchableOpacity,View} from 'react-native';
import {api,getApiUrl,setApiUrl,saveSession} from '../api';
import {C,S} from '../theme';
import {Button,DateField,Empty,ErrorMessage,Field,FormModal,Section,SelectField,StatusBadge} from '../components';
import {asMoney,clean,cleanAssistantText,futureISO,isPositiveInt,money,rules,todayISO,validate} from '../form-utils';
import {PRODUCT_FIELDS,PURCHASE_FIELDS,LOT_FIELDS,optionsFromProducts,toArray,labelOf,useData,action,PageHeading,Record,FormButtons} from './shared';

export default function Purchases({token}){
  const suppliers=useData(token,'/api/purchases/suppliers'),orders=useData(token,'/api/purchases/orders'),products=useData(token,'/api/catalog/products');
  const [mode,setMode]=useState(''),[form,setForm]=useState(PURCHASE_FIELDS),[errors,setErrors]=useState({}),[busy,setBusy]=useState(false);
  const set=(k,v)=>{setForm(f=>({...f,[k]:v}));setErrors(e=>({...e,[k]:undefined}))};
  const show=which=>{setMode(which);setErrors({});setForm(which==='supplier'?{name:'',phone:''}:{...PURCHASE_FIELDS,expiry_date:futureISO()});if(which==='order'){suppliers.refresh();products.refresh()}};
  const save=async()=>{
    const isSupplier=mode==='supplier';
    const validators=isSupplier?{name:rules.required('el nombre del proveedor')}:{supplier_id:rules.positive('Proveedor'),product_id:rules.positive('Medicamento'),quantity:rules.positive('Cantidad'),unit_cost:rules.amount('Costo unitario',true),lot_number:rules.required('el número de lote'),expiry_date:rules.date('Caducidad')};
    const e=validate(form,validators);setErrors(e);if(Object.keys(e).length)return;
    setBusy(true);try{await action(()=>isSupplier?api('/api/purchases/suppliers',{method:'POST',token,body:{name:clean(form.name),phone:clean(form.phone)}}):api('/api/purchases/orders',{method:'POST',token,body:{supplier_id:Number(form.supplier_id),items:[{product_id:Number(form.product_id),quantity:Number(form.quantity),unit_cost:asMoney(form.unit_cost),lot_number:clean(form.lot_number),expiry_date:form.expiry_date}]}}),async()=>{setMode('');await Promise.all([orders.refresh(),suppliers.refresh()])},{success:isSupplier?'Proveedor registrado.':'Orden de compra creada.'})}finally{setBusy(false)};
  };
  const receive=order=>Alert.alert('Recibir pedido',`¿Marcar como recibida la orden #${order.id}? Esta acción actualiza el inventario.`,[{text:'Cancelar',style:'cancel'},{text:'Recibir',onPress:()=>action(()=>api(`/api/purchases/orders/${order.id}/receive`,{method:'POST',token,body:{}}),orders.refresh,{success:'Pedido recibido.'})}]);
  return <ScrollView contentContainerStyle={S.content} refreshControl={<RefreshControl refreshing={orders.busy||suppliers.busy} onRefresh={()=>{orders.refresh();suppliers.refresh()}}/>}><PageHeading title="Compras" subtitle="Gestiona proveedores y recepción de pedidos."/><View style={{gap:8}}><Button onPress={()=>show('order')}>+ Nueva orden de compra</Button><Button variant="outline" onPress={()=>show('supplier')}>+ Registrar proveedor</Button></View><ErrorMessage message={orders.error} onRetry={orders.refresh}/><Section title="Órdenes de compra">{orders.data.map(o=><Record key={o.id} title={`Orden #${o.id}`} subtitle={o.supplier_name||`Proveedor #${o.supplier_id}`} badge={o.status}>{o.status==='pending'&&<Button variant="outline" onPress={()=>receive(o)} style={{marginTop:9}}>Recibir pedido</Button>}</Record>)}{!orders.data.length&&<Empty message="No hay órdenes registradas." icon="bag-handle-outline"/>}</Section><Section title={`Proveedores · ${suppliers.data.length}`}>{suppliers.data.map(s=><Record key={s.id} title={s.name} subtitle={s.phone||`Proveedor #${s.id}`}/>)}{!suppliers.data.length&&<Empty message="Agrega un proveedor para iniciar las compras."/>}</Section>
    <FormModal visible={!!mode} title={mode==='supplier'?'Nuevo proveedor':'Nueva orden de compra'} subtitle={mode==='supplier'?'Datos de contacto del proveedor.':'Selecciona proveedor, medicamento y lote.'} onClose={()=>!busy&&setMode('')}>
      {mode==='supplier'?<><Field label="Nombre del proveedor" required value={form.name} onChange={v=>set('name',v)} error={errors.name}/><Field label="Teléfono" value={form.phone} onChange={v=>set('phone',v)} keyboardType="phone-pad" helper="Opcional."/></>:<>
        <SelectField label="Proveedor" required value={form.supplier_id} onChange={v=>set('supplier_id',v)} options={suppliers.data.map(s=>({value:String(s.id),label:s.name,subtitle:s.phone||''}))} error={errors.supplier_id} loading={suppliers.busy}/>
        <SelectField label="Medicamento" required value={form.product_id} onChange={v=>set('product_id',v)} options={optionsFromProducts(products.data)} error={errors.product_id} loading={products.busy}/>
        <Field label="Cantidad" required value={form.quantity} onChange={v=>set('quantity',v)} error={errors.quantity} keyboardType="number-pad"/>
        <Field label="Costo unitario (MXN)" required value={form.unit_cost} onChange={v=>set('unit_cost',v)} error={errors.unit_cost} keyboardType="decimal-pad"/>
        <Field label="Número de lote" required value={form.lot_number} onChange={v=>set('lot_number',v)} error={errors.lot_number} autoCapitalize="characters"/>
        <DateField label="Caducidad" required value={form.expiry_date} onChange={v=>set('expiry_date',v)} error={errors.expiry_date}/>
      </>}
      <FormButtons label={mode==='supplier'?'Guardar proveedor':'Crear orden de compra'} busy={busy} onSave={save} onCancel={()=>setMode('')}/>
    </FormModal>
  </ScrollView>;
}
