import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";

const { width: WINDOW_WIDTH } = Dimensions.get("window");
const CONTENT_PADDING = 16;
const CONTENT_WIDTH = WINDOW_WIDTH - CONTENT_PADDING * 2;
const CHART_HEIGHT = 220;
const COLORS = [
  "#4caf50",
  "#ff9800",
  "#2196f3",
  "#e91e63",
  "#9c27b0",
  "#ffc107",
];

const getMonthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const getMonthDisplay = (k) => k.split("-").reverse().join("-");
const getShortLabel = (k) => `${k.slice(5, 7)}-${k.slice(2, 4)}`;

export default function ChartScreen() {
  const [bills, setBills] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [compMode, setCompMode] = useState("Harcamalar");
  const [monthA, setMonthA] = useState(getMonthKey(new Date()));
  const [monthB, setMonthB] = useState(getMonthKey(new Date()));
  const [barMode, setBarMode] = useState("Harcamalar");
  const [barCategory, setBarCategory] = useState("Market");

  useEffect(() => {
    (async () => {
      const rawBills = await AsyncStorage.getItem("@faturalar");
      const rawExps = await AsyncStorage.getItem("@harcamalar");
      setBills((JSON.parse(rawBills) || []).filter((b) => b.odendiMi));
      setExpenses(JSON.parse(rawExps) || []);
    })();

    // 🔍 Tekrarlayan ay anahtarlarını görmek için:
    console.log("Ay anahtarları:", monthItems().map(i => i.key));
  }, []);

  const BILL_CATS = ["Kira", "Telefon", "Su", "Elektrik", "Doğalgaz", "Diğer"];
  const EXP_CATS = ["Market", "Alışveriş", "Sosyal", "Eğlence", "Ulaşım", "Diğer"];

  const groupBy = (list, cats) => {
    const map = Object.fromEntries(cats.map((c) => [c, 0]));
    list.forEach((item) => {
      const cat = item.kategori || item.category || "Diğer";
      map[cat] = (map[cat] || 0) + (parseFloat(item.miktar) || 0);
    });
    return Object.entries(map).filter(([, v]) => v > 0);
  };

  const slice = (name, amount, idx) => ({
    name,
    amount,
    color: COLORS[idx % COLORS.length],
    legendFontColor: "#000",
    legendFontSize: 13,
  });

  const thisMonthKey = getMonthKey(new Date());
  const pieBills = groupBy(
    bills.filter((b) => getMonthKey(new Date(b.tarih)) === thisMonthKey),
    BILL_CATS
  ).map(([k, v], i) => slice(k, v, i));

  const pieExp = groupBy(
    expenses.filter((e) => getMonthKey(new Date(e.tarih)) === thisMonthKey),
    EXP_CATS
  ).map(([k, v], i) => slice(k, v, i));

  const cmpCats = compMode === "Harcamalar" ? EXP_CATS : BILL_CATS;
  const cmpSrc = compMode === "Harcamalar" ? expenses : bills;

  const cmpPieA = groupBy(
    cmpSrc.filter((x) => getMonthKey(new Date(x.tarih)) === monthA),
    cmpCats
  ).map(([k, v], i) => slice(k, v, i));

  const cmpPieB = groupBy(
    cmpSrc.filter((x) => getMonthKey(new Date(x.tarih)) === monthB),
    cmpCats
  ).map(([k, v], i) => slice(k, v, i));

  const explanation = () => {
    const totA = cmpPieA.reduce((s, c) => s + c.amount, 0);
    const totB = cmpPieB.reduce((s, c) => s + c.amount, 0);
    if (!totA && !totB) return "";
    const diff = totB - totA;
    const word = diff > 0 ? "fazla" : "az";

    const diffMap = {};
    cmpCats.forEach((cat) => {
      const a = cmpPieA.find((o) => o.name === cat)?.amount || 0;
      const b = cmpPieB.find((o) => o.name === cat)?.amount || 0;
      diffMap[cat] = b - a;
    });
    const maxCat = Object.entries(diffMap).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0][0];

    return `${getMonthDisplay(monthB)} ayında ${getMonthDisplay(monthA)} ayına göre ${Math.abs(
      diff
    ).toLocaleString("tr-TR")}₺ ${word} ${compMode.toLowerCase()} yapılmıştır. En çok değişim “${maxCat}” kategorisindedir.`;
  };

  const months6 = Array.from({ length: 6 })
    .map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return getMonthKey(d);
    })
    .reverse();

  const barSrc = barMode === "Harcamalar" ? expenses : bills;
  const barData = months6.map((key) =>
    barSrc
      .filter(
        (x) =>
          (barMode === "Harcamalar" || x.odendiMi) &&
          (x.kategori || x.category) === barCategory &&
          getMonthKey(new Date(x.tarih)) === key
      )
      .reduce((s, c) => s + (parseFloat(c.miktar) || 0), 0)
  );

  const monthItems = (prefix = "") => {
  return Array.from({ length: 24 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const k = getMonthKey(d); // örnek: "2025-06"
    const label = getMonthDisplay(k); // örnek: "06-2025"
    const key = `${prefix}-${i}`; // garantili benzersiz key (örnek: "A-0", "B-3")

    return (
      <Picker.Item
        key={key}
        label={label}
        value={k}
      />
    );
  });
};


  const Legend = ({ data }) => (
    <View style={styles.legendWrap}>
      {data.map((s) => (
        <View key={s.name} style={styles.legendRow}>
          <View style={[styles.legendSwatch, { backgroundColor: s.color }]} />
          <Text style={styles.legendLabel}>
            {s.name}: {s.amount.toLocaleString("tr-TR")}₺
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 72 }}>
      <Text style={styles.head}>Bu Ayın Dağılımı</Text>
      <View style={styles.centeredRow}>
        {[{ title: 'Harcamalar', data: pieExp }, { title: 'Faturalar', data: pieBills }].map(({ title, data }) => (
          <View key={title} style={styles.box}>
            <Text style={styles.sub}>{title}</Text>
            {data.length ? (
              <>
                <View style={styles.chartWrapper}>
                  <PieChart
                    data={data}
                    width= {140}
                    height={140}
                    accessor="amount"
                    chartConfig={chartCfg}
                    hasLegend={false}
                    backgroundColor="transparent"
                    center={[0, 0]}
                  />
                </View>
                <Legend data={data} />
              </>
            ) : (
              <Text style={styles.empty}>Veri Yok</Text>
            )}
          </View>
        ))}
      </View>

      <Text style={styles.head}>Aya Göre Kıyaslama</Text>
      <View style={styles.filterRow}>
        <Picker style={styles.picker} selectedValue={compMode} onValueChange={setCompMode}>
          <Picker.Item label="Harcamalar" value="Harcamalar" />
          <Picker.Item label="Faturalar" value="Faturalar" />
        </Picker>
        <Picker style={styles.picker} selectedValue={monthA} onValueChange={setMonthA}>
          {monthItems('A')}
        </Picker>
        <Picker style={styles.picker} selectedValue={monthB} onValueChange={setMonthB}>
          {monthItems('B')}
        </Picker>
      </View>

      <View style={styles.centeredRow}>
        {[{ k: monthA, data: cmpPieA }, { k: monthB, data: cmpPieB }].map(({ k, data }) => (
          <View key={k} style={styles.box}>
            <Text style={styles.sub}>{getMonthDisplay(k)}</Text>
            {data.length ? (
              <>
                <View style={styles.chartWrapper}>
                  <PieChart
                    data={data}
                    width={140}
                    height={140}
                    accessor="amount"
                    chartConfig={chartCfg}
                    hasLegend={false}
                    backgroundColor="transparent"
                    center={[0, 0]}
                  />
                </View>
                <Legend data={data} />
              </>
            ) : (
              <Text style={styles.empty}>Veri Yok</Text>
            )}
          </View>
        ))}
      </View>

      <Text style={styles.explanation}>{explanation()}</Text>

      <Text style={styles.head}>Kategori Kıyaslama (Son 6 Ay)</Text>
      <View style={styles.filterRow}>
        <Picker style={styles.pickerHalf} selectedValue={barMode} onValueChange={setBarMode}>
          <Picker.Item label="Harcamalar" value="Harcamalar" />
          <Picker.Item label="Faturalar" value="Faturalar" />
        </Picker>
        <Picker style={styles.pickerHalf} selectedValue={barCategory} onValueChange={setBarCategory}>
          {(barMode === 'Harcamalar' ? EXP_CATS : BILL_CATS).map((cat) => (
            <Picker.Item key={cat} label={cat} value={cat} />
          ))}
        </Picker>
      </View>

      <BarChart
        data={{
          labels: months6.map(getShortLabel),
          datasets: [{ data: barData }],
        }}
        width={CONTENT_WIDTH}
        height={CHART_HEIGHT}
        chartConfig={chartCfg}
        fromZero
        style={{ marginTop: 8 }}
      />
    </ScrollView>
  );
}

