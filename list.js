import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

/* --- Sabitler --- */
const BLUE = '#E6F2FF';
const BOX_GAP = 8;      // kutular arası boşluk
const BOX_PAD = 8;      // kutu içi padding
const PICKER_H = 56;    // picker yüksekliği – descender sorunu çözülür

export default function ListScreen() {
  const nav = useNavigation();
  useEffect(() => nav.setOptions({ title: 'Listeleme' }), [nav]);

  const [bills, setBills] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [viewData, setViewData] = useState([]);

  /* ----- Filtre State'leri ----- */
  const [master, setMaster] = useState('Hepsi');
  const [dateFilter, setDateFilter] = useState('Hepsi');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState('start');
  const [startD, setStartD] = useState(new Date());
  const [endD, setEndD]   = useState(new Date());
  const [minAmt, setMinAmt] = useState('');
  const [maxAmt, setMaxAmt] = useState('');
  const [subCat, setSubCat] = useState('');

  const billCats = ['Su','Elektrik','Doğalgaz','Kira','Telefon','Diğer'];
  const expCats  = ['Market','Alışveriş','Eğlence','Sosyal','Ulaşım','Diğer'];

  /* --------------- Veri Yükle --------------- */
  const load = async () => {
    const b = await AsyncStorage.getItem('@faturalar');
    const e = await AsyncStorage.getItem('@harcamalar');
    setBills(b?JSON.parse(b):[]); setExpenses(e?JSON.parse(e):[]);
  };

  /* --------------- Filtrele --------------- */
  const filter = useCallback(()=>{
    let data = master==='Faturalar'?bills: master==='Harcamalar'?expenses:[...bills,...expenses];
    const now=new Date();
    data=data.filter(it=>{
      const t=new Date(it.tarih);
      if(dateFilter==='7G')return now-t<=7*864e5;
      if(dateFilter==='BUAY')return t.getMonth()===now.getMonth()&&t.getFullYear()===now.getFullYear();
      if(dateFilter==='CUSTOM')return t>=startD&&t<=endD;return true;
    }).filter(it=>{
      const m=parseFloat(it.miktar)||0;
      const okMin=minAmt?m>=parseFloat(minAmt):true;
      const okMax=maxAmt?m<=parseFloat(maxAmt):true;
      return okMin&&okMax;
    });
    if(subCat) data=data.filter(it=>(it.kategori||it.baslik)===subCat);
    data.sort((a,b)=>new Date(b.tarih)-new Date(a.tarih));
    setViewData(data);
  },[bills,expenses,master,dateFilter,startD,endD,minAmt,maxAmt,subCat]);

  useFocusEffect(useCallback(()=>{load();},[]));
  useEffect(()=>{filter();},[filter]);

  /* --------------- Ödenme Toggle --------------- */
  const togglePaid=async(id,s)=>{const upd=bills.map(b=>b.id===id?{...b,odendiMi:s}:b);setBills(upd);await AsyncStorage.setItem('@faturalar',JSON.stringify(upd));};

  /* --------------- Render Row --------------- */
  const renderRow=({item})=>{
    const bill=item.hasOwnProperty('odendiMi');
    return(
      <View style={styles.row}>
        <View style={{flex:1}}>
          <Text style={styles.rTitle}>{item.baslik||item.kategori}</Text>
          <Text style={styles.rSub}>{new Date(item.tarih).toLocaleDateString()} · {parseFloat(item.miktar).toFixed(2)} TL</Text>
        </View>
        {bill&&<Pressable style={[styles.chk,item.odendiMi&&styles.chkOn]} onPress={()=>togglePaid(item.id,!item.odendiMi)}/>}  
      </View>
    );};

  /* --------------- UI --------------- */
  return(
    <View style={styles.container}>
      {/* 1 */}
      <View style={styles.boxSm}>
        <Text style={styles.bTitle}>Kayıt Türü</Text>
        <Picker selectedValue={master} onValueChange={v=>{setMaster(v);setSubCat('');}} style={styles.picker}>
          <Picker.Item label="Hepsi" value="Hepsi" />
          <Picker.Item label="Faturalar" value="Faturalar" />
          <Picker.Item label="Harcamalar" value="Harcamalar" />
        </Picker>
      </View>
      {/* 2 */}
      <View style={styles.boxSm}>
        <Text style={styles.bTitle}>Tarih Filtresi</Text>
        <Picker selectedValue={dateFilter} onValueChange={v=>{setDateFilter(v); if(v!=='CUSTOM')setPickerVisible(false);}} style={styles.picker}>
          <Picker.Item label="Hepsi" value="Hepsi" />
          <Picker.Item label="Son 7 Gün" value="7G" />
          <Picker.Item label="Bu Ay" value="BUAY" />
          <Picker.Item label="Özel Aralık" value="CUSTOM" />
        </Picker>
        {dateFilter==='CUSTOM'&&(
          <View style={styles.dateRow}>
            <Pressable style={styles.dateBtn} onPress={()=>{setPickerTarget('start');setPickerVisible(true);}}><Text>{startD.toLocaleDateString()}</Text></Pressable>
            <Text> - </Text>
            <Pressable style={styles.dateBtn} onPress={()=>{setPickerTarget('end');setPickerVisible(true);}}><Text>{endD.toLocaleDateString()}</Text></Pressable>
          </View>
        )}
      </View>
      {pickerVisible&&(
        <DateTimePicker value={pickerTarget==='start'?startD:endD} mode="date" display={Platform.OS==='ios'?'spinner':'default'} onChange={(e,sel)=>{if(!sel){setPickerVisible(false);return;}pickerTarget==='start'?setStartD(sel):setEndD(sel);setPickerVisible(false);}} />
      )}
      {/* 3 */}
      <View style={styles.boxSm}>
        <Text style={styles.bTitle}>Tutara Göre Listele (TL)</Text>
        <View style={styles.amountRow}>
          <TextInput style={styles.aInput} placeholder="Min" value={minAmt} keyboardType="numeric" onChangeText={setMinAmt}/>
          <Text> - </Text>
          <TextInput style={styles.aInput} placeholder="Max" value={maxAmt} keyboardType="numeric" onChangeText={setMaxAmt}/>
          <Pressable style={styles.fBtn} onPress={filter}><Text>Filtrele</Text></Pressable>
        </View>
      </View>
      {/* 4 */}
      <View style={styles.boxSm}>
        <Text style={styles.bTitle}>Kategoriye Göre</Text>
        {master==='Hepsi'?<Text style={styles.info}>Önce kayıt türü seçin</Text>:(
          <Picker selectedValue={subCat} onValueChange={setSubCat} style={styles.picker}>
            <Picker.Item label="Tümü" value="" />
            {(master==='Faturalar'?billCats:expCats).map(c=>(<Picker.Item key={c} label={c} value={c}/>))}
          </Picker>
        )}
      </View>
      {/* 5 Büyük Liste */}
      <View style={styles.boxLg}>
        <FlatList data={viewData} renderItem={renderRow} keyExtractor={it=>it.id} ListEmptyComponent={<Text style={styles.info}>Kayıt yok</Text>} />
      </View>
    </View>
  );
}

