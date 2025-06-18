import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

/**
 * Ana Sayfa (HomeScreen)
 * - Fatura Ekle, Harcamalarım, Listele, Grafik butonları
 * - Yaklaşan Faturalar kutusu (ödenmemiş ve 3 gün içinde)
 * - Bu Ay Toplam Harcama & Geçen Aya Göre Değişim (ödenmiş faturalar + harcamalar)
 */
export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const [faturalar, setFaturalar] = useState([]);
  const [harcamalar, setHarcamalar] = useState([]);
  const [toplamBuAy, setToplamBuAy] = useState('0.00');
  const [yuzdeDegisim, setYuzdeDegisim] = useState('0.00');
  const [uyariFaturalari, setUyariFaturalari] = useState([]);

  /* ------------ STORAGE LOAD ------------- */
  const loadData = async () => {
    const fData = await AsyncStorage.getItem('@faturalar');
    const hData = await AsyncStorage.getItem('@harcamalar');
    setFaturalar(fData ? JSON.parse(fData) : []);
    setHarcamalar(hData ? JSON.parse(hData) : []);
  };

  /* ------------ CALCULATE ---------------- */
  const calculate = () => {
    const now = new Date();
    const buAy = now.getMonth();
    const buYil = now.getFullYear();
    const gecenAy = buAy === 0 ? 11 : buAy - 1;
    const gecenAyYil = buAy === 0 ? buYil - 1 : buYil;

    let toplamAy = 0;
    let toplamGecen = 0;
    const yaklasan = [];

    faturalar.forEach(f => {
      const t = new Date(f.tarih);
      const m = parseFloat(f.miktar) || 0;
      if (!f.odendiMi) {
        const diff = Math.floor((t - now) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && diff <= 3) yaklasan.push(f);
      }
      if (f.odendiMi) {
        if (t.getMonth() === buAy && t.getFullYear() === buYil) toplamAy += m;
        if (t.getMonth() === gecenAy && t.getFullYear() === gecenAyYil) toplamGecen += m;
      }
    });

    harcamalar.forEach(h => {
      const t = new Date(h.tarih);
      const m = parseFloat(h.miktar) || 0;
      if (t.getMonth() === buAy && t.getFullYear() === buYil) toplamAy += m;
      if (t.getMonth() === gecenAy && t.getFullYear() === gecenAyYil) toplamGecen += m;
    });

    setToplamBuAy(toplamAy.toFixed(2));
    const deg = toplamGecen === 0 ? (toplamAy === 0 ? 0 : 100) : ((toplamAy - toplamGecen) / toplamGecen) * 100;
    setYuzdeDegisim(deg.toFixed(2));
    setUyariFaturalari(yaklasan);
  };

  /* ------------ EFFECTS ------------------ */
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    calculate();
  }, [faturalar, harcamalar]);

  /* ------------ RENDER ------------------- */
  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>        
      <HomeButton title="Fatura Ekle"    onPress={() => navigation.navigate('addbill')} />
      <HomeButton title="Harcamalarım"   onPress={() => navigation.navigate('expenses')} />
      <HomeButton title="Listele"        onPress={() => navigation.navigate('list')} />
      <HomeButton title="Grafik"         onPress={() => navigation.navigate('chart')} />

      <YaklasanFaturalar list={uyariFaturalari} />
      <HarcamaOzeti buAy={toplamBuAy} degisim={yuzdeDegisim} />
    </ScrollView>
  );
}

/* ---------- Alt Bileşenler ---------- */
function HomeButton({ title, onPress }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

function YaklasanFaturalar({ list }) {
  return (
    <View style={styles.notificationBox}>
      <Text style={styles.sectionTitle}>Yaklaşan Faturalar:</Text>
      {list.length ? (
        list.map((f, i) => (
          <Text key={i} style={styles.notificationText}>
            {f.baslik || 'Fatura'} · {new Date(f.tarih).toLocaleDateString()}
          </Text>
        ))
      ) : (
        <Text style={styles.notificationText}>Yaklaşan fatura yok.</Text>
      )}
    </View>
  );
}

function HarcamaOzeti({ buAy, degisim }) {
  return (
    <View style={styles.footerBox}>
      <Text style={styles.sectionTitle}>Bu Ay Toplam Harcama : {buAy} TL</Text>
      <Text style={[styles.sectionTitle, { color: parseFloat(degisim) >= 0 ? 'green' : 'red', marginTop: 12 }]}>        
        Geçen Aya Göre Değişim : {parseFloat(degisim) >= 0 ? '+' : ''}{degisim}%
      </Text>
    </View>
  );
}

/* ------------- STYLES ------------- */
const BLUE = '#E6F2FF';

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1 },
  button: { backgroundColor: BLUE, paddingVertical: 18, paddingHorizontal: 16, borderRadius: 10, marginBottom: 12, width: '100%' },
  buttonText: { fontWeight: 'bold', fontFamily: 'SpaceMono', fontSize: 16, textAlign: 'left' },
  notificationBox: { backgroundColor: '#EEEEEE', borderWidth: 1, borderColor: '#CCC', borderRadius: 10, padding: 20, minHeight: 120, marginBottom: 30 },
  sectionTitle: { fontWeight: 'bold', fontFamily: 'SpaceMono', fontSize: 16 },
  notificationText: { fontFamily: 'SpaceMono', fontSize: 14, marginTop: 6 },
  footerBox: { backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#CCC', borderRadius: 10, padding: 24, marginBottom: 40 },
});
