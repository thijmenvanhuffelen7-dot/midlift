import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { EXERCISES, PainArea, STARTER_HOME } from '../src/data/program';
import { adaptWorkout, Level, suggestWeight } from '../src/logic/adapt';
import { lastSetsFor, LoggedSet, useStore } from '../src/store';
import { radius, space, useColors } from '../src/theme';
import { Body, Button, Card, H2, Input, Label, Screen } from '../src/ui';

const REST_SECONDS = 60;

type Row = { weight: string; reps: string; done: boolean };

export default function WorkoutScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { sessions, addSession } = useStore();
  const params = useLocalSearchParams<{ dayId: string; energy: string; sleep: string; pain: string }>();

  const day = STARTER_HOME.find((d) => d.id === params.dayId) ?? STARTER_HOME[0];
  const toLevel = (v: string | undefined): Level => (v === '0' ? 0 : v === '2' ? 2 : 1);
  const toPain = (v: string | undefined): PainArea | 'none' =>
    v === 'knee' || v === 'back' || v === 'shoulder' ? v : 'none';
  const adapted = useMemo(
    () =>
      adaptWorkout(day, {
        energy: toLevel(params.energy),
        sleep: toLevel(params.sleep),
        pain: toPain(params.pain),
      }),
    [day, params.energy, params.sleep, params.pain],
  );

  // One row per planned set, pre-filled with a suggested weight.
  const [rows, setRows] = useState<Record<string, Row[]>>(() => {
    const init: Record<string, Row[]> = {};
    for (const item of adapted.items) {
      const last = lastSetsFor(sessions, item.exerciseId);
      const suggested = suggestWeight(last, item.target, adapted.lighter);
      const weight = suggested ?? (last ? Math.max(...last.map((s) => s.weight)) : 0);
      init[item.exerciseId] = Array.from({ length: item.sets }, () => ({
        weight: EXERCISES[item.exerciseId].loaded && weight > 0 ? String(weight) : '',
        reps: String(item.target),
        done: false,
      }));
    }
    return init;
  });

  const [restLeft, setRestLeft] = useState(0);
  useEffect(() => {
    if (restLeft <= 0) return;
    const id = setInterval(() => setRestLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [restLeft > 0]);

  const update = (exId: string, i: number, patch: Partial<Row>) =>
    setRows((r) => ({ ...r, [exId]: r[exId].map((row, j) => (j === i ? { ...row, ...patch } : row)) }));

  const toggleDone = (exId: string, i: number) => {
    const wasDone = rows[exId][i].done;
    update(exId, i, { done: !wasDone });
    if (!wasDone) setRestLeft(REST_SECONDS);
  };

  const finish = () => {
    const sets: LoggedSet[] = [];
    for (const item of adapted.items) {
      for (const row of rows[item.exerciseId]) {
        if (!row.done) continue;
        sets.push({
          exerciseId: item.exerciseId,
          weight: Number(row.weight.replace(',', '.')) || 0,
          reps: Number(row.reps) || 0,
        });
      }
    }
    if (sets.length > 0) {
      addSession({ date: new Date().toISOString(), dayId: day.id, lighter: adapted.lighter, sets });
    }
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Screen safeTop={false}>
        <H2>{t(`days.${day.id}`)}</H2>

        {adapted.items.map((item) => {
          const ex = EXERCISES[item.exerciseId];
          const last = lastSetsFor(sessions, item.exerciseId);
          const top = last ? last.reduce((a, b) => (b.weight > a.weight ? b : a)) : undefined;
          const suggestion = suggestWeight(last, item.target, adapted.lighter);
          return (
            <Card key={item.exerciseId}>
              <H2>{t(`ex.${item.exerciseId}`)}</H2>
              <Body muted>
                {t('workout.target', { sets: item.sets, reps: `${item.target}${ex.kind === 'time' ? ' s' : ''}` })}
              </Body>
              {ex.loaded && top && top.weight > 0 ? (
                <Body muted>{t('workout.last', { weight: top.weight, reps: top.reps })}</Body>
              ) : null}
              {suggestion && !adapted.lighter ? <Label accent>{t('workout.suggestUp', { weight: suggestion })}</Label> : null}
              {ex.easier ? (
                <Body muted>
                  {t('workout.easier')}: {t(`ex.${ex.easier}`)}
                </Body>
              ) : null}

              {rows[item.exerciseId].map((row, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space.s }}>
                  <Text style={{ color: c.muted, width: 48, paddingBottom: 14 }}>{t('workout.set', { n: i + 1 })}</Text>
                  {ex.loaded ? (
                    <Input
                      label={t('common.kg')}
                      keyboardType="decimal-pad"
                      value={row.weight}
                      onChangeText={(v) => update(item.exerciseId, i, { weight: v })}
                    />
                  ) : null}
                  <Input
                    label={ex.kind === 'time' ? 's' : t('common.reps')}
                    keyboardType="number-pad"
                    value={row.reps}
                    onChangeText={(v) => update(item.exerciseId, i, { reps: v })}
                  />
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: row.done }}
                    accessibilityLabel={t('workout.set', { n: i + 1 })}
                    onPress={() => toggleDone(item.exerciseId, i)}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: radius.m,
                      borderWidth: 1.5,
                      borderColor: row.done ? c.ok : c.line,
                      backgroundColor: row.done ? c.ok : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: row.done ? c.surface : c.muted, fontSize: 20, fontWeight: '700' }}>✓</Text>
                  </Pressable>
                </View>
              ))}
            </Card>
          );
        })}

        <Button title={t('workout.finish')} onPress={finish} />
        <View style={{ height: restLeft > 0 ? 80 : 0 }} />
      </Screen>

      {restLeft > 0 ? (
        <View
          style={{
            position: 'absolute',
            left: space.l,
            right: space.l,
            bottom: space.l + insets.bottom,
            backgroundColor: c.forest,
            borderRadius: radius.l,
            padding: space.l,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text style={{ color: c.forestInk, fontSize: 18, fontWeight: '700', fontVariant: ['tabular-nums'] }}>
            {t('workout.rest')} {Math.floor(restLeft / 60)}:{String(restLeft % 60).padStart(2, '0')}
          </Text>
          <Pressable accessibilityRole="button" onPress={() => setRestLeft(0)} style={{ padding: space.s }}>
            <Text style={{ color: c.forestInk, fontWeight: '700' }}>{t('workout.skipRest')}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
