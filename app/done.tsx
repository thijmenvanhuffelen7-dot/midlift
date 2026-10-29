import * as Sharing from 'expo-sharing';
import { router, useLocalSearchParams } from 'expo-router';
import { Share, Trophy } from 'lucide-react-native';
import { ComponentRef, useRef } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import { useTranslation } from 'react-i18next';
import { WORKOUTS_PER_WEEK } from '../src/data/program';
import { isThisWeek } from '../src/logic/dates';
import { clock, volume } from '../src/logic/stats';
import { useStore } from '../src/store';
import { DISPLAY_FONT, radius, space, type, useColors } from '../src/theme';
import { Button, Label, Muted, PrPill, Strong, WeekDots } from '../src/ui';

export default function DoneScreen() {
  const { t, i18n } = useTranslation();
  const c = useColors();
  const { sessions } = useStore();
  const { id } = useLocalSearchParams<{ id: string }>();
  const card = useRef<ComponentRef<typeof View>>(null);

  const session = sessions.find((s) => s.id === id) ?? sessions[0];
  if (!session) return null;

  const number = sessions.length - sessions.indexOf(session);
  const week = sessions.filter((s) => isThisWeek(s.date));
  const nthThisWeek = week.length - week.indexOf(session);
  const working = session.sets.filter((s) => !s.warmup);
  const records = session.records ?? [];
  const close = () => router.replace('/');

  const share = async () => {
    try {
      const uri = await captureRef(card, { format: 'png', quality: 1 });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'image/png' });
    } catch {
      // Sharing is optional; nothing to do when the device can't.
    }
  };

  const stats = [
    { label: t('workout.duration'), value: clock(session.durationSec ?? 0) },
    { label: t('workout.volume'), value: `${Math.round(volume(working)).toLocaleString(i18n.language)} kg` },
    { label: t('workout.sets'), value: String(working.length) },
    { label: t('done.records'), value: String(records.length) },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flex: 1, paddingHorizontal: space.l, paddingTop: space.l, paddingBottom: space.s, gap: space.l }}>
        <View style={{ gap: 6, paddingHorizontal: space.xs }}>
          <Label>{new Date(session.date).toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' })}</Label>
          <Text accessibilityRole="header" style={{ fontFamily: DISPLAY_FONT, fontSize: 40, lineHeight: 42, letterSpacing: -0.5, color: c.ink }}>
            {t('done.title')}
          </Text>
          <Muted>
            {t('done.subtitle', { nth: t(`done.ordinal_${Math.min(nthThisWeek, 7)}`) })}
          </Muted>
        </View>

        <View
          ref={card}
          collapsable={false}
          accessibilityLabel={t('done.summary')}
          style={{ backgroundColor: c.surface, borderColor: c.line, borderWidth: 1, borderRadius: radius.l, paddingVertical: space.xl, paddingHorizontal: space.l, gap: 18 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: space.s }}>
            <Text style={{ fontFamily: DISPLAY_FONT, fontSize: 28, color: c.ink }}>{t('done.workoutN', { n: number })}</Text>
            <Muted>{t(`days.${session.dayId}`)}</Muted>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1, backgroundColor: c.line, borderRadius: radius.m, overflow: 'hidden' }}>
            {stats.map((s) => (
              <View key={s.label} style={{ width: '49.8%', flexGrow: 1, backgroundColor: c.surface2, padding: space.m, gap: space.xs }}>
                <Label>{s.label}</Label>
                <Text style={{ fontSize: 24, fontWeight: '700', color: c.ink, fontVariant: ['tabular-nums'] }}>{s.value}</Text>
              </View>
            ))}
          </View>

          {records.length ? (
            <View style={{ gap: space.s }}>
              <Label>{t('done.recordsToday')}</Label>
              {records.map((r) => (
                <View key={r.exerciseId} style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 48 }}>
                  <PrPill icon={Trophy} />
                  <Strong style={{ flex: 1 }}>{t(`ex.${r.exerciseId}`)}</Strong>
                  <Strong>
                    {r.weight} kg × {r.reps}
                  </Strong>
                </View>
              ))}
            </View>
          ) : null}

          <View style={{ gap: 10, borderTopWidth: 1, borderTopColor: c.line, paddingTop: space.l }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Label>{t('today.thisWeek')}</Label>
              <Muted ink>{t('done.weekCount', { done: Math.min(week.length, WORKOUTS_PER_WEEK), target: WORKOUTS_PER_WEEK })}</Muted>
            </View>
            <WeekDots dates={week.map((s) => s.date)} size={32} labelsBelow />
          </View>

          <Text style={[type.body, { fontFamily: DISPLAY_FONT, fontSize: 15, color: c.ink }]}>midlift</Text>
        </View>

        <View style={{ flex: 1 }} />
        <View style={{ gap: 10 }}>
          <Button variant="outline" icon={Share} title={t('done.share')} onPress={share} />
          <Button title={t('done.close')} onPress={close} />
        </View>
      </View>
    </SafeAreaView>
  );
}
