import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function AddBillScreen({ navigation }) {
  const [category, setCategory] = useState('');
  const [customName, setCustomName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = async () => {
    if (!category) {
      Alert.alert('Hata', 'Lütfen kategori seçin.');
      return;
    }
    if (!amount) {
      Alert.alert('Hata', 'Lütfen tutar girin.');
      return;
    }
    if (category === 'Diğer' && !customName.trim()) {
      Alert.alert('Hata', 'Lütfen fatura adını girin.');
      return;
    }

    const newBill = {
      id: Date.now().toString(),
      baslik: category === 'Diğer' ? customName.trim() : category,
      miktar: parseFloat(amount),
      tarih: dueDate.toISOString(),
      kategori: category,
      odendiMi: false,
    };

    try {
      const stored = await AsyncStorage.getItem('@faturalar');
      const list = stored ? JSON.parse(stored) : [];
      list.push(newBill);
      await AsyncStorage.setItem('@faturalar', JSON.stringify(list));
      Alert.alert('Başarılı', 'Fatura kaydedildi!');
      navigation.navigate('Home');
    } catch (err) {
      Alert.alert('Hata', 'Fatura kaydedilemedi.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Text style={styles.label}>Kategori</Text>
      <View style={styles.pickerWrapperLarge}>
        <Picker
          selectedValue={category}
          onValueChange={setCategory}
          style={styles.picker}
        >
          <Picker.Item label="Kategori Seçin" value="" />
          <Picker.Item label="Elektrik" value="Elektrik" />
          <Picker.Item label="Su" value="Su" />
          <Picker.Item label="Doğalgaz" value="Doğalgaz" />
          <Picker.Item label="Kira" value="Kira" />
          <Picker.Item label="Telefon" value="Telefon" />
          <Picker.Item label="Diğer" value="Diğer" />
        </Picker>
      </View>

      {category === 'Diğer' && (
        <>
          <Text style={styles.label}>Fatura Adı</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: İnternet, Aidat"
            value={customName}
            onChangeText={setCustomName}
          />
        </>
      )}

      <Text style={styles.label}>Tutar</Text>
      <View style={styles.amountRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]
          }
          placeholder="0.00"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <Text style={styles.currency}>₺</Text>
      </View>

      <Text style={styles.label}>Son Ödeme Tarihi</Text>
      <Pressable
        style={styles.dateBox}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateText}>{dueDate.toLocaleDateString()}</Text>
      </Pressable>

      {showDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e, sel) => {
            setShowDatePicker(false);
            if (sel) setDueDate(sel);
          }}
        />
      )}

      <Text style={styles.infoText}>Bu fatura, yaklaşan faturalar kutusunda gösterilecektir.</Text>

      <Pressable style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>Kaydet</Text>
      </Pressable>

      <Text style={styles.description}>Ödeme durumunu Listede işaretlediğinizde, tutar ana sayfadaki toplam harcamaya eklenir.</Text>
    </KeyboardAvoidingView>
  );
}

const LIGHT_BLUE = '#E6F2FF';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 14,
    fontFamily: 'SpaceMono',
  },
  pickerWrapperLarge: {
    borderWidth: 1,
    borderColor: '#AAA',
    borderRadius: 8,
    marginTop: 5,
    height: 64,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  picker: {
    height: 64,
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#AAA',
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    fontFamily: 'SpaceMono',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currency: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateBox: {
    backgroundColor: LIGHT_BLUE,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#AAA',
  },
  dateText: {
    fontSize: 16,
    fontFamily: 'SpaceMono',
  },
  saveBtn: {
    backgroundColor: LIGHT_BLUE,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#AAA',
  },
  saveText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  description: {
    fontSize: 13,
    marginTop: 14,
    color: '#444',
    textAlign: 'center',
    fontFamily: 'SpaceMono',
  },
  infoText: {
    fontSize: 13,
    marginTop: 16,
    color: '#444',
    textAlign: 'center',
    fontFamily: 'SpaceMono',
  },
});