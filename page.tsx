import React from 'react';
import SplashScreen from './splash';

// navigation prop'u tipini opsiyonel yapmadığın için
// en garantili çözüm navigation'ı boş (undefined) göndermek

export default function Page() {
  return <SplashScreen navigation={undefined} />;
}
