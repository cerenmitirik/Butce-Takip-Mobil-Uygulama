import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AddBillScreen from './addbill';
import ChartScreen from './chart';
import ExpensesScreen from './expenses'; // 🆕 Harcamalarım sayfası
import HomeScreen from './home';
import BillListScreen from './list';
import SplashScreen from './splash';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerTitleAlign: 'center' }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Anasayfa' }}
        />

        {/* isimler HomeScreen’deki navigation.navigate(...) çağrılarıyla bire bir uyumlu */}
        <Stack.Screen
          name="addbill"
          component={AddBillScreen}
          options={{ title: 'Fatura Ekle' }}
        />
        <Stack.Screen
          name="expenses"
          component={ExpensesScreen}
          options={{ title: 'Harcamalarım' }}
        />
        <Stack.Screen
          name="list"
          component={BillListScreen}
          options={{ title: 'Fatura Listesi' }}
        />
        <Stack.Screen
          name="chart"
          component={ChartScreen}
          options={{ title: 'Grafikler' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

