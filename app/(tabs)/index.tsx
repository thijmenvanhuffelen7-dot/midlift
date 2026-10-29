import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EXERCISES, STARTER_HOME, WORKOUTS_PER_WEEK } from '../../src/data/program';
import { dayKey, isThisWeek, startOfWeek } from '../../src/logic/dates';
import { Session, useStore } from '../../src/store';
import { space, type, useColors } from '../../src/theme';
import { Badge, Button, Card, Divider, Icon, Row, Screen, Section, Small, Thumb } from '../../src/ui';

/** Monday to Sunday of this week; trained days filled, today ringed. */
function WeekStrip({ sessions, lang }: { sessions: Session[]; lang: string }) {
  const c = useColors();
  const monday = startOfWeek();
  const trained = new Set(sessions.map((s) => dayKey(new Date(s.date))));
  const today = dayKey();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      {Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
        const key = dayKey(d);
        const done = trained.has(key);
        const isToday = key === today;
        return (
          <View
            key={key}
            style={{ alignItems: 'center', gap: 6 }}
            accessible
            accessibilityLabel={d.toLocaleDateString(lang, { weekday: 'long' }) + (done ? ' ✓' : '')}
          >
            <Text style={[type.caption, { color: isToday ? c.accent : c.muted }]}>
              {d.toLocaleDateString(lang, { weekday: 'narrow' })}
            </Text>
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: done ? c.accent : c.fill,
                borderWidth: isToday && !done ? 2 : 0,
                borderColor: c.accent,
              }}
            >
              {done ? (
                <Icon name="checkmark" size={20} color={c.accentInk} />
              ) : (
                <Text style={{ color: isToday ? c.accent : c.ink, fontWeight: '600', fontSize: 15, fontVariant: ['tabular-nums'] }}>
                  {d.getDate()}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default function Today() {
  const { t, i18n } = useTranslation();
  const c = useColors();
  const { sessions } = useStore();

  const done = sessions.filter((s) => isThisWeek(s.date)).length;
  const next = STARTER_HOME[done % STARTER_HOME.length];
  const weekComplete = done >= WORKOUTS_PER_WEEK;
  const dateLabel = new Date().toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <Screen title={t('today.title')} subtitle={dateLabel}>
      <Section
        title={t('today.thisWeek')}
        trailing={t('today.workoutsDone', { done: Math.min(done, WORKOUTS_PER_WEEK), target: WORKOUTS_PER_WEEK })}
      >
        <WeekStrip sessions={sessions} lang={i18n.language} />
      </Section>

      <Section title={t('today.nextWorkout')}>
        <Card style={{ gap: space.l }}>
          <View style={{ gap: space.xs }}>
            <Text style={[type.title, { color: c.ink }]}>{t(`days.${next.id}`)}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s }}>
              <Icon name="time-outline" size={16} color={c.muted} />
              <Small>
                {t('today.minutes', { count: next.minutes })} · {t('today.exercises', { count: next.items.length })}
              </Small>
            </View>
          </View>

          <View>
            {next.items.map((item, i) => (
              <View key={item.exerciseId}>
                {i > 0 ? <Divider inset={44 + space.m} /> : null}
                <Row
                  leading={<Thumb size={44} />}
                  title={t(`ex.${item.exerciseId}`)}
                  subtitle={t('today.setsReps', {
                    sets: item.sets,
                    reps: `${item.target}${EXERCISES[item.exerciseId].kind === 'time' ? ' s' : ''}`,
                  })}
                />
              </View>
            ))}
          </View>

          {weekComplete ? <Badge tone="ok" icon="checkmark-circle" label={t('today.weekDone')} /> : null}
          {weekComplete ? <Small>{t('today.allDone')}</Small> : null}

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s }}>
            <Icon name="sparkles" size={16} color={c.warn} />
            <Small style={{ flex: 1 }}>{t('today.adaptsHint')}</Small>
          </View>

          <Button
            title={t('today.start')}
            icon="play"
            onPress={() => router.push({ pathname: '/checkin', params: { dayId: next.id } })}
          />
        </Card>
      </Section>
    </Screen>
  );
}
