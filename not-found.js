import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';

export default function NotFoundScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sayfa Bulunamadı</Text>

      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Text style={styles.link}>Ana Sayfaya Dön</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, marginBottom: 20 },
  link: { fontSize: 16, color: 'blue' }
});
