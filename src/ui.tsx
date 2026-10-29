import React from 'react';
import { Check, ChevronRight, LucideIcon } from 'lucide-react-native';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { dayKey, startOfWeek } from './logic/dates';
import { radius, space, type, useColors } from './theme';

export type { LucideIcon };

/** Tab page: large title, optional subtitle, scrolling column. */
export function Screen({
  children,
  title,
  subtitle,
  scroll = true,
  gap = space.xl,
  footer,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  scroll?: boolean;
  gap?: number;
  footer?: React.ReactNode;
}) {
  const c = useColors();
  const body = (
    <View style={{ paddingHorizontal: space.l, paddingTop: space.m, paddingBottom: space.xxl, gap }}>
      {title ? (
        <View style={{ gap: space.xs }}>
          <Text accessibilityRole="header" style={[type.largeTitle, { color: c.ink }]}>
            {title}
          </Text>
          {subtitle ? <Muted>{subtitle}</Muted> : null}
        </View>
      ) : null}
      {children}
    </View>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={['top']}>
      {scroll ? (
        <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          {body}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>{body}</View>
      )}
      {footer}
    </SafeAreaView>
  );
}

/** Small uppercase section label. */
export function Label({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  const c = useColors();
  return <Text style={[type.label, { color: c.muted }, style]}>{children}</Text>;
}

export function H2({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  const c = useColors();
  return (
    <Text accessibilityRole="header" style={[type.title, { color: c.ink }, style]}>
      {children}
    </Text>
  );
}

/** 16 px body text; muted by default. */
export function Muted({ children, ink, style, numberOfLines }: { children: React.ReactNode; ink?: boolean; style?: TextStyle; numberOfLines?: number }) {
  const c = useColors();
  return (
    <Text numberOfLines={numberOfLines} style={[type.body, { color: ink ? c.ink : c.muted, lineHeight: 22 }, style]}>
      {children}
    </Text>
  );
}

/** 17 px semibold: row titles and values. */
export function Strong({ children, style, numberOfLines }: { children: React.ReactNode; style?: TextStyle; numberOfLines?: number }) {
  const c = useColors();
  return (
    <Text numberOfLines={numberOfLines} style={[type.headline, { color: c.ink }, style]}>
      {children}
    </Text>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const c = useColors();
  return (
    <View style={[{ backgroundColor: c.surface, borderColor: c.line, borderWidth: 1, borderRadius: radius.l, padding: space.l, gap: space.m }, style]}>
      {children}
    </View>
  );
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon: Icon,
  disabled,
  tall,
  accessibilityLabel,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'text';
  icon?: LucideIcon;
  disabled?: boolean;
  tall?: boolean;
  accessibilityLabel?: string;
}) {
  const c = useColors();
  const fg = variant === 'primary' ? c.accentInk : variant === 'outline' ? c.ink : c.accent;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        minHeight: tall ? 56 : variant === 'text' ? 48 : 52,
        borderRadius: radius.m,
        flexDirection: 'row',
        gap: space.s + 2,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: space.l,
        backgroundColor: variant === 'primary' ? c.accent : 'transparent',
        borderWidth: variant === 'outline' ? 1 : 0,
        borderColor: c.line,
        opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
      })}
    >
      {Icon ? <Icon size={20} color={fg} strokeWidth={2} /> : null}
      <Text style={[type.headline, { color: fg }]}>{title}</Text>
    </Pressable>
  );
}

/** Segmented control: grey track, the chosen option sits on the page colour. */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  height = 48,
  label,
}: {
  options: { value: T; label: string; icon?: LucideIcon }[];
  value: T;
  onChange: (v: T) => void;
  height?: number;
  label?: string;
}) {
  const c = useColors();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      style={{ flexDirection: 'row', backgroundColor: c.surface2, borderRadius: radius.m, padding: 4, gap: 4 }}
    >
      {options.map((o) => {
        const on = o.value === value;
        const Icon = o.icon;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={{
              flex: 1,
              minHeight: height,
              flexDirection: 'row',
              gap: 6,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: radius.s,
              paddingHorizontal: space.xs,
              backgroundColor: on ? c.bg : 'transparent',
            }}
          >
            {Icon ? <Icon size={18} color={on ? c.ink : c.muted} strokeWidth={2} /> : null}
            <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: on ? '600' : '400', color: on ? c.ink : c.muted }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Settings-style row: label left, value and chevron right, hairline on top. */
export function ListRow({
  label,
  value,
  onPress,
  last,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  last?: boolean;
}) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={value ? `${label}, ${value}` : label}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.m,
        minHeight: 52,
        borderTopWidth: 1,
        borderBottomWidth: last ? 1 : 0,
        borderColor: c.line,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Text style={[type.body, { color: c.ink, flex: 1 }]}>{label}</Text>
      {value ? <Text style={[type.body, { color: c.muted }]}>{value}</Text> : null}
      {onPress ? <ChevronRight size={20} color={c.muted} strokeWidth={2} /> : null}
    </Pressable>
  );
}

/** Goal bar: label, "value / goal unit · nog x", pill-shaped track. */
export function Meter({
  label,
  value,
  goal,
  unit,
  remainingLabel,
  color,
}: {
  label: string;
  value: number;
  goal: number;
  unit: string;
  remainingLabel?: string;
  color?: string;
}) {
  const c = useColors();
  const { i18n } = useTranslation();
  const pct = goal > 0 ? Math.min(1, value / goal) : 0;
  const n = (v: number) => Math.round(v).toLocaleString(i18n.language);
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: goal, now: Math.round(value) }}
      style={{ gap: 6 }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: space.s }}>
        <Strong>{label}</Strong>
        <Text style={[type.body, { color: c.muted, fontVariant: ['tabular-nums'] }]}>
          <Text style={[type.headline, { color: c.ink }]}>{n(value)}</Text> / {n(goal)} {unit}
          {remainingLabel ? ` · ${remainingLabel}` : ''}
        </Text>
      </View>
      <View style={{ height: 10, borderRadius: radius.pill, backgroundColor: c.surface2, overflow: 'hidden' }}>
        <View style={{ width: `${pct * 100}%`, height: '100%', borderRadius: radius.pill, backgroundColor: color ?? c.accent }} />
      </View>
    </View>
  );
}

