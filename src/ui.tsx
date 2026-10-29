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

export function Title({ children }: { children: React.ReactNode }) {
  const c = useColors();
  return <Text style={[type.title, { color: c.ink }]}>{children}</Text>;
}

export function H2({ children }: { children: React.ReactNode }) {
  const c = useColors();
  return <Text style={[type.h2, { color: c.ink }]}>{children}</Text>;
}

export function Body({ children, muted, style }: { children: React.ReactNode; muted?: boolean; style?: object }) {
  const c = useColors();
  return <Text style={[type.body, { color: muted ? c.muted : c.ink, lineHeight: 22 }, style]}>{children}</Text>;
}

export function Label({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  const c = useColors();
  return <Text style={[type.label, { color: accent ? c.accent : c.muted }]}>{children}</Text>;
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const c = useColors();
  return (
    <View
      style={[
        { backgroundColor: c.surface, borderColor: c.line, borderWidth: 1, borderRadius: radius.l, padding: space.l, gap: space.m },
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
      <Text style={{ color: primary ? c.accentInk : c.ink, fontWeight: '700', fontSize: 16 }}>{title}</Text>
    </Pressable>
  );
}

/** A row of mutually exclusive options. */
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
    <View style={{ flexDirection: 'row', gap: space.s, flexWrap: 'wrap' }}>
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
              minHeight: 44,
              paddingHorizontal: space.m,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: radius.m,
              borderWidth: 1.5,
              borderColor: on ? c.accent : c.line,
              backgroundColor: on ? c.accentSoft : 'transparent',
            }}
          >
            <Text style={{ color: c.ink, fontWeight: on ? '700' : '500' }}>{o.label}</Text>
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
      {label ? <Text style={{ color: c.ink, fontWeight: '600', fontSize: 14 }}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={c.muted}
        {...rest}
        style={[
          {
            minHeight: 48,
            borderWidth: 1.5,
            borderColor: c.line,
            borderRadius: radius.m,
            paddingHorizontal: space.m,
            color: c.ink,
            backgroundColor: c.bg,
            fontSize: 16,
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
    <View style={{ gap: space.xs }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: c.ink, fontWeight: '600' }}>{label}</Text>
        <Text style={{ color: c.muted, fontVariant: ['tabular-nums'] }}>
          {Math.round(value)} / {goal} {unit}
        </Text>
      </View>
      <View style={{ height: 10, borderRadius: 5, backgroundColor: c.line, overflow: 'hidden' }}>
        <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: c.accent }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: radius.m,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.l,
  },
});
