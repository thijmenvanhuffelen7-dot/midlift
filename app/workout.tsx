import * as Haptics from 'expo-haptics';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { EXERCISES, PainArea, STARTER_HOME } from '../src/data/program';
import { adaptWorkout, Change, Level, suggestWeight } from '../src/logic/adapt';
import { lastSetsFor, LoggedSet, useStore } from '../src/store';
import { radius, space, type, useColors } from '../src/theme';
import { Badge, Button, Icon, Screen, Small, Thumb } from '../src/ui';

const REST_SECONDS = 60;
const REST_STEP = 15;

type Row = { weight: string; reps: string; done: boolean };

const clock = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
const toNumber = (v: string) => Number(v.replace(',', '.')) || 0;

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

  // One clock drives both the workout duration and the rest timer.
  const startedAt = useRef(Date.now());
  const [now, setNow] = useState(Date.now());
  const [restEndsAt, setRestEndsAt] = useState(0);
  const [restTotal, setRestTotal] = useState(REST_SECONDS);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const elapsed = Math.floor((now - startedAt.current) / 1000);
  const restLeft = Math.max(0, Math.ceil((restEndsAt - now) / 1000));

  const restWasRunning = useRef(false);
  useEffect(() => {
    if (restWasRunning.current && restLeft === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    restWasRunning.current = restLeft > 0;
  }, [restLeft]);

  const update = (exId: string, i: number, patch: Partial<Row>) =>
    setRows((r) => ({ ...r, [exId]: r[exId].map((row, j) => (j === i ? { ...row, ...patch } : row)) }));

  const toggleDone = (exId: string, i: number) => {
    const wasDone = rows[exId][i].done;
    update(exId, i, { done: !wasDone });
    if (!wasDone) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      setRestTotal(REST_SECONDS);
      setRestEndsAt(Date.now() + REST_SECONDS * 1000);
    }
  };

  const adjustRest = (delta: number) => {
    setRestEndsAt((end) => end + delta * 1000);
    setRestTotal((tot) => Math.max(REST_STEP, tot + delta));
  };

  const allRows = adapted.items.flatMap((item) => rows[item.exerciseId]);
  const doneCount = allRows.filter((r) => r.done).length;
  const volume = adapted.items.reduce(
    (sum, item) =>
      sum +
      (EXERCISES[item.exerciseId].loaded
        ? rows[item.exerciseId].filter((r) => r.done).reduce((s, r) => s + toNumber(r.weight) * toNumber(r.reps), 0)
        : 0),
    0,
  );

  const finish = () => {
    const sets: LoggedSet[] = [];
    for (const item of adapted.items) {
      for (const row of rows[item.exerciseId]) {
        if (!row.done) continue;
        sets.push({ exerciseId: item.exerciseId, weight: toNumber(row.weight), reps: Math.round(toNumber(row.reps)) });
      }
    }
    if (sets.length > 0) {
      addSession({ date: new Date().toISOString(), dayId: day.id, lighter: adapted.lighter, sets, durationSec: elapsed });
    }
    router.back();
  };

  const describe = (ch: Change) => {
    if (ch.type === 'fewerSets') return t('checkin.fewerSets');
    if (ch.type === 'lighter') return t('checkin.lighter');
    return t('checkin.swapped', { from: t(`ex.${ch.from}`), to: t(`ex.${ch.to}`) });
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Stack.Screen
        options={{
          title: t(`days.${day.id}`),
          headerRight: () => <Button compact title={t('workout.finishShort')} onPress={finish} />,
        }}
      />

      {/* Duration, volume and sets, like the summary bar of a logger. */}
      <View style={[styles.stats, { borderBottomColor: c.line }]}>
        {[
          { label: t('workout.duration'), value: clock(elapsed), color: c.accent },
          { label: t('workout.volume'), value: `${Math.round(volume)} kg`, color: c.ink },
          { label: t('workout.sets'), value: `${doneCount}/${allRows.length}`, color: c.ink },
        ].map((s) => (
          <View key={s.label} style={{ flex: 1, gap: 2 }}>
            <Text style={[type.footnote, { color: c.muted }]}>{s.label}</Text>
            <Text style={[type.headline, { color: s.color, fontVariant: ['tabular-nums'] }]}>{s.value}</Text>
          </View>
        ))}
      </View>

      <Screen safeTop={false}>
        {adapted.changes.length > 0 ? (
          <View style={{ backgroundColor: c.warnSoft, borderRadius: radius.m, padding: space.m, gap: space.xs }}>
            <Badge tone="warn" icon="sparkles" label={t('checkin.adjusted')} />
            {adapted.changes.map((ch, i) => (
              <Small key={i} muted={false}>
                {describe(ch)}
              </Small>
            ))}
          </View>
        ) : null}

        {adapted.items.map((item) => {
          const ex = EXERCISES[item.exerciseId];
          const last = lastSetsFor(sessions, item.exerciseId);
          const suggestion = suggestWeight(last, item.target, adapted.lighter);
          const unit = ex.kind === 'time' ? t('common.sec') : t('common.reps');
          return (
            <View key={item.exerciseId} style={{ gap: space.m }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
                <Thumb size={44} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[type.headline, { color: c.accent }]}>{t(`ex.${item.exerciseId}`)}</Text>
                  <Small>{t('workout.target', { sets: item.sets, reps: `${item.target} ${unit}` })}</Small>
                </View>
              </View>

              {suggestion && !adapted.lighter ? (
                <Badge icon="trending-up" label={t('workout.suggestUp', { weight: suggestion })} />
              ) : null}
              {ex.easier ? (
                <Small>
                  {t('workout.easier')}: {t(`ex.${ex.easier}`)}
                </Small>
              ) : null}

              <View>
                <View style={styles.tableRow}>
                  <Text style={[styles.colSet, styles.head, { color: c.muted }]}>{t('workout.colSet')}</Text>
                  <Text style={[styles.colPrev, styles.head, { color: c.muted }]}>{t('workout.colPrevious')}</Text>
                  {ex.loaded ? <Text style={[styles.colNum, styles.head, { color: c.muted }]}>{t('workout.colKg')}</Text> : null}
                  <Text style={[styles.colNum, styles.head, { color: c.muted }]}>{unit.toUpperCase()}</Text>
                  <View style={styles.colCheck}>
                    <Icon name="checkmark" size={16} color={c.muted} />
                  </View>
                </View>

                {rows[item.exerciseId].map((row, i) => {
                  const prev = last?.[i];
                  const prevText = prev ? (ex.loaded && prev.weight > 0 ? `${prev.weight} kg × ${prev.reps}` : `${prev.reps}`) : '–';
                  const cell = [styles.cell, { backgroundColor: row.done ? 'transparent' : c.fill, color: c.ink }];
                  return (
                    <View
                      key={i}
                      style={[styles.tableRow, { backgroundColor: row.done ? c.okSoft : 'transparent', borderRadius: radius.s }]}
                    >
                      <Text style={[styles.colSet, { color: c.ink, fontWeight: '700', fontSize: 16 }]}>{i + 1}</Text>
                      <Text style={[styles.colPrev, { color: c.muted, fontSize: 14 }]} numberOfLines={1}>
                        {prevText}
                      </Text>
                      {ex.loaded ? (
                        <View style={styles.colNum}>
                          <TextInput
                            accessibilityLabel={`${t('workout.set', { n: i + 1 })} kg`}
                            keyboardType="decimal-pad"
                            selectTextOnFocus
                            selectionColor={c.accent}
                            placeholder="0"
                            placeholderTextColor={c.muted}
                            value={row.weight}
                            onChangeText={(v) => update(item.exerciseId, i, { weight: v })}
                            style={cell}
                          />
                        </View>
                      ) : null}
                      <View style={styles.colNum}>
                        <TextInput
                          accessibilityLabel={`${t('workout.set', { n: i + 1 })} ${unit}`}
                          keyboardType="number-pad"
                          selectTextOnFocus
                          selectionColor={c.accent}
                          value={row.reps}
                          onChangeText={(v) => update(item.exerciseId, i, { reps: v })}
                          style={cell}
                        />
                      </View>
                      <View style={styles.colCheck}>
                        <Pressable
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: row.done }}
                          accessibilityLabel={t('workout.markDone', { n: i + 1 })}
                          hitSlop={6}
                          onPress={() => toggleDone(item.exerciseId, i)}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: radius.s,
                            backgroundColor: row.done ? c.ok : c.fill,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon name="checkmark" size={20} color={row.done ? c.okInk : c.muted} />
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

        <Button title={t('workout.finish')} icon="flag" onPress={finish} />
        <View style={{ height: restLeft > 0 ? 120 : 0 }} />
      </Screen>

      {restLeft > 0 ? (
        <View
          accessibilityLiveRegion="polite"
          style={[styles.rest, { backgroundColor: c.surface, borderTopColor: c.line, paddingBottom: space.m + insets.bottom }]}
        >
          <View style={{ height: 4, backgroundColor: c.fill }}>
            <View style={{ height: 4, width: `${Math.min(1, restLeft / restTotal) * 100}%`, backgroundColor: c.accent }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.l, paddingTop: space.m, gap: space.s }}>
            <View style={{ flex: 1 }}>
              <Text style={[type.footnote, { color: c.muted }]}>{t('workout.rest')}</Text>
              <Text style={{ color: c.ink, fontSize: 28, fontWeight: '800', fontVariant: ['tabular-nums'] }}>{clock(restLeft)}</Text>
            </View>
            <Button compact variant="secondary" title={`−${REST_STEP}`} onPress={() => adjustRest(-REST_STEP)} />
            <Button compact variant="secondary" title={`+${REST_STEP}`} onPress={() => adjustRest(REST_STEP)} />
            <Button compact title={t('workout.skipRest')} onPress={() => setRestEndsAt(0)} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stats: {
    flexDirection: 'row',
    paddingHorizontal: space.l,
    paddingVertical: space.m,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tableRow: { flexDirection: 'row', alignItems: 'center', gap: space.s, minHeight: 48, paddingHorizontal: space.xs },
  head: { fontSize: 12, fontWeight: '700', letterSpacing: 0.4 },
  colSet: { width: 32, textAlign: 'center' },
  colPrev: { flex: 1.5 },
  colNum: { flex: 1, alignItems: 'stretch' },
  colCheck: { width: 40, alignItems: 'center' },
  cell: {
    minHeight: 36,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 4,
    fontVariant: ['tabular-nums'],
  },
  rest: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
