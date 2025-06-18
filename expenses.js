import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

/**
 * ExpensesScreen – Harcama Ekle
 */
export default function ExpensesScreen({ navigation }) {
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [payment, setPayment] = useState('');
  const [installment, setInstallment] = useState('Tek Çekim');
  const [customInstallment, setCustomInstallment] = useState('');

  const handleSave = async () => {
    if (!category) return Alert.alert('Hata', 'Kategori seçin.');
    if (category === 'Diğer' && !customCategory.trim()) return Alert.alert('Hata', 'Kategori adı girin.');
    if (!amount) return Alert.alert('Hata', 'Tutar girin.');

    const taksitSecimi = payment === 'Kredi Kartı'
      ? (installment === 'Diğer' ? customInstallment.trim() || 'N/A' : installment)
      : 'N/A';

    const newExp = {
      id: Date.now().toString(),
      kategori: category === 'Diğer' ? customCategory.trim() : category,
      aciklama: description.trim(),
      miktar: parseFloat(amount),
      tarih: date.toISOString(),
      odemeYontemi: payment || 'Belirtilmedi',
      taksit: taksitSecimi,
    };

    try {
      const stored = await AsyncStorage.getItem('@harcamalar');
      const list = stored ? JSON.parse(stored) : [];
      list.push(newExp);
      await AsyncStorage.setItem('@harcamalar', JSON.stringify(list));
      Alert.alert('Başarılı', 'Harcama kaydedildi!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Hata', 'Kaydedilemedi.');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView>
        <Text style={styles.label}>Kategori</Text>
        <View style={styles.pickerWrapper}>
          <Picker selectedValue={category} onValueChange={setCategory} style={styles.picker}>
            <Picker.Item label="Kategori Seçin" value="" />
            <Picker.Item label="Market" value="Market" />
            <Picker.Item label="Alışveriş" value="Alışveriş" />
            <Picker.Item label="Eğlence" value="Eğlence" />
            <Picker.Item label="Sosyal" value="Sosyal" />
            <Picker.Item label="Ulaşım" value="Ulaşım" />
            <Picker.Item label="Diğer" value="Diğer" />
          </Picker>
        </View>
        {category === 'Diğer' && (
          <TextInput
            style={styles.input}
            placeholder="Örn: Ev, Sağlık"
            value={customCategory}
            onChangeText={setCustomCategory}
          />
        )}

        <Text style={styles.label}>Açıklama</Text>
        <TextInput
          style={styles.input}
          placeholder="Harcama açıklaması"
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Tutar</Text>
        <View style={styles.amountRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="0.00"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <Text style={styles.currency}>₺</Text>
        </View>

        <Text style={styles.label}>Tarih</Text>
        <Pressable style={styles.dateBox} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
        </Pressable>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(e, sel) => {
              setShowDatePicker(false);
              if (sel) setDate(sel);
            }}
          />
        )}

        <Text style={styles.label}>Ödeme Yöntemi (İsteğe Bağlı)</Text>
        <View style={styles.pickerWrapper}>
          <Picker selectedValue={payment} onValueChange={setPayment} style={styles.picker}>
            <Picker.Item label="Seçiniz" value="" />
            <Picker.Item label="Kredi Kartı" value="Kredi Kartı" />
            <Picker.Item label="Nakit" value="Nakit" />
          </Picker>
        </View>
        {payment === 'Kredi Kartı' && (
          <>
            <View style={styles.pickerWrapper}>
              <Picker selectedValue={installment} onValueChange={setInstallment} style={styles.picker}>
                <Picker.Item label="Tek Çekim" value="Tek Çekim" />
                <Picker.Item label="3 Ay" value="3 Ay" />
                <Picker.Item label="6 Ay" value="6 Ay" />
                <Picker.Item label="Diğer" value="Diğer" />
              </Picker>
            </View>
            {installment === 'Diğer' && (
              <TextInput
                style={styles.input}
                placeholder="Örn: 9 Ay, 12 Ay"
                value={customInstallment}
                onChangeText={setCustomInstallment}
              />
            )}
          </>
        )}

        <View style={styles.btnRow}>
          <Pressable style={[styles.btn, styles.cancel]} onPress={() => navigation.goBack()}>
            <Text style={styles.btnText}>İptal</Text>
          </Pressable>
          <Pressable style={[styles.btn, styles.save]} onPress={handleSave}>
            <Text style={styles.btnText}>Kaydet</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const BLUE = '#E6F2FF';
const RED  = '#FFCCCC';

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 14, fontFamily: 'SpaceMono' },
  pickerWrapper: { borderWidth:1, borderColor:'#AAA', borderRadius:8, marginTop:5, height:60, justifyContent:'center', overflow:'hidden' },
  picker: { height:60, width:'100%' },
  input: { borderWidth:1, borderColor:'#AAA', borderRadius:8, padding:10, marginTop:5, fontFamily:'SpaceMono' },
  amountRow: { flexDirection:'row', alignItems:'center' },
  currency: { marginLeft:8, fontSize:18, fontWeight:'bold' },
  dateBox: { backgroundColor:BLUE, borderRadius:8, paddingVertical:14, paddingHorizontal:12, marginTop:5, borderWidth:1, borderColor:'#AAA' },
  dateText: { fontSize:16, fontFamily:'SpaceMono' },
  btnRow: { flexDirection:'row', justifyContent:'space-between', marginTop:30 },
  btn: { flex:1, paddingVertical:14, borderRadius:8, alignItems:'center' },
  cancel: { backgroundColor:RED, marginRight:10 },
  save: { backgroundColor:BLUE, marginLeft:10 },
  btnText: { fontSize:16, fontWeight:'bold', fontFamily:'SpaceMono' },
});
