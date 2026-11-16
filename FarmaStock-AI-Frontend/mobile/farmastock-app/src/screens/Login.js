import React,{useState} from 'react';
import AppIcon from '../icons';
import {Alert,KeyboardAvoidingView,Modal,Platform,ScrollView,Text,TouchableOpacity,View} from 'react-native';
import {api,getApiUrl,setApiUrl,saveSession} from '../api';
import {C,S} from '../theme';
import {Button,Field,Section} from '../components';
import {clean,rules,validate} from '../form-utils';

// Pantalla de acceso: los parámetros técnicos permanecen ocultos.
// Si el Gateway deja de estar disponible, se ofrece recuperación de conexión.
export default function Login({onLogin}){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [busy,setBusy]=useState(false);
  const [errors,setErrors]=useState({});
  const [connectionVisible,setConnectionVisible]=useState(false);
  const [serverUrl,setServerUrl]=useState('');
  const [serverError,setServerError]=useState('');
  const [savingServer,setSavingServer]=useState(false);

  const openConnection=async()=>{
    setServerError('');
    try{setServerUrl(await getApiUrl()||'')}catch(_){setServerUrl('')}
    setConnectionVisible(true);
  };

  const saveConnection=async()=>{
    setSavingServer(true);
    try{
      await setApiUrl(serverUrl);
      setConnectionVisible(false);
      Alert.alert('Configuración guardada','Ya puedes intentar iniciar sesión nuevamente.');
    }catch(error){
      setServerError(error.message||'Revisa la dirección del servidor.');
    }finally{setSavingServer(false)}
  };

  const login=async()=>{
    const nextErrors=validate({email,password},{
      email:v=>/^\S+@\S+\.\S+$/.test(clean(v))?'':'Introduce un correo válido.',
      password:rules.required('la contraseña')
    });
    setErrors(nextErrors);
    if(Object.keys(nextErrors).length)return;
    setBusy(true);
    try{
      const session=await api('/api/auth/login',{
        method:'POST',body:{email:clean(email),password}
      });
      await saveSession(session);
      onLogin(session);
    }catch(error){
      const message=String(error.message||'No se pudo iniciar sesión.');
      const connectionError=/No se puede conectar al servidor|servidor no está configurado|Network request failed|fetch failed|Failed to fetch/i.test(message);
      if(connectionError){
        Alert.alert('Sin conexión con el servidor',
          'No fue posible contactar FarmaStock AI. Comprueba tu conexión e inténtalo otra vez.',
          [
            {text:'Cerrar',style:'cancel'},
            {text:'Configurar conexión',onPress:openConnection}
          ]
        );
      }else{
        Alert.alert('No se pudo iniciar sesión',message);
      }
    }finally{setBusy(false)}
  };

  return <KeyboardAvoidingView style={S.screen} behavior={Platform.OS==='ios'?'padding':undefined}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{flexGrow:1,justifyContent:'center',padding:22,paddingVertical:38,gap:22}}>
      <View style={{alignItems:'center',gap:8}}>
        <View style={{backgroundColor:C.mint,borderRadius:23,width:78,height:78,justifyContent:'center',alignItems:'center'}}>
          <AppIcon name="medkit-outline" color={C.greenDeep} size={43}/>
        </View>
        <Text style={{fontSize:28,fontWeight:'900',color:C.dark,letterSpacing:-.8}}>FarmaStock AI</Text>
        <Text style={[S.muted,{textAlign:'center'}]}>Control inteligente de inventarios farmacéuticos</Text>
      </View>
      <Section title="Bienvenido" subtitle="Accede de forma segura a tu inventario.">
        <View style={{gap:15}}>
          <Field label="Correo electrónico" value={email} onChange={setEmail} error={errors.email} required keyboardType="email-address" autoCapitalize="none"/>
          <Field label="Contraseña" value={password} onChange={setPassword} error={errors.password} required secure autoCapitalize="none"/>
          <Button onPress={login} loading={busy}>Iniciar sesión</Button>
        </View>
      </Section>
    </ScrollView>

    <Modal visible={connectionVisible} animationType="slide" transparent onRequestClose={()=>setConnectionVisible(false)}>
      <KeyboardAvoidingView style={{flex:1,backgroundColor:'rgba(9,38,27,0.55)',justifyContent:'center',padding:20}} behavior={Platform.OS==='ios'?'padding':undefined}>
        <View style={{backgroundColor:C.white,borderRadius:22,padding:22,gap:14}}>
          <View style={[S.row,{alignItems:'flex-start'}]}>
            <View style={{flex:1}}>
              <Text style={S.cardTitle}>Configuración de conexión</Text>
              <Text style={S.cardSubtitle}>Opciones avanzadas para recuperar el acceso al servidor.</Text>
            </View>
            <TouchableOpacity onPress={()=>setConnectionVisible(false)} accessibilityLabel="Cerrar configuración" accessibilityRole="button" style={{padding:7}}>
              <AppIcon name="close-outline" color={C.muted} size={24}/>
            </TouchableOpacity>
          </View>
          <Field label="Dirección del servidor" value={serverUrl} onChange={setServerUrl} placeholder="https://tu-servidor.example" autoCapitalize="none" error={serverError} helper="Solo cambia esta dirección si el servidor ha cambiado."/>
          <Button onPress={saveConnection} loading={savingServer}>Guardar conexión</Button>
          <Button variant="outline" onPress={()=>setConnectionVisible(false)}>Cancelar</Button>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  </KeyboardAvoidingView>;
}
