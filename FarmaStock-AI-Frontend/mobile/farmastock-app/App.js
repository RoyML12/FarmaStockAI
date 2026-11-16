import React,{useEffect,useState} from 'react';
import {ActivityIndicator,Text,TouchableOpacity,View} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {SafeAreaProvider,SafeAreaView,useSafeAreaInsets} from 'react-native-safe-area-context';
import {readSession,clearSession} from './src/api';
import {C,S} from './src/theme';
import {displayAccountName} from './src/display';
import AppIcon from './src/icons';
import Login from './src/screens/Login';
import Dashboard from './src/screens/Dashboard';
import Catalog from './src/screens/Catalog';
import Inventory from './src/screens/Inventory';
import Sales from './src/screens/Sales';
import Purchases from './src/screens/Purchases';
import Notifications from './src/screens/Notifications';
import AI from './src/screens/AI';
import Settings from './src/screens/Settings';
import More from './src/screens/More';

const mainTabs=['Inicio','Catálogo','Inventario','Ventas','Más'];
const extra=['Compras','Alertas','IA','Ajustes'];

function AppContent(){
  const insets=useSafeAreaInsets();
  const [session,setSession]=useState(null);
  const [ready,setReady]=useState(false);
  const [tab,setTab]=useState('Inicio');
  useEffect(()=>{readSession().then(setSession).catch(()=>{}).finally(()=>setReady(true))},[]);
  const logout=async()=>{await clearSession();setSession(null);setTab('Inicio')};

  if(!ready) return <SafeAreaView style={[S.screen,S.center]}><ActivityIndicator color={C.green}/></SafeAreaView>;
  if(!session) return <SafeAreaView edges={['top','bottom','left','right']} style={S.screen}>
    <StatusBar style="dark"/><Login onLogin={setSession}/>
  </SafeAreaView>;

  const current=extra.includes(tab)?'Más':tab;
  const pages={
    Inicio:<Dashboard token={session.token} go={setTab}/> ,
    Catálogo:<Catalog token={session.token}/>,
    Inventario:<Inventory token={session.token}/>,
    Ventas:<Sales token={session.token}/>,
    Más:<More go={setTab} session={session}/>,
    Compras:<Purchases token={session.token}/>,
    Alertas:<Notifications token={session.token}/>,
    IA:<AI token={session.token}/>,
    Ajustes:<Settings session={session} onLogout={logout}/>
  };

  return <View style={S.screen}>
    <StatusBar style="light"/>
    <View style={[S.top,{paddingTop:Math.max(insets.top,0)+14}]}>
      <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
        <Text style={S.eyebrow}>FARMASTOCK AI</Text>
        {tab!=='Ajustes'?<TouchableOpacity
          accessibilityRole="button" accessibilityLabel="Abrir ajustes"
          accessibilityHint="Configurar cuenta y conexión al servidor"
          onPress={()=>setTab('Ajustes')}
          style={S.headerAction}
        ><AppIcon name="settings-outline" size={22} color={C.white}/></TouchableOpacity>:null}
      </View>
      <Text style={S.title}>{tab==='Más'?'Tu farmacia':tab}</Text>
      <Text style={S.subtitle}>{displayAccountName(session.user)} · Gestión inteligente</Text>
    </View>
    {extra.includes(tab)?<TouchableOpacity
      accessibilityRole="button" accessibilityLabel="Volver a más herramientas"
      onPress={()=>setTab('Más')}
      style={S.backRow}
    ><AppIcon name="chevron-back" size={19}/><Text style={S.backText}>Volver a Más</Text></TouchableOpacity>:null}
    <View style={{flex:1}}>{pages[tab]}</View>
    <View style={[S.bottomNav,{paddingBottom:Math.max(insets.bottom,10)+3}]}>
      {mainTabs.map(name=>{
        const selected=current===name;
        return <TouchableOpacity
          key={name}
          accessibilityRole="tab" accessibilityLabel={name}
          accessibilityState={{selected}}
          activeOpacity={.75} onPress={()=>setTab(name)}
          style={S.navItem}
        >
          <View style={[S.navIconWrap,selected&&S.navIconWrapActive]}>
            <AppIcon name={name} size={23} color={selected?C.greenDeep:C.muted}/>
          </View>
          <Text numberOfLines={1} style={[S.navLabel,selected&&S.navLabelActive]}>{name}</Text>
        </TouchableOpacity>
      })}
    </View>
  </View>;
}

export default function App(){return <SafeAreaProvider><AppContent/></SafeAreaProvider>}
