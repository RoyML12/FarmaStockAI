import React,{useEffect,useMemo,useState} from 'react';
import AppIcon from '../icons';
import {Alert,KeyboardAvoidingView,Platform,RefreshControl,ScrollView,Text,TouchableOpacity,View} from 'react-native';
import {api,getApiUrl,setApiUrl,saveSession} from '../api';
import {C,S} from '../theme';
import {Button,DateField,Empty,ErrorMessage,Field,FormModal,Section,SelectField,StatusBadge} from '../components';
import {asMoney,clean,cleanAssistantText,futureISO,isPositiveInt,money,rules,todayISO,validate} from '../form-utils';
import {PRODUCT_FIELDS,PURCHASE_FIELDS,LOT_FIELDS,optionsFromProducts,toArray,labelOf,useData,action,PageHeading,Record,FormButtons} from './shared';

export default function More({go,session}){
  const tiles=[['Compras','bag-handle-outline','Proveedores y pedidos',C.mint,C.greenDeep],['Alertas','notifications-outline','Avisos y notificaciones',C.amberSoft,C.amber],['IA','sparkles-outline','Caducidades y asistente',C.blueSoft,C.blue],['Ajustes','settings-outline','Conexión y perfil',C.faint,C.greenDeep]];
  return <ScrollView contentContainerStyle={S.content}><PageHeading title="Más herramientas" subtitle="Todo lo necesario para administrar FarmaStock."/><Section title="Módulos">{tiles.map(([name,icon,description,bg,ink])=><TouchableOpacity key={name} accessibilityRole="button" onPress={()=>go(name)} style={[S.item,S.row]}><View style={{backgroundColor:bg,borderRadius:13,width:45,height:45,alignItems:'center',justifyContent:'center'}}><AppIcon name={icon} size={25} color={ink}/></View><View style={{flex:1}}><Text style={{fontSize:16,fontWeight:'800',color:C.ink}}>{name}</Text><Text style={S.small}>{description}</Text></View><AppIcon name="chevron-forward" size={22} color={C.green}/></TouchableOpacity>)}</Section></ScrollView>;
}
