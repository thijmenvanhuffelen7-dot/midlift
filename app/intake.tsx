import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { PainArea, WORKOUTS_PER_WEEK } from '../src/data/program';
import { Barrier, buildPlan, chooseProgram, Equipment, Experience, foodGoalFor, Intake, Location, TrainingGoal } from '../src/logic/intake';
import { Activity, dailyGoals } from '../src/logic/nutrition';
import { useStore } from '../src/store';
import { radius, space, type, useColors } from '../src/theme';
import { Button, Card, Label, Muted, OptionRow, Strong } from '../src/ui';

type Draft = {
  age: string;
  heightCm: string;
  weightKg: string;
  experience?: Experience;
  location?: Location;
  equipment: Equipment[];
  complaints: (PainArea | 'none')[];
  barriers: Barrier[];
  goal?: TrainingGoal;
  activity?: Activity;
};

type Step =
  | { kind: 'number'; key: 'age' | 'heightCm' | 'weightKg'; min: number; max: number; unit: string }
  | { kind: 'single'; key: 'experience' | 'location' | 'goal' | 'activity'; options: (string | number)[] }
  | { kind: 'multi'; key: 'equipment' | 'complaints' | 'barriers'; options: string[]; exclusive?: string };

const STEPS: Step[] = [
  { kind: 'number', key: 'age', min: 30, max: 90, unit: 'years' },
  { kind: 'number', key: 'heightCm', min: 120, max: 220, unit: 'cm' },
  { kind: 'number', key: 'weightKg', min: 35, max: 250, unit: 'kg' },
  { kind: 'single', key: 'experience', options: ['none', 'some', 'regular'] },
  { kind: 'single', key: 'location', options: ['home', 'gym'] },
  { kind: 'multi', key: 'equipment', options: ['dumbbells', 'kettlebell', 'band', 'chair', 'none'], exclusive: 'none' },
  { kind: 'multi', key: 'complaints', options: ['knee', 'back', 'shoulder', 'pelvic', 'none'], exclusive: 'none' },
  { kind: 'multi', key: 'barriers', options: ['time', 'howto', 'injury', 'motivation', 'gym', 'complaints'] },
  { kind: 'single', key: 'goal', options: ['strength', 'energy', 'bones', 'fatloss'] },
  { kind: 'single', key: 'activity', options: [0, 1, 2] },
];

const toNumber = (v: string) => Number(v.replace(',', '.'));

