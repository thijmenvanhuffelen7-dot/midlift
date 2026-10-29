import { Tabs } from 'expo-router';
import { ColorValue, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColors } from '../../src/theme';

// Simple text glyphs keep this version free of icon libraries; swap for real icons later.
const glyph = (g: string) => ({ color }: { color: ColorValue }) => <Text style={{ color, fontSize: 18 }}>{g}</Text>;

export default function TabLayout() {
  const c = useColors();
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.line },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.today'), tabBarIcon: glyph('●') }} />
      <Tabs.Screen name="food" options={{ title: t('tabs.food'), tabBarIcon: glyph('◐') }} />
      <Tabs.Screen name="progress" options={{ title: t('tabs.progress'), tabBarIcon: glyph('▲') }} />
      <Tabs.Screen name="profile" options={{ title: t('tabs.profile'), tabBarIcon: glyph('◆') }} />
    </Tabs>
  );
}
