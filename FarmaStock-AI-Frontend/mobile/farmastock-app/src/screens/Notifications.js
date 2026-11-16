import React,{useEffect,useMemo,useState} from 'react';
import {Alert,KeyboardAvoidingView,Platform,RefreshControl,ScrollView,Text,TouchableOpacity,View} from 'react-native';
import {api,getApiUrl,setApiUrl,saveSession} from '../api';
import {C,S} from '../theme';
import {Button,DateField,Empty,ErrorMessage,Field,FormModal,Section,SelectField,StatusBadge} from '../components';
import {asMoney,clean,cleanAssistantText,futureISO,isPositiveInt,money,rules,todayISO,validate} from '../form-utils';
import {PRODUCT_FIELDS,PURCHASE_FIELDS,LOT_FIELDS,optionsFromProducts,toArray,labelOf,useData,action,PageHeading,Record,FormButtons} from './shared';

export default function Notifications({token}){
  const list=useData(token,'/api/notifications');
  const mark=async n=>{if(n.is_read)return;try{await api(`/api/notifications/${n.id}/read`,{method:'PATCH',token,body:{}});list.refresh()}catch(e){Alert.alert('No se pudo marcar como leído',e.message)}};
  return <ScrollView contentContainerStyle={S.content} refreshControl={<RefreshControl refreshing={list.busy} onRefresh={list.refresh}/>}><PageHeading title="Alertas" subtitle="Notificaciones de inventario y caducidad."/><ErrorMessage message={list.error} onRetry={list.refresh}/><Section title={`Centro de avisos · ${list.data.length}`}>{list.data.map(n=><TouchableOpacity accessibilityRole="button" accessibilityHint="Marcar notificación como leída" onPress={()=>mark(n)} key={n.id} style={[S.item,{opacity:n.is_read?.7:1,borderLeftWidth:n.is_read?0:3,borderLeftColor:C.green,paddingLeft:n.is_read?0:10}]}><View style={S.row}><Text style={{fontSize:15,fontWeight:'800',color:C.ink,flex:1}}>{n.title}</Text><StatusBadge level={n.priority||n.severity}/></View><Text style={[S.muted,{marginTop:7}]}>{n.message}</Text><Text style={[S.small,{marginTop:7}]}>{n.is_read?'Leída':'Sin leer · Toca para marcar'} · {String(n.created_at||'').slice(0,16).replace('T',' ')}</Text></TouchableOpacity>)}{!list.data.length&&<Empty message="No hay alertas pendientes." icon="notifications-outline"/>}</Section></ScrollView>;
}
