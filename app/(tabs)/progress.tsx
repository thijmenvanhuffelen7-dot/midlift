import { router } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { EXERCISES } from '../../src/data/program';
import { dayKey } from '../../src/logic/dates';
import { exerciseSeries, monthGrid, Point, records } from '../../src/logic/stats';
import { useStore } from '../../src/store';
import { space, type, useColors } from '../../src/theme';
import { Button, Card, H2, Muted, PrPill, Screen, Segmented, Sheet, SheetItem, Strong } from '../../src/ui';

type Metric = 'heaviest' | 'volume';
const CHART_H = 160;
const CHART_FONT = Platform.select({ ios: 'System', android: 'sans-serif', default: '-apple-system, system-ui, sans-serif' });

function LineChart({ points, unit, todayLabel, lang }: { points: Point[]; unit: string; todayLabel: string; lang: string }) {
  const c = useColors();
  const [w, setW] = useState(0);
  const values = points.map((p) => p.value);
  const hi = Math.max(...values);
  const lo0 = Math.min(...values);
  const lo = hi === lo0 ? Math.max(0, Math.floor(hi * 0.5)) : Math.max(0, Math.floor(lo0 - (hi - lo0) / 2));
  const mid = Math.round((hi + lo) / 2);
  const top = 44;
  const bottom = 140;
  const y = (v: number) => (hi === lo ? (top + bottom) / 2 : bottom - ((v - lo) / (hi - lo)) * (bottom - top));
  const left = 30;
  const right = Math.max(left, w - 16);
  const x = (i: number) => (points.length === 1 ? right : left + (i * (right - left)) / (points.length - 1));
  const fmt = (iso: string) => new Date(iso).toLocaleDateString(lang, { day: 'numeric', month: 'short' });
  const lastIso = points[points.length - 1].date;
  const lastLabel = dayKey(new Date(lastIso)) === dayKey() ? todayLabel : fmt(lastIso);
  const midIdx = Math.floor((points.length - 1) / 2);
  const n = (v: number) => Math.round(v).toLocaleString(lang);

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} accessible accessibilityRole="image" accessibilityLabel={`${n(values[0])} → ${n(hi)} ${unit}`}>
      {w > 0 ? (
        <Svg width={w} height={CHART_H}>
          {[bottom, (top + bottom) / 2, top].map((gy) => (
            <Line key={gy} x1={0} y1={gy} x2={w} y2={gy} stroke={c.line} strokeWidth={1} />
          ))}
          <SvgText x={0} y={bottom - 4} fill={c.muted} fontSize={13} fontFamily={CHART_FONT}>
            {n(lo)}
          </SvgText>
          <SvgText x={0} y={(top + bottom) / 2 - 4} fill={c.muted} fontSize={13} fontFamily={CHART_FONT}>
            {n(mid)}
          </SvgText>
          <SvgText x={0} y={top - 4} fill={c.muted} fontSize={13} fontFamily={CHART_FONT}>
            {`${n(hi)} ${unit}`}
          </SvgText>
          {points.length > 1 ? (
            <Polyline
              points={points.map((p, i) => `${x(i)},${y(p.value)}`).join(' ')}
              fill="none"
              stroke={c.accent}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
          {points.slice(0, -1).map((p, i) => (
            <Circle key={i} cx={x(i)} cy={y(p.value)} r={3} fill={c.accent} />
          ))}
          <Circle cx={x(points.length - 1)} cy={y(points[points.length - 1].value)} r={9} fill={c.accent} fillOpacity={0.2} />
          <Circle cx={x(points.length - 1)} cy={y(points[points.length - 1].value)} r={5} fill={c.accent} stroke={c.surface} strokeWidth={2} />
          {points.length > 2 ? (
            <SvgText x={x(0)} y={158} fill={c.muted} fontSize={13} fontFamily={CHART_FONT} textAnchor="start">
              {fmt(points[0].date)}
            </SvgText>
          ) : null}
          {points.length > 2 ? (
            <SvgText x={x(midIdx)} y={158} fill={c.muted} fontSize={13} fontFamily={CHART_FONT} textAnchor="middle">
              {fmt(points[midIdx].date)}
            </SvgText>
          ) : null}
          <SvgText x={x(points.length - 1)} y={158} fill={c.muted} fontSize={13} fontFamily={CHART_FONT} textAnchor="end">
            {lastLabel}
          </SvgText>
        </Svg>
      ) : (
        <View style={{ height: CHART_H }} />
      )}
    </View>
  );
}

