import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  ColorValue,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { radius, space, type, useColors } from './theme';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function Icon({ name, size = 20, color }: { name: IconName; size?: number; color: ColorValue }) {
  return <Ionicons name={name} size={size} color={color as string} />;
}

/**
 * Page wrapper with an optional large title.
 * Tab screens pad for the status bar; stack screens with a header pass safeTop={false}.
 */
export function Screen({
  children,
  title,
  subtitle,
  scroll = true,
  safeTop = true,
  footer,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  scroll?: boolean;
  safeTop?: boolean;
  /** pinned under the scroll area, e.g. a primary button */
  footer?: React.ReactNode;
}) {
  const c = useColors();
  const body = (
    <View style={{ paddingHorizontal: space.l, paddingTop: safeTop ? space.s : space.l, paddingBottom: space.xxl, gap: space.xl }}>
      {title ? (
        <View style={{ gap: 2 }}>
          <Text accessibilityRole="header" style={[type.largeTitle, { color: c.ink }]}>
            {title}
          </Text>
          {subtitle ? <Text style={[type.subhead, { color: c.muted }]}>{subtitle}</Text> : null}
        </View>
      ) : null}
      {children}
    </View>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={safeTop ? ['top'] : []}>
      {scroll ? (
        <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          {body}
        </ScrollView>
      ) : (
        body
      )}
      {footer}
    </SafeAreaView>
  );
}

/** Bottom bar for a screen's primary action. */
export function Footer({ children }: { children: React.ReactNode }) {
  const c = useColors();
  return (
    <SafeAreaView edges={['bottom']} style={{ backgroundColor: c.bg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.line }}>
      <View style={{ paddingHorizontal: space.l, paddingTop: space.m, paddingBottom: space.s }}>{children}</View>
    </SafeAreaView>
  );
}

