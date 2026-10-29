import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EXERCISES } from '../../src/data/program';
import { isThisWeek } from '../../src/logic/dates';
import { Session, useStore } from '../../src/store';
import { space, type, useColors } from '../../src/theme';
import { Badge, Button, Card, Divider, Icon, Row, Screen, Section, Small } from '../../src/ui';

const sessionVolume = (s: Session) =>
  s.sets.reduce((sum, set) => sum + (EXERCISES[set.exerciseId]?.loaded ? set.weight * set.reps : 0), 0);

function SessionCard({ session }: { session: Session }) {
  const { t, i18n } = useTranslation();
  const c = useColors();
  // Sets per exercise, in the order they were done.
  const perExercise = new Map<string, number>();
  for (const set of session.sets) perExercise.set(set.exerciseId, (perExercise.get(set.exerciseId) ?? 0) + 1);
  const volume = sessionVolume(session);
  const meta = [
    session.durationSec ? { icon: 'time-outline' as const, text: t('progress.minutes', { count: Math.max(1, Math.round(session.durationSec / 60)) }) } : null,
    volume > 0 ? { icon: 'barbell-outline' as const, text: `${Math.round(volume)} kg` } : null,
    { icon: 'checkmark-done-outline' as const, text: t('progress.sets', { count: session.sets.length }) },
  ].filter((m): m is { icon: 'time-outline' | 'barbell-outline' | 'checkmark-done-outline'; text: string } => m !== null);

  return (
    <Card>
      <View style={{ gap: 2 }}>
        <Text style={[type.headline, { color: c.ink }]}>{t(`days.${session.dayId}`)}</Text>
        <Small>
          {new Date(session.date).toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' })}
        </Small>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.l }}>
        {meta.map((m) => (
          <View key={m.icon} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name={m.icon} size={16} color={c.muted} />
            <Small muted={false}>{m.text}</Small>
          </View>
        ))}
      </View>
      {session.lighter ? <Badge tone="warn" icon="sparkles" label={t('progress.lighter')} /> : null}
      <Divider />
      <View style={{ gap: space.xs }}>
        {[...perExercise.entries()].map(([id, n]) => (
          <Small key={id} muted={false}>
            <Text style={{ color: c.muted }}>{t('progress.sets', { count: n })}</Text>
            {'  '}
            {t(`ex.${id}`)}
          </Small>
        ))}
      </View>
    </Card>
  );
}

export default function Progress() {
  const { t } = useTranslation();
  const c = useColors();
  const { sessions } = useStore();

  const thisWeek = sessions.filter((s) => isThisWeek(s.date)).length;
  const totalVolume = sessions.reduce((sum, s) => sum + sessionVolume(s), 0);

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
      <Screen title={t('progress.title')}>
        <View style={{ alignItems: 'center', gap: space.m, paddingVertical: space.xxl * 2 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: c.fill, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="stats-chart" size={28} color={c.muted} />
          </View>
          <Text style={[type.title, { color: c.ink, textAlign: 'center' }]}>{t('progress.emptyTitle')}</Text>
          <Small style={{ textAlign: 'center', maxWidth: 300 }}>{t('progress.empty')}</Small>
          <Button title={t('progress.toToday')} onPress={() => router.navigate('/')} />
        </View>
      </Screen>
    );
  }

  const stats = [
    { label: t('progress.thisWeek'), value: String(thisWeek) },
    { label: t('progress.total'), value: String(sessions.length) },
    { label: t('progress.volume'), value: `${Math.round(totalVolume).toLocaleString()} kg` },
  ];

  return (
    <Screen title={t('progress.title')}>
      <View style={{ flexDirection: 'row' }}>
        {stats.map((s, i) => (
          <View
            key={s.label}
            style={{ flex: 1, gap: 2, paddingLeft: i ? space.m : 0, borderLeftWidth: i ? 1 : 0, borderLeftColor: c.line }}
          >
            <Text style={[type.footnote, { color: c.muted }]}>{s.label}</Text>
            <Text style={[type.title, { color: c.ink, fontVariant: ['tabular-nums'] }]} numberOfLines={1} adjustsFontSizeToFit>
              {s.value}
            </Text>
          </View>
        ))}
      </View>

      {best.size > 0 ? (
        <Section title={t('progress.bestLifts')} gap={space.xs}>
          {[...best.entries()].map(([id, b], i) => (
            <View key={id}>
              {i > 0 ? <Divider inset={36 + space.m} /> : null}
              <Row
                leading={
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="trophy" size={18} color={c.accent} />
                  </View>
                }
                title={t(`ex.${id}`)}
                trailing={
                  <Text style={[type.headline, { color: c.ink, fontVariant: ['tabular-nums'] }]}>
                    {b.weight} kg × {b.reps}
                  </Text>
                }
              />
            </View>
          ))}
        </Section>
      ) : null}

      <Section title={t('progress.history')}>
        {sessions.slice(0, 20).map((s) => (
          <SessionCard key={s.id} session={s} />
        ))}
      </Section>
    </Screen>
  );
}
