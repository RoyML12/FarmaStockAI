import React,{useEffect,useMemo,useState} from 'react';
import {Alert,KeyboardAvoidingView,Platform,RefreshControl,ScrollView,Text,TouchableOpacity,View} from 'react-native';
import {api,getApiUrl,setApiUrl,saveSession} from '../api';
import {C,S} from '../theme';
import {displayAccountName} from '../display';
import {Button,DateField,Empty,ErrorMessage,Field,FormModal,Section,SelectField,StatusBadge} from '../components';
import {asMoney,clean,cleanAssistantText,futureISO,isPositiveInt,money,rules,todayISO,validate} from '../form-utils';
import {PRODUCT_FIELDS,PURCHASE_FIELDS,LOT_FIELDS,optionsFromProducts,toArray,labelOf,useData,action,PageHeading,Record,FormButtons} from './shared';

export default function Settings({session,onLogout}){
  const [url,setUrl]=useState(''),[saving,setSaving]=useState(false);useEffect(()=>{getApiUrl().then(setUrl).catch(()=>{})},[]);
  const save=async()=>{setSaving(true);try{await action(()=>setApiUrl(url),undefined,{success:'Dirección del servidor guardada.'})}finally{setSaving(false)}};
  return <ScrollView contentContainerStyle={S.content}><PageHeading title="Configuración" subtitle="Tu sesión y conexión al servidor."/><Section title="Cuenta"><Text style={{fontWeight:'800',fontSize:16,color:C.ink}}>{displayAccountName(session.user)}</Text><Text style={[S.muted,{marginTop:5}]}>{session.user?.email||''}</Text><Text style={S.small}>Rol: {session.user?.role||'—'}</Text></Section><Section title="Servidor" subtitle="Cambia la URL si ngrok utiliza un dominio diferente."><View style={{gap:12}}><Field label="URL de la API" value={url} onChange={setUrl} placeholder="https://...ngrok-free.dev" autoCapitalize="none" helper="No escribas /api al final. El backend, MySQL y Docker deben estar activos."/><Button loading={saving} onPress={save}>Guardar dirección</Button></View></Section><Button variant="danger" onPress={onLogout}>Cerrar sesión</Button></ScrollView>;
}
