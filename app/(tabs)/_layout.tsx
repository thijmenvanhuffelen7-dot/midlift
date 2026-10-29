import { Redirect, Tabs } from 'expo-router';
import { Apple, Calendar, ChartLine, LucideIcon, User } from 'lucide-react-native';
import { ColorValue } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../src/store';
import { useColors } from '../../src/theme';

const tabIcon =
  (Icon: LucideIcon) =>
  ({ color }: { color: ColorValue }) => <Icon size={24} color={color as string} strokeWidth={2} />;

export default function TabLayout() {
  const c = useColors();
  const { t } = useTranslation();
  const { ready, profile, premium } = useStore();
  // First run: intake, then the paywall. Premium unlocks the app.
  if (!ready) return null;
  if (!profile.onboarded) return <Redirect href="/intake" />;
  if (!premium.active) return <Redirect href="/paywall" />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.muted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.line, borderTopWidth: 1 },
        sceneStyle: { backgroundColor: c.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.today'), tabBarIcon: tabIcon(Calendar) }} />
      <Tabs.Screen name="food" options={{ title: t('tabs.food'), tabBarIcon: tabIcon(Apple) }} />
      <Tabs.Screen name="progress" options={{ title: t('tabs.progress'), tabBarIcon: tabIcon(ChartLine) }} />
      <Tabs.Screen name="profile" options={{ title: t('tabs.profile'), tabBarIcon: tabIcon(User) }} />
    </Tabs>
  );
}
