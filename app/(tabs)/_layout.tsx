import { Tabs } from 'expo-router';
import { ColorValue } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColors } from '../../src/theme';
import { Icon, IconName } from '../../src/ui';

// Outline icon when inactive, filled when active.
const tabIcon =
  (name: string) =>
  ({ color, focused }: { color: ColorValue; focused: boolean }) => (
    <Icon name={(focused ? name : `${name}-outline`) as IconName} size={24} color={color} />
  );

export default function TabLayout() {
  const c = useColors();
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: { backgroundColor: c.bg, borderTopColor: c.line },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.today'), tabBarIcon: tabIcon('barbell') }} />
      <Tabs.Screen name="food" options={{ title: t('tabs.food'), tabBarIcon: tabIcon('nutrition') }} />
      <Tabs.Screen name="progress" options={{ title: t('tabs.progress'), tabBarIcon: tabIcon('stats-chart') }} />
      <Tabs.Screen name="profile" options={{ title: t('tabs.profile'), tabBarIcon: tabIcon('person-circle') }} />
    </Tabs>
  );
}
