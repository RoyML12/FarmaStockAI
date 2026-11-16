import React,{createContext,useContext,useEffect,useMemo,useState} from 'react';
import AppIcon from './icons';
import {ActivityIndicator,FlatList,Keyboard,KeyboardAvoidingView,Modal,Platform,ScrollView,StyleSheet,Text,TextInput,TouchableOpacity,View} from 'react-native';
import {C,S} from './theme';
import {validISODate,todayISO} from './form-utils';

export function Button({children,onPress,variant='primary',disabled=false,loading=false,style}){
  const key=['primary','secondary','outline','danger'].includes(variant)?variant:'primary';
  return <TouchableOpacity accessibilityRole="button" accessibilityState={{disabled:disabled||loading,busy:loading}} activeOpacity={.8} disabled={disabled||loading} onPress={onPress} style={[S[key],style,(disabled||loading)&&{opacity:.52}]}>
    <View style={{flexDirection:'row',alignItems:'center',gap:9}}>{loading&&<ActivityIndicator size="small" color={key==='primary'?C.white:C.green}/>}<Text style={S[key+'Text']}>{children}</Text></View>
  </TouchableOpacity>;
}
export function Section({title,subtitle,action,children,style}){
  return <View style={[S.card,style]}><View style={[S.row,{marginBottom:subtitle?12:11,alignItems:'flex-start'}]}><View style={{flex:1}}><Text style={S.cardTitle}>{title}</Text>{subtitle?<Text style={S.cardSubtitle}>{subtitle}</Text>:null}</View>{action}</View>{children}</View>;
}
export function ErrorMessage({message,onRetry}){
  if(!message)return null;
  return <View style={S.error}><Text style={S.errorText}>{message}</Text>{onRetry?<TouchableOpacity accessibilityRole="button" onPress={onRetry} style={{marginTop:8}}><Text style={{color:C.red,fontWeight:'800'}}>Reintentar ↻</Text></TouchableOpacity>:null}</View>;
}
export function Empty({message='Todavía no hay registros.',icon='file-tray-outline'}){
  return <View style={{alignItems:'center',paddingVertical:24,gap:9}}><AppIcon name={icon} size={30} color={C.muted}/><Text style={[S.muted,{textAlign:'center'}]}>{message}</Text></View>;
}
export function Field({label,value,onChange,placeholder,secure=false,keyboardType='default',error,helper,required=false,multiline=false,autoCapitalize='sentences',maxLength,editable=true}){
  const [focused,setFocused]=useState(false);
  return <View><Text style={S.label}>{label}{required?<Text style={{color:C.red}}> *</Text>:null}</Text>
    <TextInput accessibilityLabel={label} style={[S.input,focused&&S.inputFocused,error&&S.inputError,multiline&&{height:94,textAlignVertical:'top'}]} value={String(value??'')} onChangeText={onChange} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} placeholder={placeholder||label} placeholderTextColor="#84998E" secureTextEntry={secure} keyboardType={keyboardType} multiline={multiline} autoCapitalize={autoCapitalize} maxLength={maxLength} editable={editable} autoCorrect={false}/>
    {error?<View style={{flexDirection:'row',alignItems:'flex-start',gap:5,marginTop:5}}><AppIcon name="alert-circle-outline" size={15} color={C.red}/><Text style={[S.formError,{flex:1,marginTop:0}]}>{error}</Text></View>:helper?<Text style={S.helper}>{helper}</Text>:null}
  </View>;
}
export function StatusBadge({level}){
  const val=String(level||'').toLowerCase();
  const types={high:['Alto',C.red,C.redSoft],critical:['Crítico',C.red,C.redSoft],medium:['Medio',C.amber,C.amberSoft],warning:['Aviso',C.amber,C.amberSoft],low:['Bajo',C.greenDeep,C.mint],info:['Info',C.blue,C.blueSoft],completed:['Completada',C.greenDeep,C.mint],pending:['Pendiente',C.amber,C.amberSoft]};
  const [label,ink,bg]=types[val]||[level||'Estado',C.muted,C.faint];
  return <View accessibilityLabel={`Estado: ${label}`} style={[S.chip,{backgroundColor:bg}]}><View style={{width:6,height:6,borderRadius:3,backgroundColor:ink}}/><Text style={[S.chipText,{color:ink}]}>{label}</Text></View>;
}
// El selector se presenta POR ENCIMA del formulario, no dentro del ScrollView.
// Se reutiliza el mismo modal nativo existente (FormModal) para evitar
// problemas de superposición de Modals anidados en Android.
const SelectOverlayContext = createContext(null);

