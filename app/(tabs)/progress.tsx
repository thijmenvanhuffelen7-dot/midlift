import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EXERCISES } from '../../src/data/program';
import { isThisWeek } from '../../src/logic/dates';
import { useStore } from '../../src/store';
import { space, useColors } from '../../src/theme';
import { Body, Card, H2, Label, Screen, Title } from '../../src/ui';

export default function Progress() {
  const { t, i18n } = useTranslation();
  const c = useColors();
  const { sessions } = useStore();

  const thisWeek = sessions.filter((s) => isThisWeek(s.date)).length;

  // Heaviest logged weight per loaded exercise.
  const best = new Map<string, { weight: number; reps: number }>();
  for (const s of sessions) {
    for (const set of s.sets) {
      if (!EXERCISES[set.exerciseId]?.loaded || set.weight <= 0) continue;
      const cur = best.get(set.exerciseId);
      if (!cur || set.weight > cur.weight) best.set(set.exerciseId, { weight: set.weight, reps: set.reps });
    }
  }

  if (sessions.length === 0) {
    return (
      <Screen>
        <Title>{t('progress.title')}</Title>
        <Card>
          <Body muted>{t('progress.empty')}</Body>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <Title>{t('progress.title')}</Title>

      <View style={{ flexDirection: 'row', gap: space.m }}>
        <Card style={{ flex: 1 }}>
          <Label>{t('progress.thisWeek')}</Label>
          <Text style={{ color: c.ink, fontSize: 32, fontWeight: '800' }}>{thisWeek}</Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <Label>{t('progress.total')}</Label>
          <Text style={{ color: c.ink, fontSize: 32, fontWeight: '800' }}>{sessions.length}</Text>
        </Card>
      </View>

      {best.size > 0 ? (
        <Card>
          <H2>{t('progress.bestLifts')}</H2>
          {[...best.entries()].map(([id, b]) => (
            <View key={id} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Body>{t(`ex.${id}`)}</Body>
              <Body style={{ fontVariant: ['tabular-nums'], fontWeight: '700' }}>
                {b.weight} kg × {b.reps}
              </Body>
            </View>
          ))}
        </Card>
      ) : null}

      <Card>
        <H2>{t('progress.history')}</H2>
        {sessions.slice(0, 20).map((s) => (
          <View key={s.id} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Body>{t(`days.${s.dayId}`)}</Body>
            <Body muted>
              {new Date(s.date).toLocaleDateString(i18n.language, { weekday: 'short', day: 'numeric', month: 'short' })}
            </Body>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
