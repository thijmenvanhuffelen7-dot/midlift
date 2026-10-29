import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowDown, ArrowLeftRight, Check, ChevronDown, Ellipsis, Moon, Pencil, Plus, Trash2, Trophy } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { describeChanges } from '../src/adjustments';
import { EXERCISES, PAIN_AREAS, PainArea } from '../src/data/program';
import { adaptWorkout, Level, suggestWeight } from '../src/logic/adapt';
import { bestWeight, clock, isNewRecord, volume } from '../src/logic/stats';
import { lastSetsFor, LoggedSet, planFor, Session, useStore } from '../src/store';
import { radius, space, type, useColors } from '../src/theme';
import { Button, Label, Muted, PrPill, Sheet, SheetItem } from '../src/ui';

const REST_SECONDS = 90;
const REST_STEP = 15;
const RECORD_BANNER_MS = 4000;
const COLS = { set: 44, num: 68, check: 48 };

type Row = { warm: boolean; weight: string; reps: string; done: boolean };
type Item = { exerciseId: string; target: number; rows: Row[]; note: string; noteOpen: boolean };

const toNumber = (v: string) => Number(v.replace(',', '.')) || 0;

function makeRows(sessions: Session[], exerciseId: string, sets: number, target: number, lighter: boolean): Row[] {
  const last = lastSetsFor(sessions, exerciseId);
  const suggested = suggestWeight(last, target, lighter);
  const weight = suggested ?? (last ? Math.max(...last.map((s) => s.weight)) : 0);
  return Array.from({ length: sets }, () => ({
    warm: false,
    weight: EXERCISES[exerciseId]?.loaded && weight > 0 ? String(weight) : '',
    reps: String(target),
    done: false,
  }));
}