export default function IntakeScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const { completeIntake } = useStore();
  const [draft, setDraft] = useState<Draft>({ age: '', heightCm: '', weightKg: '', equipment: [], complaints: [], barriers: [] });
  const [index, setIndex] = useState(0);

  // Equipment only matters at home.
  const steps = STEPS.filter((s) => !(s.key === 'equipment' && draft.location === 'gym'));
  const done = index >= steps.length;
  const step = steps[Math.min(index, steps.length - 1)];

  const valid = (s: Step): boolean => {
    if (s.kind === 'number') {
      const n = toNumber(draft[s.key]);
      return Number.isFinite(n) && n >= s.min && n <= s.max;
    }
    if (s.kind === 'single') return draft[s.key] !== undefined;
    return s.key === 'barriers' || (draft[s.key] as string[]).length > 0;
  };

  const intake: Intake | null =
    draft.experience && draft.location && draft.goal && draft.activity !== undefined
      ? {
          age: Math.round(toNumber(draft.age)),
          heightCm: Math.round(toNumber(draft.heightCm)),
          weightKg: Math.round(toNumber(draft.weightKg) * 10) / 10,
          experience: draft.experience,
          location: draft.location,
          equipment: draft.location === 'gym' ? [] : draft.equipment.filter((e) => e !== 'none'),
          complaints: draft.complaints.filter((x): x is PainArea => x !== 'none'),
          barriers: draft.barriers,
          goal: draft.goal,
          activity: draft.activity,
        }
      : null;

  const toggle = (key: 'equipment' | 'complaints' | 'barriers', value: string, exclusive?: string) =>
    setDraft((d) => {
      const cur = d[key] as string[];
      let next = cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value];
      if (exclusive) next = value === exclusive ? (next.includes(exclusive) ? [exclusive] : []) : next.filter((x) => x !== exclusive);
      return { ...d, [key]: next };
    });

  const finish = () => {
    if (!intake) return;
    completeIntake(intake);
    router.replace('/paywall');
  };

  const title = done ? t('intake.planTitle') : t(`intake.q.${step.key}.title`);
  const help = done ? t('intake.planSub') : t(`intake.q.${step.key}.help`, { defaultValue: '' });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, paddingHorizontal: space.s, height: 52 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            disabled={index === 0}
            onPress={() => setIndex((i) => Math.max(0, i - 1))}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', opacity: index === 0 ? 0 : 1 }}
          >
            <ChevronLeft size={26} color={c.ink} strokeWidth={2} />
          </Pressable>
          <View style={{ flex: 1, height: 6, borderRadius: radius.pill, backgroundColor: c.surface2, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${(Math.min(index, steps.length) / steps.length) * 100}%`, backgroundColor: c.accent }} />
          </View>
          <Text style={[type.caption, { color: c.muted, width: 44, textAlign: 'center', fontVariant: ['tabular-nums'] }]}>
            {done ? '' : `${index + 1}/${steps.length}`}
          </Text>
        </View>

        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: space.l, gap: space.xl }}>
          <View style={{ gap: space.s }}>
            <Text accessibilityRole="header" style={{ fontSize: 28, fontWeight: '800', letterSpacing: -0.5, color: c.ink }}>
              {title}
            </Text>
            {help ? <Muted>{help}</Muted> : null}
          </View>

          {done && intake ? (
            <PlanSummary intake={intake} />
          ) : step.kind === 'number' ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
              <TextInput
                key={step.key}
                autoFocus={Platform.OS !== 'web'}
                accessibilityLabel={t(`intake.q.${step.key}.title`)}
                keyboardType={step.key === 'weightKg' ? 'decimal-pad' : 'number-pad'}
                value={draft[step.key]}
                onChangeText={(v) => setDraft((d) => ({ ...d, [step.key]: v.replace(/[^0-9.,]/g, '') }))}
                onSubmitEditing={() => valid(step) && setIndex((i) => i + 1)}
                selectionColor={c.accent}
                maxLength={5}
                style={{ flex: 1, minWidth: 0, width: '100%', minHeight: 72, borderRadius: radius.l, backgroundColor: c.surface2, color: c.ink, fontSize: 36, fontWeight: '800', paddingHorizontal: space.l, fontVariant: ['tabular-nums'] }}
              />
              <Text style={[type.title, { color: c.muted, width: 64 }]}>{t(`intake.unit.${step.unit}`)}</Text>
            </View>
          ) : (
            <View style={{ gap: space.s }}>
              {step.options.map((o) => {
                const value = String(o);
                const selected =
                  step.kind === 'single' ? String(draft[step.key]) === value : (draft[step.key] as string[]).includes(value);
                return (
                  <OptionRow
                    key={value}
                    multi={step.kind === 'multi'}
                    label={t(`intake.q.${step.key}.options.${value}`)}
                    sub={t(`intake.q.${step.key}.subs.${value}`, { defaultValue: '' }) || undefined}
                    selected={selected}
                    onPress={() =>
                      step.kind === 'single'
                        ? setDraft((d) => ({ ...d, [step.key]: typeof o === 'number' ? o : value }))
                        : toggle(step.key, value, step.exclusive)
                    }
                  />
                );
              })}
            </View>
          )}
        </ScrollView>

        <View style={{ padding: space.l, paddingBottom: space.s, borderTopWidth: 1, borderTopColor: c.line }}>
          {done ? (
            <Button title={t('intake.toPaywall')} onPress={finish} />
          ) : (
            <Button
              title={index === steps.length - 1 ? t('intake.makePlan') : t('intake.next')}
              disabled={!valid(step)}
              onPress={() => setIndex((i) => i + 1)}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PlanSummary({ intake }: { intake: Intake }) {
  const { t } = useTranslation();
  const c = useColors();
  const program = chooseProgram(intake);
  const plan = buildPlan(program, intake.complaints, intake.equipment);
  const goals = dailyGoals({ ...intake, goal: foodGoalFor(intake.goal) });

  return (
    <View style={{ gap: space.l }}>
      <Card>
        <Label>{t('intake.yourProgram')}</Label>
        <Text style={[type.title, { color: c.ink }]}>{t(`programs.${program}.name`)}</Text>
        <Muted>{t(`programs.${program}.desc`)}</Muted>
        <Muted ink>{t('intake.perWeek', { count: WORKOUTS_PER_WEEK, minutes: plan[0].minutes })}</Muted>
        <View>
          {plan.map((day, i) => (
            <View key={day.id} style={{ minHeight: 56, justifyContent: 'center', gap: 2, borderTopWidth: 1, borderBottomWidth: i === plan.length - 1 ? 1 : 0, borderColor: c.line, paddingVertical: space.s }}>
              <Strong>{t(`days.${day.id}`)}</Strong>
              <Muted numberOfLines={2}>{day.items.map((it) => t(`ex.${it.exerciseId}`)).join(' · ')}</Muted>
            </View>
          ))}
        </View>
      </Card>

      {intake.complaints.length ? (
        <Card>
          <Label>{t('intake.considered')}</Label>
          <Muted ink>
            {t('intake.consideredText', { areas: intake.complaints.map((a) => t(`adjust.area.${a}`)).join(', ') })}
          </Muted>
          <Muted>{t('intake.consideredCheckin')}</Muted>
        </Card>
      ) : null}

      <Card>
        <Label>{t('intake.dailyProtein')}</Label>
        <Text style={{ fontSize: 28, fontWeight: '800', color: c.ink }}>
          {goals.protein} {t('common.g')}
        </Text>
        <Muted>{t('intake.proteinWhy')}</Muted>
      </Card>
    </View>
  );
}