function SelectOverlay({config,onClose}){
  const [search,setSearch]=useState('');
  const {label,options,searchable,value,onChange}=config;
  const results=useMemo(()=>{
    const term=search.trim().toLocaleLowerCase();
    return !term?options:options.filter(item=>
      (String(item.label)+' '+String(item.subtitle||'')).toLocaleLowerCase().includes(term)
    );
  },[options,search]);
  const choose=item=>{
    Keyboard.dismiss();
    onChange(String(item.value));
    onClose();
  };
  return <View style={[StyleSheet.absoluteFillObject,{zIndex:50,justifyContent:'flex-end'}]}>
    <TouchableOpacity accessibilityLabel="Cerrar selector" accessibilityRole="button" activeOpacity={1} onPress={()=>{Keyboard.dismiss();onClose()}} style={{flex:1,backgroundColor:'rgba(7,35,25,0.42)'}}/>
    <View style={{height:'78%',minHeight:270,backgroundColor:C.white,borderTopLeftRadius:24,borderTopRightRadius:24,paddingHorizontal:18,paddingTop:10,paddingBottom:18}}>
      <View style={{height:4,width:42,borderRadius:3,backgroundColor:C.border,alignSelf:'center',marginBottom:14}}/>
      <View style={[S.row,{marginBottom:14}]}>
        <View style={{flex:1}}>
          <Text style={[S.cardTitle,{fontSize:20}]}>Seleccionar {label.toLocaleLowerCase()}</Text>
          <Text style={S.small}>{options.length} {options.length===1?'opción disponible':'opciones disponibles'}</Text>
        </View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Cerrar lista" onPress={()=>{Keyboard.dismiss();onClose()}} style={{padding:10}}>
          <View style={{flexDirection:'row',alignItems:'center',gap:5}}><Text style={{color:C.greenDeep,fontWeight:'800',fontSize:15}}>Cerrar</Text><AppIcon name="close" color={C.greenDeep} size={19}/></View>
        </TouchableOpacity>
      </View>
      {searchable?<TextInput
        accessibilityLabel={`Buscar ${label}`}
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar por nombre o código..."
        placeholderTextColor="#91A39A"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        style={[S.input,{backgroundColor:C.bg,marginBottom:10}]}
      />:null}
      <FlatList
        data={results}
        style={{flex:1}}
        contentContainerStyle={{paddingBottom:16,flexGrow:results.length?0:1}}
        keyboardShouldPersistTaps="always"
        keyExtractor={(item,index)=>String(item.value)+'-'+index}
        renderItem={({item})=>{
          const selected=String(item.value)===String(value);
          return <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{selected}}
            accessibilityLabel={`${item.label}${item.subtitle?', '+item.subtitle:''}`}
            onPress={()=>choose(item)}
            style={[S.item,S.row,{paddingHorizontal:12,paddingVertical:15,borderRadius:11},selected&&{backgroundColor:C.mint,borderLeftWidth:3,borderLeftColor:C.green}]}
          >
            <View style={{flex:1,gap:3}}>
              <Text style={{color:C.ink,fontWeight:'800',fontSize:15}}>{item.label}</Text>
              {item.subtitle?<Text style={S.small}>{item.subtitle}</Text>:null}
            </View>
            {selected?<AppIcon name="checkmark-circle" size={22} color={C.greenDeep}/>:null}
          </TouchableOpacity>;
        }}
        ListEmptyComponent={<Empty icon="search-outline" message="No encontramos opciones. Cambia la búsqueda."/>}
      />
    </View>
  </View>;
}

export function FormModal({visible,title,subtitle,children,onClose}){
  const [picker,setPicker]=useState(null);
  useEffect(()=>{if(!visible)setPicker(null)},[visible]);
  const closeForm=()=>{
    if(picker){Keyboard.dismiss();setPicker(null)}
    else onClose?.();
  };
  return <Modal visible={visible} animationType="slide" onRequestClose={closeForm} statusBarTranslucent={false}>
    <SelectOverlayContext.Provider value={setPicker}>
      <KeyboardAvoidingView style={S.modal} behavior={Platform.OS==='ios'?'padding':undefined}>
        <View style={S.modalHeader}>
          <View style={S.row}>
            <Text style={S.modalTitle}>{title}</Text>
            <TouchableOpacity accessibilityLabel="Cerrar formulario" accessibilityRole="button" onPress={closeForm} style={{padding:8}}>
              <View style={{flexDirection:'row',alignItems:'center',gap:5}}><Text style={{color:C.muted,fontWeight:'800'}}>Cerrar</Text><AppIcon name="close" color={C.muted} size={19}/></View>
            </TouchableOpacity>
          </View>
          {subtitle?<Text style={S.cardSubtitle}>{subtitle}</Text>:null}
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={S.modalBody}>{children}</ScrollView>
        {picker?<SelectOverlay config={picker} onClose={()=>setPicker(null)}/>:null}
      </KeyboardAvoidingView>
    </SelectOverlayContext.Provider>
  </Modal>;
}