export default function WorkoutScreen() {
  const { t, i18n } = useTranslation();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { sessions, addSession, profile } = useStore();
  const params = useLocalSearchParams<{ dayId: string; energy: string; sleep: string; pain: string }>();

  const plan = useMemo(() => planFor(profile), [profile]);
  const day = plan.find((d) => d.id === params.dayId) ?? plan[0];
  const checkIn = useMemo(
    () => ({
      energy: (params.energy === '0' ? 0 : params.energy === '2' ? 2 : 1) as Level,
      sleep: (params.sleep === '0' ? 0 : params.sleep === '2' ? 2 : 1) as Level,
      pain: (PAIN_AREAS.includes(params.pain as PainArea) ? params.pain : 'none') as PainArea | 'none',
    }),
    [params.energy, params.sleep, params.pain],
  );
  const adapted = useMemo(() => adaptWorkout(day, checkIn), [day, checkIn]);
  const summary = describeChanges(t, adapted.changes, checkIn);

  const [items, setItems] = useState<Item[]>(() =>
    adapted.items.map((it) => ({
      exerciseId: it.exerciseId,
      target: it.target,
      rows: makeRows(sessions, it.exerciseId, it.sets, it.target, adapted.lighter),
      note: '',
      noteOpen: false,
    })),
  );
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [sheetFor, setSheetFor] = useState<number | null>(null);
  const [record, setRecord] = useState<{ exerciseId: string; weight: number; reps: number; until: number } | null>(null);

  // One clock drives the duration, the rest timer and the record banner.
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
    if (restWasRunning.current && restLeft === 0) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    restWasRunning.current = restLeft > 0;
  }, [restLeft]);

  const [headerH, setHeaderH] = useState(0);

  const updateItem = (i: number, fn: (it: Item) => Item) => setItems((all) => all.map((it, j) => (j === i ? fn(it) : it)));
  const updateRow = (i: number, r: number, patch: Partial<Row>) =>
    updateItem(i, (it) => ({ ...it, rows: it.rows.map((row, k) => (k === r ? { ...row, ...patch } : row)) }));

  const toggleDone = (i: number, r: number) => {
    const it = items[i];
    const row = it.rows[r];
    updateRow(i, r, { done: !row.done });
    if (row.done) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setRestTotal(REST_SECONDS);
    setRestEndsAt(Date.now() + REST_SECONDS * 1000);
    const weight = toNumber(row.weight);
    const doneToday = it.rows.filter((x, k) => k !== r && x.done && !x.warm).map((x) => toNumber(x.weight));
    const best = Math.max(bestWeight(sessions, it.exerciseId), ...doneToday);
    if (!row.warm && EXERCISES[it.exerciseId]?.loaded && isNewRecord(best, weight)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setRecord({ exerciseId: it.exerciseId, weight, reps: Math.round(toNumber(row.reps)), until: Date.now() + RECORD_BANNER_MS });
    }
  };

  const addSet = (i: number) =>
    updateItem(i, (it) => {
      const last = it.rows[it.rows.length - 1];
      return { ...it, rows: [...it.rows, { warm: false, weight: last?.weight ?? '', reps: last?.reps ?? String(it.target), done: false }] };
    });

  const replaceExercise = (i: number, to: string) =>
    updateItem(i, (it) => ({ ...it, exerciseId: to, rows: makeRows(sessions, to, it.rows.filter((r) => !r.warm).length || 1, it.target, adapted.lighter) }));

  // Live totals: working sets only.
  const working = items.flatMap((it) => it.rows.filter((r) => !r.warm).map((r) => ({ it, r })));
  const doneSets: LoggedSet[] = working
    .filter(({ r }) => r.done)
    .map(({ it, r }) => ({ exerciseId: it.exerciseId, weight: EXERCISES[it.exerciseId]?.loaded ? toNumber(r.weight) : 0, reps: Math.round(toNumber(r.reps)) }));
  const kg = volume(doneSets);

  const finish = () => {
    const sets: LoggedSet[] = [];
    const notes: Record<string, string> = {};
    for (const it of items) {
      const loaded = EXERCISES[it.exerciseId]?.loaded;
      for (const r of it.rows)
        if (r.done) sets.push({ exerciseId: it.exerciseId, weight: loaded ? toNumber(r.weight) : 0, reps: Math.round(toNumber(r.reps)), ...(r.warm ? { warmup: true } : {}) });
      if (it.note.trim()) notes[it.exerciseId] = it.note.trim();
    }
    if (!sets.some((s) => !s.warmup)) {
      router.back();
      return;
    }
    // A record: the heaviest working set of an exercise beats everything logged before.
    const records = [...new Set(sets.map((s) => s.exerciseId))].flatMap((id) => {
      const mine = sets.filter((s) => s.exerciseId === id && !s.warmup);
      const top = mine.reduce((a, b) => (b.weight > a.weight ? b : a));
      return isNewRecord(bestWeight(sessions, id), top.weight) ? [{ exerciseId: id, weight: top.weight, reps: top.reps }] : [];
    });
    const id = addSession({ date: new Date().toISOString(), dayId: day.id, lighter: adapted.lighter, sets, durationSec: elapsed, records, notes });
    router.replace({ pathname: '/done', params: { id } });
  };

  const sheetItem = sheetFor !== null ? items[sheetFor] : undefined;
  const sheetEx = sheetItem ? EXERCISES[sheetItem.exerciseId] : undefined;
  const swapTo = sheetEx ? Object.values(sheetEx.swapFor ?? {}).find((id) => id && id !== sheetEx.easier) ?? undefined : undefined;

  const stat = (label: string, value: string, align: 'flex-start' | 'center') => (
    <View style={{ gap: 2, alignItems: align, minWidth: align === 'flex-start' ? 64 : undefined }}>
      <Label>{label}</Label>
      <Text style={[type.headline, { color: c.ink, fontVariant: ['tabular-nums'] }]}>{value}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View
        onLayout={(e) => setHeaderH(e.nativeEvent.layout.height)}
        style={[styles.header, { paddingTop: insets.top + space.s, borderBottomColor: c.line, backgroundColor: c.bg }]}
      >
        {stat(t('workout.duration'), clock(elapsed), 'flex-start')}
        <View style={{ flexDirection: 'row', gap: space.xl }}>
          {stat(t('workout.volume'), `${Math.round(kg).toLocaleString(i18n.language)} kg`, 'center')}
          {stat(t('workout.sets'), `${doneSets.length} / ${working.length}`, 'center')}
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={finish}
          style={({ pressed }) => [styles.finish, { backgroundColor: c.accent, opacity: pressed ? 0.8 : 1 }]}
        >
          <Text style={[type.headline, { color: c.accentInk }]}>{t('workout.finish')}</Text>
        </Pressable>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 140 + insets.bottom }}>
        {summary ? (
          <View style={{ backgroundColor: c.surface, borderBottomWidth: 1, borderBottomColor: c.line }}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: checkinOpen }}
              onPress={() => setCheckinOpen((o) => !o)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, paddingHorizontal: space.l, paddingVertical: space.m, minHeight: 48 }}
            >
              <Moon size={20} color={c.accent} strokeWidth={2} />
              <Muted ink style={{ flex: 1 }}>
                {summary.short}
              </Muted>
              <View style={{ transform: [{ rotate: checkinOpen ? '180deg' : '0deg' }] }}>
                <ChevronDown size={20} color={c.muted} strokeWidth={2} />
              </View>
            </Pressable>
            {checkinOpen ? <Muted style={{ paddingLeft: 48, paddingRight: space.l, paddingBottom: space.m }}>{summary.detail}</Muted> : null}
          </View>
        ) : null}

        <View style={{ gap: space.l, padding: space.l }}>
          {items.map((it, i) => {
            const ex = EXERCISES[it.exerciseId];
            const last = lastSetsFor(sessions, it.exerciseId);
            const unit = ex.kind === 'time' ? t('workout.colSec') : t('workout.colReps');
            let n = 0;
            return (
              <View key={`${it.exerciseId}-${i}`} style={[styles.card, { backgroundColor: c.surface, borderColor: c.line }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.s, paddingLeft: space.xs }}>
                  <Text style={[type.headline, { color: c.accent, flex: 1 }]}>{t(`ex.${it.exerciseId}`)}</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('workout.moreFor', { name: t(`ex.${it.exerciseId}`) })}
                    onPress={() => setSheetFor(i)}
                    style={styles.iconButton}
                  >
                    <Ellipsis size={22} color={c.muted} strokeWidth={2} />
                  </Pressable>
                </View>
                {t(`cue.${it.exerciseId}`, { defaultValue: '' }) ? (
                  <Muted style={{ marginTop: -space.xs, marginBottom: space.xs, marginLeft: space.xs }}>{t(`cue.${it.exerciseId}`)}</Muted>
                ) : null}
                {it.noteOpen ? (
                  <TextInput
                    value={it.note}
                    onChangeText={(note) => updateItem(i, (x) => ({ ...x, note }))}
                    placeholder={t('workout.notePlaceholder')}
                    placeholderTextColor={c.muted}
                    selectionColor={c.accent}
                    multiline
                    style={{ marginHorizontal: space.xs, minHeight: 48, borderRadius: radius.m, backgroundColor: c.surface2, color: c.ink, fontSize: 16, paddingHorizontal: space.m, paddingVertical: space.m }}
                  />
                ) : null}

                <View style={[styles.grid, { paddingHorizontal: space.xs }]}>
                  <Label style={{ width: COLS.set, textAlign: 'center' }}>{t('workout.colSet')}</Label>
                  <Label style={{ flex: 1 }}>{t('workout.colPrevious')}</Label>
                  <Label style={{ width: COLS.num, textAlign: 'center' }}>{t('workout.colKg')}</Label>
                  <Label style={{ width: COLS.num, textAlign: 'center' }}>{unit}</Label>
                  <View style={{ width: COLS.check, alignItems: 'center' }}>
                    <Check size={14} color={c.muted} strokeWidth={2.5} />
                  </View>
                </View>

                <View style={{ gap: space.xs }}>
                  {it.rows.map((row, r) => {
                    if (!row.warm) n += 1;
                    const setLabel = row.warm ? t('workout.warmShort') : String(n);
                    const prevSet = row.warm ? undefined : last?.[n - 1];
                    const prev = prevSet
                      ? ex.loaded && prevSet.weight > 0
                        ? `${prevSet.weight} kg × ${prevSet.reps}`
                        : `${prevSet.reps}${ex.kind === 'time' ? ' s' : ''}`
                      : '–';
                    const field = [styles.field, { backgroundColor: row.done ? 'transparent' : c.surface2, color: c.ink }];
                    return (
                      <View key={r} style={[styles.grid, styles.row, { backgroundColor: row.done ? c.doneSoft : 'transparent' }]}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={row.warm ? t('workout.warmAria') : t('workout.setAria', { n })}
                          onPress={() => updateRow(i, r, { warm: !row.warm })}
                          style={{ width: COLS.set, height: 48, alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Text style={{ fontSize: 17, fontWeight: '700', color: row.warm ? c.pr : c.ink }}>{setLabel}</Text>
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={prevSet ? t('workout.prevAria', { prev }) : undefined}
                          disabled={!prevSet}
                          onPress={() => prevSet && updateRow(i, r, { weight: ex.loaded ? String(prevSet.weight) : row.weight, reps: String(prevSet.reps) })}
                          style={{ flex: 1, height: 48, justifyContent: 'center' }}
                        >
                          <Text numberOfLines={1} style={{ fontSize: 16, color: c.muted }}>
                            {prev}
                          </Text>
                        </Pressable>
                        {ex.loaded ? (
                          <TextInput
                            accessibilityLabel={t('workout.kgAria', { set: setLabel })}
                            keyboardType="decimal-pad"
                            selectTextOnFocus
                            selectionColor={c.accent}
                            placeholder="0"
                            placeholderTextColor={c.muted}
                            value={row.weight}
                            onChangeText={(v) => updateRow(i, r, { weight: v })}
                            style={field}
                          />
                        ) : (
                          <Text style={[styles.field, { color: c.muted, lineHeight: 48 }]}>–</Text>
                        )}
                        <TextInput
                          accessibilityLabel={t('workout.repsAria', { set: setLabel })}
                          keyboardType="number-pad"
                          selectTextOnFocus
                          selectionColor={c.accent}
                          value={row.reps}
                          onChangeText={(v) => updateRow(i, r, { reps: v })}
                          style={field}
                        />
                        <Pressable
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: row.done }}
                          accessibilityLabel={t('workout.markDone', { n: setLabel })}
                          onPress={() => toggleDone(i, r)}
                          style={[
                            styles.check,
                            { backgroundColor: row.done ? c.doneSoft : c.surface2, borderColor: row.done ? c.done : c.surface2 },
                          ]}
                        >
                          <Check size={22} color={row.done ? c.done : c.muted} strokeWidth={2.5} />
                        </Pressable>
                      </View>
                    );
                  })}
                </View>

                <Button variant="text" icon={Plus} title={t('workout.addSet')} onPress={() => addSet(i)} />
              </View>
            );
          })}
        </View>
      </ScrollView>

      {record && record.until > now ? (
        <View
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={[styles.toast, { top: headerH + space.m, backgroundColor: c.surface, borderColor: c.pr }]}
        >
          <PrPill icon={Trophy} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[type.headline, { color: c.ink }]}>{t('workout.newRecord')}</Text>
            <Muted>
              {t(`ex.${record.exerciseId}`)} · {record.weight} kg × {record.reps}
            </Muted>
          </View>
        </View>
      ) : null}

      {restLeft > 0 && sheetFor === null ? (
        <View
          accessibilityRole="timer"
          accessibilityLabel={t('workout.restTimer')}
          style={[styles.rest, { bottom: insets.bottom + space.m, backgroundColor: c.surface2, borderColor: c.line }]}
        >
          <View style={{ height: 4, borderRadius: radius.pill, backgroundColor: c.line, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${Math.min(1, restLeft / restTotal) * 100}%`, backgroundColor: c.accent }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s }}>
            <View style={{ flex: 1 }}>
              <Label>{t('workout.rest')}</Label>
              <Text style={{ fontSize: 28, fontWeight: '700', color: c.ink, fontVariant: ['tabular-nums'] }}>{clock(restLeft)}</Text>
            </View>
            {[
              { label: `−${REST_STEP} s`, a11y: t('workout.restMinus'), delta: -REST_STEP },
              { label: `+${REST_STEP} s`, a11y: t('workout.restPlus'), delta: REST_STEP },
            ].map((b) => (
              <Pressable
                key={b.label}
                accessibilityRole="button"
                accessibilityLabel={b.a11y}
                onPress={() => {
                  setRestEndsAt((end) => end + b.delta * 1000);
                  if (b.delta > 0) setRestTotal((tot) => Math.max(tot, restLeft + b.delta));
                }}
                style={({ pressed }) => [styles.restButton, { borderColor: c.line, backgroundColor: c.surface, opacity: pressed ? 0.7 : 1 }]}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: c.ink }}>{b.label}</Text>
              </Pressable>
            ))}
            <Pressable accessibilityRole="button" onPress={() => setRestEndsAt(0)} style={{ height: 48, paddingHorizontal: space.m, justifyContent: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: c.accent }}>{t('workout.skipRest')}</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <Sheet visible={sheetFor !== null} title={sheetItem ? t(`ex.${sheetItem.exerciseId}`) : ''} onClose={() => setSheetFor(null)}>
        {sheetFor !== null && sheetItem && sheetEx ? (
          <>
            {swapTo ? (
              <SheetItem
                icon={ArrowLeftRight}
                label={t('workout.menuSwap')}
                sub={t(`ex.${swapTo}`)}
                onPress={() => {
                  replaceExercise(sheetFor, swapTo);
                  setSheetFor(null);
                }}
              />
            ) : null}
            {sheetEx.easier ? (
              <SheetItem
                icon={ArrowDown}
                label={t('workout.menuEasier')}
                sub={t(`ex.${sheetEx.easier}`)}
                onPress={() => {
                  replaceExercise(sheetFor, sheetEx.easier!);
                  setSheetFor(null);
                }}
              />
            ) : null}
            <SheetItem
              icon={Pencil}
              label={t('workout.menuNote')}
              onPress={() => {
                updateItem(sheetFor, (x) => ({ ...x, noteOpen: true }));
                setSheetFor(null);
              }}
            />
            <SheetItem
              icon={Trash2}
              label={t('workout.menuRemove')}
              last
              onPress={() => {
                setItems((all) => all.filter((_, j) => j !== sheetFor));
                setSheetFor(null);
              }}
            />
            <View style={{ marginTop: space.m }}>
              <Button variant="outline" title={t('common.cancel')} onPress={() => setSheetFor(null)} />
            </View>
          </>
        ) : null}
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.s,
    paddingHorizontal: space.l,
    paddingBottom: space.m,
    borderBottomWidth: 1,
  },
  finish: { minHeight: 48, paddingHorizontal: 18, borderRadius: radius.m, justifyContent: 'center' },
  card: { borderWidth: 1, borderRadius: radius.l, paddingTop: space.m, paddingHorizontal: space.m, paddingBottom: space.xs, gap: space.s },
  iconButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.m },
  grid: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  row: { padding: space.xs, borderRadius: radius.m },
  field: { width: COLS.num, height: 48, borderRadius: radius.m, textAlign: 'center', fontSize: 17, fontWeight: '600', fontVariant: ['tabular-nums'] },
  check: { width: COLS.check, height: 48, borderRadius: radius.m, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  toast: {
    position: 'absolute',
    left: space.l,
    right: space.l,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.m,
    paddingVertical: space.m,
    paddingHorizontal: 14,
    borderRadius: radius.l,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  rest: {
    position: 'absolute',
    left: space.m,
    right: space.m,
    gap: 10,
    paddingVertical: space.m,
    paddingLeft: space.l,
    paddingRight: space.m,
    borderRadius: radius.l,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  restButton: { minWidth: 56, height: 48, borderWidth: 1, borderRadius: radius.m, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.s },
});