const chartCfg = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
  decimalPlaces: 0,
  barPercentage: 0.5,
};

function Legend({ data }) {
  return (
    <View style={styles.legendWrap}>
      {data.map((item, i) => (
        <View style={styles.legendRow} key={`${item.name}-${i}`}>
          <View style={[styles.legendSwatch, { backgroundColor: item.color }]} />
          <Text style={styles.legendLabel}>
            {item.name}: {item.amount}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: CONTENT_PADDING,
    backgroundColor: '#fafafa',
  },
  head: {
    fontSize: 15,
    fontWeight: 'bold',
    marginVertical: 12,
    color: '#333',
  },
  sub: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    color: '#222',
    textAlign: 'center',
  },
  centeredRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    rowGap: 16, 
  },
  box: {
    width: (CONTENT_WIDTH - 16) / 2 ,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 360,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  legendWrap: {
    marginTop: 8,
    width: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  legendSwatch: {
    width: 14,
    height: 14,
    marginRight: 6,
    borderRadius: 2,
  },
  legendLabel: {
    fontSize: 13,
    color: '#111',
    flexShrink: 1,
  },
  empty: {
    textAlign: 'center',
    marginTop: 16,
    color: '#888',
    fontSize: 13,
  },
  picker: {
    width: (CONTENT_WIDTH - 24) / 3,
    height: 42,
    marginHorizontal: 4,
    marginVertical: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
  },
  pickerHalf: {
    width: CONTENT_WIDTH / 2 - 8,
    height: 42,
    marginHorizontal: 4,
    marginVertical: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  explanation: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
});