export function SelectField({label,value,onChange,options=[],placeholder='Seleccionar opción',required=false,error,helper,disabled=false,searchable=true,loading=false}){
  const openOverlay=useContext(SelectOverlayContext);
  const selected=options.find(x=>String(x.value)===String(value));
  return <View>
    <Text style={S.label}>{label}{required?<Text style={{color:C.red}}> *</Text>:null}</Text>
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Abre una lista para buscar y elegir una opción"
      disabled={disabled||loading}
      onPress={()=>openOverlay?.({label,value,onChange,options,searchable})}
      activeOpacity={.75}
      style={[S.input,S.row,error&&S.inputError,(disabled||loading)&&{opacity:.55}]}
    >
      <Text numberOfLines={1} style={{color:selected?C.ink:C.muted,fontSize:15,flex:1}}>
        {loading?'Cargando...':selected?.label||placeholder}
      </Text>
      <AppIcon name="chevron-down" size={19} color={C.green}/>
    </TouchableOpacity>
    {error?<Text style={S.formError}>{error}</Text>:helper?<Text style={S.helper}>{helper}</Text>:null}
  </View>;
}

// Calendario propio: sin bibliotecas nativas adicionales ni fechas escritas manualmente.
export function DateField({label,value,onChange,error,helper,required=false,minDate=todayISO()}){
  const [open,setOpen]=useState(false);
  const parsed=validISODate(value)?value.split('-').map(Number):null;
  const [year,setYear]=useState(parsed?.[0]||new Date().getFullYear());
  const [month,setMonth]=useState((parsed?.[1]||new Date().getMonth()+1)-1);
  useEffect(()=>{if(open){const p=validISODate(value)?value.split('-').map(Number):null;setYear(p?.[0]||new Date().getFullYear());setMonth((p?.[1]||new Date().getMonth()+1)-1)}},[open,value]);
  const names=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const days=new Date(year,month+1,0).getDate();
  const offset=(new Date(year,month,1).getDay()+6)%7;
  const iso=day=>`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  const move=delta=>{const d=new Date(year,month+delta,1);setYear(d.getFullYear());setMonth(d.getMonth())};
  const visibleDays=Array.from({length:Math.ceil((offset+days)/7)*7},(_,i)=>i-offset+1);
  // Calendario desplegable en línea, seguro dentro de un modal Android.
  return <View><Text style={S.label}>{label}{required?<Text style={{color:C.red}}> *</Text>:null}</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel={'Elegir '+label} onPress={()=>setOpen(x=>!x)} style={[S.input,S.row,error&&S.inputError]}><Text style={{fontSize:15,color:value?C.ink:C.muted}}>{value&&validISODate(value)?`${value.slice(8,10)}/${value.slice(5,7)}/${value.slice(0,4)}`:(value||'Elegir fecha')}</Text><AppIcon name="calendar-outline" size={21} color={C.green}/></TouchableOpacity>{error?<Text style={S.formError}>{error}</Text>:helper?<Text style={S.helper}>{helper}</Text>:null}
    {open?<View style={[S.card,{marginTop:8,padding:12}]}>
      <View style={[S.row,{marginBottom:15}]}><TouchableOpacity accessibilityRole="button" accessibilityLabel="Mes anterior" onPress={()=>move(-1)} style={{padding:8}}><AppIcon name="chevron-back" size={21} color={C.green}/></TouchableOpacity><Text style={{fontWeight:'800',color:C.ink,fontSize:16,textTransform:'capitalize'}}>{names[month]} {year}</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel="Mes siguiente" onPress={()=>move(1)} style={{padding:8}}><AppIcon name="chevron-forward" size={21} color={C.green}/></TouchableOpacity></View>
      <View style={{flexDirection:'row',marginBottom:7}}>{['L','M','M','J','V','S','D'].map((d,i)=><Text key={i} style={{flex:1,textAlign:'center',fontSize:12,fontWeight:'800',color:C.muted}}>{d}</Text>)}</View>
      <View style={{flexDirection:'row',flexWrap:'wrap'}}>{visibleDays.map((d,i)=>{const valid=d>=1&&d<=days;const date=valid?iso(d):'';const blocked=!valid||date<minDate;return <TouchableOpacity key={i} accessibilityRole="button" accessibilityLabel={date||'Día vacío'} disabled={blocked} onPress={()=>{onChange(date);setOpen(false)}} style={{width:'14.2857%',height:42,justifyContent:'center',alignItems:'center',borderRadius:11,backgroundColor:value===date&&valid?C.green:'transparent',opacity:blocked?.25:1}}><Text style={{color:value===date&&valid?C.white:C.ink,fontWeight:valid?'700':'400'}}>{valid?d:''}</Text></TouchableOpacity>})}</View>
      <Text style={[S.small,{marginTop:10}]}>Fechas a partir de {minDate}.</Text><Button variant="outline" onPress={()=>setOpen(false)}>Cerrar calendario</Button>
    </View>:null}
  </View>;
}
