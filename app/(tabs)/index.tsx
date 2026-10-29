import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EXERCISES, STARTER_HOME, WORKOUTS_PER_WEEK } from '../../src/data/program';
import { isThisWeek } from '../../src/logic/dates';
import { useStore } from '../../src/store';
import { space, useColors } from '../../src/theme';
import { Body, Button, Card, Label, Meter, Screen, Title } from '../../src/ui';

export default function Today() {
  const { t } = useTranslation();
  const c = useColors();
  const { sessions } = useStore();

  const done = sessions.filter((s) => isThisWeek(s.date)).length;
  const next = STARTER_HOME[done % STARTER_HOME.length];
  const weekComplete = done >= WORKOUTS_PER_WEEK;

  return (
    <Screen>
      <Title>{t('today.greeting')}</Title>

      <Card>
        <Label>{t('today.thisWeek')}</Label>
        <Meter
          label={t('today.workoutsDone', { done: Math.min(done, WORKOUTS_PER_WEEK), target: WORKOUTS_PER_WEEK })}
          value={Math.min(done, WORKOUTS_PER_WEEK)}
          goal={WORKOUTS_PER_WEEK}
          unit=""
        />
      </Card>

      <Card style={{ backgroundColor: c.forest, borderColor: c.forest }}>
        <Label accent>{t('today.nextWorkout')}</Label>
        <Body style={{ color: c.forestInk, fontSize: 24, fontWeight: '800' }}>{t(`days.${next.id}`)}</Body>
        <Body style={{ color: c.forestInk, opacity: 0.8 }}>{t('today.minutes', { count: next.minutes })}</Body>
        <View style={{ gap: space.xs }}>
          {next.items.map((item) => (
            <Body key={item.exerciseId} style={{ color: c.forestInk }}>
              {t(`ex.${item.exerciseId}`)} · {item.sets} × {item.target}
              {EXERCISES[item.exerciseId].kind === 'time' ? ' s' : ''}
            </Body>
          ))}
        </View>
        {weekComplete ? <Body style={{ color: c.forestInk }}>{t('today.allDone')}</Body> : null}
        <Button title={t('today.start')} onPress={() => router.push({ pathname: '/checkin', params: { dayId: next.id } })} />
      </Card>
    </Screen>
  );
}