/** Gold "PR" pill. */
export function PrPill({ icon }: { icon?: LucideIcon }) {
  const c = useColors();
  const Icon = icon;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: c.pr }}>
      {Icon ? <Icon size={14} color={c.prInk} strokeWidth={2.5} /> : null}
      <Text style={{ color: c.prInk, fontSize: 13, fontWeight: '700', letterSpacing: 0.5 }}>PR</Text>
    </View>
  );
}

/** Monday–Sunday dots; trained days filled blue with a check, today ringed. */
export function WeekDots({ dates, size = 36, labelsBelow }: { dates: string[]; size?: number; labelsBelow?: boolean }) {
  const c = useColors();
  const { t } = useTranslation();
  const monday = startOfWeek();
  const trained = new Set(dates.map((d) => dayKey(new Date(d))));
  const today = dayKey();
  const names = t('weekdaysShort', { returnObjects: true }) as string[];
  return (
    <View style={{ flexDirection: 'row' }}>
      {names.map((name, i) => {
        const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
        const key = dayKey(d);
        const done = trained.has(key);
        const isToday = key === today;
        const label = (
          <Text style={{ fontSize: 13, color: isToday ? c.ink : c.muted, fontWeight: isToday ? '700' : '400' }}>{name}</Text>
        );
        return (
          <View key={key} style={{ flex: 1, alignItems: 'center', gap: 6 }} accessible accessibilityLabel={`${name}${done ? ' ✓' : ''}`}>
            {labelsBelow ? null : label}
            <View
              style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: done ? c.accent : 'transparent',
                borderWidth: done ? 0 : 2,
                borderColor: isToday ? c.accent : c.line,
              }}
            >
              {done ? <Check size={16} color={c.accentInk} strokeWidth={3} /> : null}
            </View>
            {labelsBelow ? label : null}
          </View>
        );
      })}
    </View>
  );
}

/** Bottom sheet with a grab handle and title. */
export function Sheet({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('common.close')} onPress={onClose} style={[StyleSheet.absoluteFill, { backgroundColor: c.scrim }]} />
        <View
          accessibilityViewIsModal
          style={{
            backgroundColor: c.surface,
            borderTopLeftRadius: radius.sheet,
            borderTopRightRadius: radius.sheet,
            paddingTop: space.s,
            paddingHorizontal: space.l,
            paddingBottom: Math.max(insets.bottom, space.l) + space.s,
          }}
        >
          <View style={{ width: 40, height: 5, borderRadius: radius.pill, backgroundColor: c.line, alignSelf: 'center', marginBottom: space.m }} />
          <H2 style={{ marginBottom: space.s }}>{title}</H2>
          {children}
        </View>
      </View>
    </Modal>
  );
}

/** Action row inside a sheet. */
export function SheetItem({
  icon: Icon,
  label,
  sub,
  onPress,
  last,
  selected,
}: {
  icon?: LucideIcon;
  label: string;
  sub?: string;
  onPress: () => void;
  last?: boolean;
  selected?: boolean;
}) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={selected === undefined ? undefined : { selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        minHeight: 56,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: c.line,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      {Icon ? <Icon size={22} color={c.ink} strokeWidth={2} /> : null}
      <View style={{ flex: 1, gap: 2, paddingVertical: space.s }}>
        <Text style={{ fontSize: 17, color: c.ink }}>{label}</Text>
        {sub ? <Muted>{sub}</Muted> : null}
      </View>
      {selected ? <Check size={22} color={c.accent} strokeWidth={2.5} /> : null}
    </Pressable>
  );
}