export function H2({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  const c = useColors();
  return (
    <Text accessibilityRole="header" style={[type.title, { color: c.ink }, style]}>
      {children}
    </Text>
  );
}

export function Body({ children, muted, style }: { children: React.ReactNode; muted?: boolean; style?: TextStyle }) {
  const c = useColors();
  return <Text style={[type.body, { color: muted ? c.muted : c.ink, lineHeight: 23 }, style]}>{children}</Text>;
}

export function Small({ children, muted = true, style }: { children: React.ReactNode; muted?: boolean; style?: TextStyle }) {
  const c = useColors();
  return <Text style={[type.subhead, { color: muted ? c.muted : c.ink, lineHeight: 20 }, style]}>{children}</Text>;
}

/** A titled group: heading row (with optional trailing text) above its content. */
export function Section({
  title,
  trailing,
  children,
  gap = space.m,
}: {
  title: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
  gap?: number;
}) {
  const c = useColors();
  return (
    <View style={{ gap }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: space.m }}>
        <Text accessibilityRole="header" style={[type.title, { color: c.ink, flexShrink: 1 }]}>
          {title}
        </Text>
        {typeof trailing === 'string' ? <Small>{trailing}</Small> : trailing}
      </View>
      {children}
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const c = useColors();
  return (
    <View
      style={[
        {
          backgroundColor: c.surface,
          borderColor: c.line,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderRadius: radius.l,
          padding: space.l,
          gap: space.m,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  compact,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'plain';
  icon?: IconName;
  disabled?: boolean;
  compact?: boolean;
}) {
  const c = useColors();
  const bg = variant === 'primary' ? c.accent : variant === 'secondary' ? c.fill : 'transparent';
  const fg = variant === 'primary' ? c.accentInk : variant === 'secondary' ? c.ink : c.accent;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      onPress={onPress}
      disabled={disabled}
      hitSlop={compact ? 6 : 0}
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        { backgroundColor: bg, opacity: disabled ? 0.45 : pressed ? 0.8 : 1 },
      ]}
    >
      {icon ? <Icon name={icon} size={compact ? 18 : 20} color={fg} /> : null}
      <Text style={{ color: fg, fontWeight: '700', fontSize: compact ? 15 : 17 }}>{title}</Text>
    </Pressable>
  );
}

/** Segmented control: one choice out of a few, in a grey track. */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const c = useColors();
  return (
    <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', backgroundColor: c.fill, borderRadius: radius.m, padding: 3, gap: 3 }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={{
              flex: 1,
              minHeight: 40,
              paddingHorizontal: space.s,
              paddingVertical: space.s,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: radius.s + 1,
              backgroundColor: on ? c.segment : 'transparent',
              ...(on ? styles.raised : null),
            }}
          >
            <Text style={{ color: c.ink, fontWeight: on ? '700' : '500', fontSize: 15, textAlign: 'center' }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Single-choice list with a checkmark, for options too long for a segmented control. */
export function ChoiceList<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const c = useColors();
  return (
    <View accessibilityRole="radiogroup" style={{ backgroundColor: c.fill, borderRadius: radius.m, paddingHorizontal: space.l }}>
      {options.map((o, i) => {
        const on = o.value === value;
        return (
          <View key={String(o.value)}>
            {i > 0 ? <Divider /> : null}
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              onPress={() => onChange(o.value)}
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', minHeight: 50, gap: space.m, opacity: pressed ? 0.6 : 1 })}
            >
              <Text style={[type.body, { color: c.ink, flex: 1, fontWeight: on ? '600' : '400' }]}>{o.label}</Text>
              {on ? <Icon name="checkmark" size={22} color={c.accent} /> : null}
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

/** Pill chips that wrap; the selected one fills blue. */
export function Chips<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; icon?: IconName }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const c = useColors();
  return (
    <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.s }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              minHeight: 44,
              paddingHorizontal: space.l,
              borderRadius: radius.pill,
              backgroundColor: on ? c.accent : c.fill,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            {o.icon ? <Icon name={o.icon} size={18} color={on ? c.accentInk : c.muted} /> : null}
            <Text style={{ color: on ? c.accentInk : c.ink, fontWeight: '600', fontSize: 16 }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Filled text field with an optional label above it. */
export function Input(props: TextInputProps & { label?: string; icon?: IconName }) {
  const c = useColors();
  const { label, icon, style, ...rest } = props;
  return (
    <View style={{ gap: 6, flex: 1 }}>
      {label ? <Text style={[type.footnote, { color: c.muted, fontWeight: '600' }]}>{label}</Text> : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: c.fill, borderRadius: radius.m, paddingHorizontal: space.m, gap: space.s }}>
        {icon ? <Icon name={icon} size={18} color={c.muted} /> : null}
        <TextInput
          placeholderTextColor={c.muted}
          selectionColor={c.accent}
          {...rest}
          style={[{ flex: 1, minHeight: 48, color: c.ink, fontSize: 17, paddingVertical: space.s }, style]}
        />
      </View>
    </View>
  );
}

/** Thin progress bar with a label and value. */
export function Meter({
  label,
  value,
  goal,
  unit,
  color,
}: {
  label: string;
  value: number;
  goal: number;
  unit: string;
  color?: string;
}) {
  const c = useColors();
  const pct = goal > 0 ? Math.min(1, value / goal) : 0;
  return (
    <View style={{ gap: space.s }} accessible accessibilityLabel={`${label}: ${Math.round(value)} / ${goal} ${unit}`}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Text style={[type.headline, { color: c.ink }]}>{label}</Text>
        <Text style={[type.subhead, { color: c.muted, fontVariant: ['tabular-nums'] }]}>
          <Text style={{ color: c.ink, fontWeight: '700' }}>{Math.round(value)}</Text> / {goal} {unit}
        </Text>
      </View>
      <View style={{ height: 8, borderRadius: 4, backgroundColor: c.fill, overflow: 'hidden' }}>
        <View style={{ width: `${pct * 100}%`, height: '100%', borderRadius: 4, backgroundColor: color ?? c.accent }} />
      </View>
    </View>
  );
}

/** Square-ish tile standing in for the exercise video thumbnail. */
export function Thumb({ icon = 'barbell-outline', size = 44 }: { icon?: IconName; size?: number }) {
  const c = useColors();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: c.fill, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={size * 0.45} color={c.muted} />
    </View>
  );
}

/** List row: leading element, title + subtitle, trailing element. */
export function Row({
  leading,
  title,
  subtitle,
  trailing,
  onPress,
  accessibilityLabel,
}: {
  leading?: React.ReactNode;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const c = useColors();
  const content = (
    <>
      {leading}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[type.headline, { color: c.ink }]}>{title}</Text>
        {subtitle ? <Text style={[type.subhead, { color: c.muted }]}>{subtitle}</Text> : null}
      </View>
      {trailing}
    </>
  );
  const style = { flexDirection: 'row' as const, alignItems: 'center' as const, gap: space.m, minHeight: 52, paddingVertical: space.s };
  if (!onPress) return <View style={style}>{content}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [style, { opacity: pressed ? 0.6 : 1 }]}
    >
      {content}
    </Pressable>
  );
}

export function Divider({ inset = 0 }: { inset?: number }) {
  const c = useColors();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.line, marginLeft: inset }} />;
}

/** Small rounded label, e.g. "Adjusted for today". */
export function Badge({ label, icon, tone = 'accent' }: { label: string; icon?: IconName; tone?: 'accent' | 'warn' | 'ok' }) {
  const c = useColors();
  const bg = tone === 'warn' ? c.warnSoft : tone === 'ok' ? c.okSoft : c.accentSoft;
  const fg = tone === 'warn' ? c.warn : tone === 'ok' ? c.ok : c.accent;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: bg, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 }}>
      {icon ? <Icon name={icon} size={14} color={fg} /> : null}
      <Text style={{ color: fg, fontWeight: '700', fontSize: 13 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: radius.m,
    flexDirection: 'row',
    gap: space.s,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.l,
  },
  buttonCompact: { minHeight: 36, paddingHorizontal: space.m, borderRadius: radius.s + 2 },
  raised: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
});