/* ------------ Styles ------------ */
const styles = StyleSheet.create({
  container:{flex:1,padding:BOX_GAP},
  /* Kutular */
  boxSm:{backgroundColor:'#F9F9F9',borderWidth:1,borderColor:'#CCC',borderRadius:8,padding:BOX_PAD,marginBottom:BOX_GAP},
  boxLg:{flex:1,backgroundColor:'#F9F9F9',borderWidth:1,borderColor:'#CCC',borderRadius:8,padding:BOX_PAD,marginBottom:BOX_GAP},
  bTitle:{fontWeight:'bold',marginBottom:4},
  picker:{height:PICKER_H,width:'100%'},
  /* Tarih */
  dateRow:{flexDirection:'row',alignItems:'center',marginTop:4},
  dateBtn:{backgroundColor:BLUE,paddingVertical:6,paddingHorizontal:8,borderRadius:6},
  /* Tutar */
  amountRow:{flexDirection:'row',alignItems:'center'},
  aInput:{borderWidth:1,borderColor:'#AAA',borderRadius:6,padding:6,width:70,textAlign:'center'},
  fBtn:{backgroundColor:BLUE,paddingVertical:6,paddingHorizontal:10,borderRadius:6,marginLeft:4},
  /* Liste satırı */
  row:{flexDirection:'row',alignItems:'center',borderBottomWidth:1,borderColor:'#DDD',paddingVertical:6},
  rTitle:{fontWeight:'bold'},
  rSub:{fontSize:12,color:'#555'},
  chk:{width:22,height:22,borderWidth:1,borderColor:'#555',borderRadius:4},
  chkOn:{backgroundColor:'#4caf50'},
  info:{fontSize:12,color:'#666',marginTop:4},
});