function MonthCalendar({ dates, lang }: { dates: string[]; lang: string }) {
  const { t } = useTranslation();
  const c = useColors();
  const now = new Date();
  const trained = new Set(dates.map((d) => dayKey(new Date(d))));
  const grid = monthGrid(now.getFullYear(), now.getMonth());
  const inMonth = dates.filter((d) => {
    const x = new Date(d);
    return x.getFullYear() === now.getFullYear() && x.getMonth() === now.getMonth();
  }).length;
  const title = now.toLocaleDateString(lang, { month: 'long', year: 'numeric' });
  const names = t('weekdaysShort', { returnObjects: true }) as string[];
  const cells = [...grid, ...Array.from({ length: (7 - (grid.length % 7)) % 7 }, () => null)];

  return (
    <View style={{ gap: space.m }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.s }}>
        <H2>{title.charAt(0).toUpperCase() + title.slice(1)}</H2>
        <Muted>{t('progress.workoutsCount', { count: inMonth })}</Muted>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {names.map((n) => (
          <Text key={n} style={{ width: `${100 / 7}%`, textAlign: 'center', fontSize: 13, fontWeight: '600', color: c.muted, paddingBottom: space.xs }}>
            {n}
          </Text>
        ))}
        {cells.map((d, i) => {
          const key = d ? dayKey(new Date(now.getFullYear(), now.getMonth(), d)) : `pad-${i}`;
          const on = d !== null && trained.has(key);
          const isToday = d !== null && key === dayKey();
          return (
            <View key={key} style={{ width: `${100 / 7}%`, height: 44, alignItems: 'center', justifyContent: 'center' }}>
              {d !== null ? (
                <View
                  accessible
                  accessibilityLabel={`${d}${on ? ' ✓' : ''}`}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: on ? c.accent : 'transparent',
                    borderWidth: isToday ? 2 : 0,
                    borderColor: c.ink,
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: on || isToday ? '700' : '400', color: on ? c.accentInk : c.ink, fontVariant: ['tabular-nums'] }}>{d}</Text>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function Progress() {
  const { t, i18n } = useTranslation();
  const c = useColors();
  const { sessions } = useStore();

  const recs = records(sessions);
  const charted = recs.map((r) => r.exerciseId).filter((id) => EXERCISES[id]?.loaded);
  const [picked, setPicked] = useState<string | null>(null);
  const [metric, setMetric] = useState<Metric>('heaviest');
  const [pickerOpen, setPickerOpen] = useState(false);
  // Default to the exercise with the longest history, so the chart has a line to show.
  const longest = [...charted].sort((a, b) => exerciseSeries(sessions, b, 'heaviest').length - exerciseSeries(sessions, a, 'heaviest').length)[0];
  const exerciseId = picked && charted.includes(picked) ? picked : longest;

  if (sessions.length === 0) {
    return (
      <Screen title={t('progress.title')}>
        <Card style={{ alignItems: 'flex-start' }}>
          <H2>{t('progress.emptyTitle')}</H2>
          <Muted>{t('progress.empty')}</Muted>
          <Button title={t('progress.toToday')} onPress={() => router.navigate('/')} />
        </Card>
      </Screen>
    );
  }

  const series = exerciseId ? exerciseSeries(sessions, exerciseId, metric) : [];
  const latest = series[series.length - 1];
  const first = series[0];
  const delta = latest && first ? latest.value - first.value : 0;
  const n = (v: number) => Math.round(v).toLocaleString(i18n.language);
  const latestDate = sessions[0]?.date;
  const fmtDate = (iso: string) =>
    dayKey(new Date(iso)) === dayKey() ? t('progress.today') : new Date(iso).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long' });

  return (
    <Screen title={t('progress.title')}>
      {exerciseId && latest ? (
        <Card>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('progress.pickExercise')}
            onPress={() => setPickerOpen(true)}
            style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 48 }}
          >
            <H2>{t(`ex.${exerciseId}`)}</H2>
            <ChevronDown size={20} color={c.muted} strokeWidth={2} />
          </Pressable>
          <Segmented<Metric>
            label={t('progress.metric')}
            height={44}
            value={metric}
            onChange={setMetric}
            options={[
              { value: 'heaviest', label: t('progress.heaviest') },
              { value: 'volume', label: t('progress.totalVolume') },
            ]}
          />
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.s, flexWrap: 'wrap' }}>
            <Text style={{ fontSize: 32, fontWeight: '800', color: c.ink, fontVariant: ['tabular-nums'] }}>{n(latest.value)} kg</Text>
            {series.length > 1 ? (
              <Muted>
                {t('progress.since', {
                  delta: `${delta >= 0 ? '+' : '−'}${n(Math.abs(delta))} kg`,
                  date: new Date(first.date).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' }),
                })}
              </Muted>
            ) : null}
          </View>
          <LineChart points={series} unit="kg" todayLabel={t('progress.today').toLowerCase()} lang={i18n.language} />
        </Card>
      ) : null}

      {recs.length > 0 ? (
        <View>
          <H2 style={{ marginBottom: space.s }}>{t('progress.records')}</H2>
          {recs.map((r) => (
            <View key={r.exerciseId} style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 56, borderTopWidth: 1, borderTopColor: c.line }}>
              <View style={{ flex: 1, gap: 2 }}>
                <Strong>{t(`ex.${r.exerciseId}`)}</Strong>
                <Muted>{fmtDate(r.date)}</Muted>
              </View>
              {r.date === latestDate && sessions[0].records?.some((x) => x.exerciseId === r.exerciseId) ? <PrPill /> : null}
              <Strong style={{ fontVariant: ['tabular-nums'] }}>
                {r.weight} kg × {r.reps}
              </Strong>
            </View>
          ))}
        </View>
      ) : null}

      <MonthCalendar dates={sessions.map((s) => s.date)} lang={i18n.language} />

      <Sheet visible={pickerOpen} title={t('progress.pickExercise')} onClose={() => setPickerOpen(false)}>
        {charted.map((id, i) => (
          <SheetItem
            key={id}
            label={t(`ex.${id}`)}
            selected={id === exerciseId}
            last={i === charted.length - 1}
            onPress={() => {
              setPicked(id);
              setPickerOpen(false);
            }}
          />
        ))}
      </Sheet>
    </Screen>
  );
}
