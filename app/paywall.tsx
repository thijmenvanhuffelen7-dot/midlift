import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { formatPrice, PlanId, PLANS, purchase, PURCHASES_TEST_MODE, restore, TRIAL_DAYS, yearlySaving } from '../src/purchases';
import { useStore } from '../src/store';
import { DISPLAY_FONT, radius, space, type, useColors } from '../src/theme';
import { Button, Muted } from '../src/ui';

const BENEFITS = ['adapts', 'program', 'explain', 'food'] as const;

export default function PaywallScreen() {
  const { t, i18n } = useTranslation();
  const c = useColors();
  const { profile, setPremium } = useStore();
  const [plan, setPlan] = useState<PlanId>('yearly');
  const [busy, setBusy] = useState<'buy' | 'restore' | null>(null);

  const price = (id: PlanId) => formatPrice(PLANS.find((p) => p.id === id)!.price, i18n.language);
  const yearlyPerMonth = formatPrice(Math.floor((PLANS.find((p) => p.id === 'yearly')!.price / 12) * 100) / 100, i18n.language);

  const unlock = (p: PlanId) => {
    setPremium({ active: true, plan: p, since: new Date().toISOString(), test: PURCHASES_TEST_MODE });
    router.replace('/');
  };

  const buy = async () => {
    setBusy('buy');
    const res = await purchase(plan);
    setBusy(null);
    if (res.ok) unlock(res.plan);
    else if (!res.cancelled) Alert.alert(t('paywall.errorTitle'), t('paywall.error'));
  };

  const doRestore = async () => {
    setBusy('restore');
    const res = await restore();
    setBusy(null);
    if (res.active && res.plan) unlock(res.plan);
    else Alert.alert(t('paywall.restoreNoneTitle'), t('paywall.restoreNone'));
  };

  const planCard = (id: PlanId) => {
    const on = plan === id;
    return (
      <Pressable
        key={id}
        accessibilityRole="radio"
        accessibilityState={{ selected: on }}
        onPress={() => setPlan(id)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.m,
          minHeight: 72,
          paddingHorizontal: space.l,
          paddingVertical: space.m,
          borderRadius: radius.l,
          borderWidth: 2,
          borderColor: on ? c.accent : c.line,
          backgroundColor: c.surface,
        }}
      >
        <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: on ? c.accent : c.line, backgroundColor: on ? c.accent : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
          {on ? <Check size={14} color={c.accentInk} strokeWidth={3} /> : null}
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s, flexWrap: 'wrap' }}>
            <Text style={[type.headline, { color: c.ink }]}>{t(`paywall.${id}`)}</Text>
            {id === 'yearly' ? (
              <View style={{ backgroundColor: c.accent, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ color: c.accentInk, fontSize: 12, fontWeight: '700' }}>{t('paywall.save', { pct: yearlySaving() })}</Text>
              </View>
            ) : null}
          </View>
          <Muted>{id === 'yearly' ? t('paywall.yearlySub', { perMonth: yearlyPerMonth }) : t('paywall.monthlySub')}</Muted>
        </View>
        <Text style={[type.headline, { color: c.ink }]}>{price(id)}</Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: space.l, paddingTop: space.xxl, gap: space.xl }}>
        <View style={{ gap: space.s }}>
          <Text accessibilityRole="header" style={{ fontFamily: DISPLAY_FONT, fontSize: 36, lineHeight: 40, letterSpacing: -0.5, color: c.ink }}>
            {t('paywall.title')}
          </Text>
          <Muted>{profile.onboarded ? t('paywall.subtitle', { program: t(`programs.${profile.program}.name`) }) : t('paywall.subtitleGeneric')}</Muted>
        </View>

        <View style={{ gap: space.m }}>
          {BENEFITS.map((b) => (
            <View key={b} style={{ flexDirection: 'row', gap: space.m, alignItems: 'flex-start' }}>
              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: c.doneSoft, alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                <Check size={14} color={c.done} strokeWidth={3} />
              </View>
              <Muted ink style={{ flex: 1 }}>
                {t(`paywall.benefits.${b}`)}
              </Muted>
            </View>
          ))}
        </View>

        <View accessibilityRole="radiogroup" style={{ gap: space.s }}>
          {PLANS.map((p) => planCard(p.id))}
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: space.l, paddingTop: space.m, paddingBottom: space.s, gap: space.s, borderTopWidth: 1, borderTopColor: c.line }}>
        <Muted style={{ textAlign: 'center', fontSize: 14, lineHeight: 19 }}>
          {t('paywall.terms', { days: TRIAL_DAYS, price: price(plan), period: t(`paywall.per.${plan}`) })}
        </Muted>
        <Button title={busy === 'buy' ? '…' : t('paywall.cta', { days: TRIAL_DAYS })} disabled={busy !== null} onPress={buy} />
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          {busy === 'restore' ? (
            <ActivityIndicator color={c.accent} style={{ height: 44, paddingHorizontal: space.s }} />
          ) : (
            <Pressable accessibilityRole="button" onPress={doRestore} disabled={busy !== null} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: space.s }}>
              <Text style={{ color: c.accent, fontSize: 14, fontWeight: '600' }}>{t('paywall.restore')}</Text>
            </Pressable>
          )}
          {(['privacy', 'terms'] as const).map((doc) => (
            <Pressable
              key={doc}
              accessibilityRole="link"
              onPress={() => router.push({ pathname: '/legal', params: { doc } })}
              style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: space.s }}
            >
              <Text style={{ color: c.muted, fontSize: 14, textDecorationLine: 'underline' }}>{t(`legal.${doc}Short`)}</Text>
            </Pressable>
          ))}
        </View>
        {PURCHASES_TEST_MODE ? (
          <Text style={{ color: c.pr, fontSize: 13, fontWeight: '600', textAlign: 'center' }}>{t('paywall.testMode')}</Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
