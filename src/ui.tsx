import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { radius, space, type, useColors } from './theme';

/** Page wrapper. Tab screens pad for the status bar; stack screens with a header pass safeTop={false}. */
export function Screen({
  children,
  scroll = true,
  safeTop = true,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  safeTop?: boolean;
}) {
  const c = useColors();
  const body = <View style={{ padding: space.l, gap: space.l }}>{children}</View>;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={safeTop ? ['top'] : []}>
      {scroll ? <ScrollView keyboardShouldPersistTaps="handled">{body}</ScrollView> : body}
    </SafeAreaView>
  );
}

/** Schermtitel bovenaan een tabblad (Large title, 32/800). */
export function Title({ children }: { children: React.ReactNode }) {
  const c = useColors();
  return (
    <Text accessibilityRole="header" style={[type.largeTitle, { color: c.ink }]}>
      {children}
    </Text>
  );
}

/** Naam van de training, sheet-titels (Title, 22/700). */
export function H2({ children }: { children: React.ReactNode }) {
  const c = useColors();
  return (
    <Text accessibilityRole="header" style={[type.title, { color: c.ink }]}>
      {children}
    </Text>
  );
}

/** Oefeningnaam, kopjes in een kaart (Headline, 17/600). */
export function Headline({ children, style }: { children: React.ReactNode; style?: object }) {
  const c = useColors();
  return <Text style={[type.headline, { color: c.ink }, style]}>{children}</Text>;
}

export function Body({ children, muted, style }: { children: React.ReactNode; muted?: boolean; style?: object }) {
  const c = useColors();
  return <Text style={[type.body, { color: muted ? c.muted : c.ink }, style]}>{children}</Text>;
}

/** Klein label in hoofdletters (Caption, 13/600). */
export function Label({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  const c = useColors();
  return <Text style={[type.caption, { color: accent ? c.accent : c.muted }]}>{children}</Text>;
}

/** Kaart: alleen voor oefenblokken en samenvattingen. Geen schaduw. */
export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const c = useColors();
  return (
    <View
      style={[
        { backgroundColor: c.surface, borderColor: c.line, borderWidth: 1, borderRadius: radius.card, padding: space.l, gap: space.m },
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
  disabled,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}) {
  const c = useColors();
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: primary ? c.accent : 'transparent',
          borderColor: primary ? c.accent : c.line,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={[type.headline, { color: primary ? c.accentInk : c.ink, textAlign: 'center' }]}>{title}</Text>
    </Pressable>
  );
}

/** A row of mutually exclusive options. Gekozen optie: rand in accent, vette tekst en een vinkje (niet alleen kleur). */
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
    <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', gap: space.s, flexWrap: 'wrap' }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={{
              flexGrow: 1,
              minHeight: 48,
              paddingHorizontal: space.m,
              paddingVertical: space.s,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: radius.control,
              borderWidth: on ? 2 : 1,
              borderColor: on ? c.accent : c.line,
              backgroundColor: c.surface2,
            }}
          >
            <Text style={[type.body, { color: c.ink, fontWeight: on ? '700' : '400', textAlign: 'center' }]}>
              {on ? '✓ ' : ''}
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Input(props: TextInputProps & { label?: string }) {
  const c = useColors();
  const { label, style, ...rest } = props;
  return (
    <View style={{ gap: space.xs, flex: 1 }}>
      {label ? <Text style={[type.caption, { color: c.muted }]}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={c.muted}
        accessibilityLabel={label}
        {...rest}
        style={[
          type.number,
          {
            minHeight: 48,
            borderRadius: radius.control,
            paddingHorizontal: space.m,
            color: c.ink,
            backgroundColor: c.surface2,
          },
          style,
        ]}
      />
    </View>
  );
}

/** Horizontal progress bar with a label and value. */
export function Meter({ label, value, goal, unit }: { label: string; value: number; goal: number; unit: string }) {
  const c = useColors();
  const pct = goal > 0 ? Math.min(1, value / goal) : 0;
  return (
    <View
      style={{ gap: space.xs }}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: goal, now: Math.round(value) }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: space.s }}>
        <Text style={[type.headline, { color: c.ink }]}>{label}</Text>
        <Text style={[type.body, { color: c.muted, fontVariant: ['tabular-nums'] }]}>
          {Math.round(value)} / {goal} {unit}
        </Text>
      </View>
      <View style={{ height: 8, borderRadius: radius.pill, backgroundColor: c.surface2, overflow: 'hidden' }}>
        <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: c.accent }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: radius.control,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.l,
    paddingVertical: space.s,
  },
});
