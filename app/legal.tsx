import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LEGAL } from '../src/legal';
import { space, type, useColors } from '../src/theme';
import { Muted } from '../src/ui';

export default function LegalScreen() {
  const { i18n } = useTranslation();
  const c = useColors();
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const lang = i18n.language === 'nl' ? 'nl' : 'en';
  const d = LEGAL[lang][doc === 'terms' ? 'terms' : 'privacy'];
  return (
    <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={{ padding: space.l, gap: space.l, paddingBottom: space.xxl * 2 }}>
      <Stack.Screen options={{ title: d.title }} />
      <Muted>{d.updated}</Muted>
      {d.sections.map((s) => (
        <View key={s.h} style={{ gap: space.xs }}>
          <Text accessibilityRole="header" style={[type.headline, { color: c.ink }]}>
            {s.h}
          </Text>
          <Muted ink>{s.p}</Muted>
        </View>
      ))}
    </ScrollView>
  );
}
