import { router } from 'expo-router';
import { ChevronRight, Play } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EXERCISES, STARTER_HOME, WORKOUTS_PER_WEEK } from '../../src/data/program';
import { isThisWeek } from '../../src/logic/dates';
import { useStore } from '../../src/store';
import { space, type, useColors } from '../../src/theme';
import { Button, Card, H2, Label, Muted, Screen, Strong, WeekDots } from '../../src/ui';

export default function Today() {
  const { t, i18n } = useTranslation();
  const c = useColors();
  const { sessions } = useStore();

  const thisWeek = sessions.filter((s) => isThisWeek(s.date));
  const done = thisWeek.length;
  const next = STARTER_HOME[done % STARTER_HOME.length];
  const last = sessions[0];

  return (
    <Screen title={t('today.title')} subtitle={t('today.welcome')}>
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Label>{t('today.thisWeek')}</Label>
          <Muted ink>{t('today.workoutsDone', { done: Math.min(done, WORKOUTS_PER_WEEK), target: WORKOUTS_PER_WEEK })}</Muted>
        </View>
        <WeekDots dates={thisWeek.map((s) => s.date)} />
      </View>

      <Card>
        <View style={{ gap: space.xs }}>
          <Label>{t('today.nextWorkout')}</Label>
          <H2>{t(`days.${next.id}`)}</H2>
          <Muted>
            {t('today.minutes', { count: next.minutes })} · {t('today.exercises', { count: next.items.length })}
          </Muted>
        </View>

        <View>
          {next.items.map((item, i) => (
            <View
              key={item.exerciseId}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: space.m,
                minHeight: 48,
                borderTopWidth: 1,
                borderBottomWidth: i === next.items.length - 1 ? 1 : 0,
                borderColor: c.line,
              }}
            >
              <Strong style={{ flexShrink: 1 }}>{t(`ex.${item.exerciseId}`)}</Strong>
              <Muted style={{ fontVariant: ['tabular-nums'] }}>
                {item.sets} × {item.target}
                {EXERCISES[item.exerciseId].kind === 'time' ? ' s' : ''}
              </Muted>
            </View>
          ))}
        </View>

        {done >= WORKOUTS_PER_WEEK ? <Muted>{t('today.allDone')}</Muted> : null}

        <View style={{ marginTop: space.xs }}>
          <Button tall icon={Play} title={t('today.start')} onPress={() => router.push({ pathname: '/checkin', params: { dayId: next.id } })} />
        </View>
        <Muted style={{ textAlign: 'center' }}>{t('today.checkinHint')}</Muted>
      </Card>

      {last ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.navigate('/progress')}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: space.m,
            minHeight: 56,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: c.line,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <View style={{ flex: 1, gap: 2 }}>
            <Label>{t('today.lastWorkout')}</Label>
            <Text style={[type.body, { color: c.ink }]}>
              {t(`days.${last.dayId}`)} · {new Date(last.date).toLocaleDateString(i18n.language, { weekday: 'long' })}
              {last.records?.length ? ` · ${t('today.records', { count: last.records.length })}` : ''}
            </Text>
          </View>
          <ChevronRight size={20} color={c.muted} strokeWidth={2} />
        </Pressable>
      ) : null}
    </Screen>
  );
}
