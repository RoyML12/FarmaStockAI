import React,{useCallback,useEffect,useMemo,useState} from 'react';
import {RefreshControl,ScrollView,Text,TouchableOpacity,View} from 'react-native';
import AppIcon from '../icons';
import {api} from '../api';
import {C,S} from '../theme';
import {Empty,ErrorMessage,Section} from '../components';
import {toArray,PageHeading,Record} from './shared';

const paths=['/api/catalog/products','/api/inventory/stock','/api/notifications','/api/ai/risks','/api/sales'];

function MetricTile({label,value,icon,tone='green',onPress}) {
  const tones={
    green:{bg:C.mint,ink:C.greenDeep},
    blue:{bg:C.blueSoft,ink:C.blue},
    amber:{bg:C.amberSoft,ink:C.amber},
    red:{bg:C.redSoft,ink:C.red},
  };
  const t=tones[tone]||tones.green;
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${label}: ${value}`} onPress={onPress} activeOpacity={.78} style={S.metricTile}>
    <View style={S.row}>
      <View style={[S.iconTile,{backgroundColor:t.bg}]}><AppIcon name={icon} color={t.ink} size={18}/></View>
      <AppIcon name="chevron-forward" size={15} color={C.muted}/>
    </View>
    <View>
      <Text style={[S.metric,{color:tone==='red'?C.red:C.ink}]} numberOfLines={1}>{value}</Text>
      <Text style={S.metricLabel} numberOfLines={2}>{label}</Text>
    </View>
  </TouchableOpacity>;
}

function Shortcut({icon,title,onPress}) {
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={title} onPress={onPress} activeOpacity={.75} style={S.quickTile}>
    <AppIcon name={icon} size={23} color={C.greenDeep}/>
    <Text style={{fontSize:12,fontWeight:'800',color:C.ink,textAlign:'center'}} numberOfLines={2}>{title}</Text>
  </TouchableOpacity>;
}

export default function Dashboard({token,go}) {
  const [data,setData]=useState({products:[],stock:[],notifications:[],risks:[],sales:[]});
  const [busy,setBusy]=useState(false);
  const [loaded,setLoaded]=useState(false);
  const [failed,setFailed]=useState(0);
  const refresh=useCallback(async()=>{
    setBusy(true);
    try{
      const responses=await Promise.allSettled(paths.map(p=>api(p,{token})));
      setFailed(responses.filter(x=>x.status==='rejected').length);
      const results=responses.map(x=>toArray(x.status==='fulfilled'?x.value:[]));
      setData({products:results[0],stock:results[1],notifications:results[2],risks:results[3],sales:results[4]});
      setLoaded(true);
    }finally{setBusy(false)}
  },[token]);
  useEffect(()=>{refresh()},[refresh]);

  const counts=useMemo(()=>({
    products:data.products.length,
    available:data.stock.reduce((n,x)=>n+Number(x.available||0),0),
    unread:data.notifications.filter(x=>!x.is_read).length,
    high:data.risks.filter(x=>x.risk_level==='high').length
  }),[data]);
  const focus=counts.high>0?{
    title:`${counts.high} ${counts.high===1?'lote requiere':'lotes requieren'} atención`,
    subtitle:'Revisa los riesgos de caducidad y prioriza los lotes más próximos a vencer.',
    icon:'alert-circle-outline',tone:'red',destination:'IA'
  }:counts.unread>0?{
    title:`Tienes ${counts.unread} ${counts.unread===1?'aviso sin leer':'avisos sin leer'}`,
    subtitle:'Consulta el centro de notificaciones para revisar los movimientos.',
    icon:'notifications-outline',tone:'amber',destination:'Alertas'
  }:{
    title:'Resumen actualizado',
    subtitle:'Consulta tus existencias o registra un nuevo movimiento.',
    icon:'checkmark-circle-outline',tone:'green',destination:'Inventario'
  };
  const bannerColors=focus.tone==='red'?[C.redSoft,C.red]:focus.tone==='amber'?[C.amberSoft,C.amber]:[C.mint,C.greenDeep];

  return <ScrollView contentContainerStyle={S.content} refreshControl={<RefreshControl refreshing={busy} onRefresh={refresh}/> }>
    <PageHeading title="Tu farmacia" subtitle="Indicadores principales y movimientos recientes."/>
    {failed>0?<ErrorMessage message={`${failed} módulo(s) no respondieron. Algunas cifras podrían estar incompletas.`} onRetry={refresh}/>:null}
    <View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',rowGap:10}}>
      <MetricTile label="Medicamentos" value={counts.products} icon="medkit-outline" onPress={()=>go('Catálogo')}/>
      <MetricTile label="Unidades disponibles" value={counts.available} icon="cube-outline" tone="blue" onPress={()=>go('Inventario')}/>
      <MetricTile label="Avisos sin leer" value={counts.unread} icon="notifications-outline" tone={counts.unread?'amber':'green'} onPress={()=>go('Alertas')}/>
      <MetricTile label="Riesgos altos" value={counts.high} icon="alert-circle-outline" tone={counts.high?'red':'green'} onPress={()=>go('IA')}/>
    </View>
    {loaded&&failed===0?<TouchableOpacity accessibilityRole="button" onPress={()=>go(focus.destination)} activeOpacity={.78} style={[S.insight,{backgroundColor:bannerColors[0],borderColor:bannerColors[0]}]}>
      <View style={[S.iconTile,{width:43,height:43,borderRadius:14,backgroundColor:C.white}]}><AppIcon name={focus.icon} color={bannerColors[1]} size={25}/></View>
      <View style={{flex:1,gap:3}}><Text style={{fontWeight:'900',fontSize:14,color:C.ink}}>{focus.title}</Text><Text style={{fontSize:12,lineHeight:17,color:C.muted}}>{focus.subtitle}</Text></View>
      <AppIcon name="chevron-forward" color={bannerColors[1]} size={18}/>
    </TouchableOpacity>:null}
    <Section title="Acciones rápidas" subtitle="Accede directamente a las tareas frecuentes.">
      <View style={{flexDirection:'row',justifyContent:'space-between',gap:8}}>
        <Shortcut icon="add-circle-outline" title="Medicamentos" onPress={()=>go('Catálogo')}/>
        <Shortcut icon="cart-outline" title="Nueva venta" onPress={()=>go('Ventas')}/>
        <Shortcut icon="sparkles-outline" title="Caducidades" onPress={()=>go('IA')}/>
      </View>
    </Section>
    <Section title="Avisos recientes" action={<TouchableOpacity accessibilityRole="button" onPress={()=>go('Alertas')} style={{paddingVertical:4}}><Text style={{color:C.greenDeep,fontWeight:'800',fontSize:13}}>Ver todos</Text></TouchableOpacity>}>
      {data.notifications.slice(0,3).map(n=><Record key={n.id} title={n.title} subtitle={n.message} badge={n.priority||n.severity}/>)}
      {!data.notifications.length?<Empty message="Sin notificaciones por mostrar." icon="notifications-outline"/>:null}
    </Section>
  </ScrollView>;
}
