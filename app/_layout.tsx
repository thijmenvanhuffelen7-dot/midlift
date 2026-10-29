import '../src/i18n';
import { BricolageGrotesque_800ExtraBold, useFonts } from '@expo-google-fonts/bricolage-grotesque';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider, useStore } from '../src/store';
import { ThemeProvider, useColors, useIsDark } from '../src/theme';

function RootStack() {
  const c = useColors();
  const isDark = useIsDark();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: c.bg },
          headerTintColor: c.ink,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: c.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="checkin" options={{ title: '', presentation: 'modal' }} />
        <Stack.Screen name="workout" options={{ headerShown: false }} />
        <Stack.Screen name="done" options={{ headerShown: false, gestureEnabled: false }} />
      </Stack>
    </>
  );
}

function Themed() {
  const { profile } = useStore();
  return (
    <ThemeProvider pref={profile.theme}>
      <RootStack />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  // The display face only shows on the finish screen; the app renders with the system font until it loads.
  useFonts({ BricolageGrotesque_800ExtraBold });
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Themed />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
