import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      navigation.replace('Home');
    }, 4000); // 4 saniye bekle

    return () => clearTimeout(timeout);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('./assets/images/butce.png')} // 🔄 butce.png kullanılıyor
        style={styles.logo}
        resizeMode="cover"  // 🔄 Görsel ekranı tamamen doldursun, taşsa da olur
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Arka plan beyaz; gerekirse değiştiririz
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',   // Tüm ekran genişliği
    height: '100%',  // Tüm ekran yüksekliği
  }
});
