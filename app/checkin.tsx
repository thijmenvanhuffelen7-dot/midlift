import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PainArea, STARTER_HOME } from '../src/data/program';
import { adaptWorkout, Change, CheckIn, Level } from '../src/logic/adapt';
import { radius, space, type, useColors } from '../src/theme';
import { Body, Button, Chips, Footer, Icon, IconName, Screen, Section, Small } from '../src/ui';

export default function CheckInScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
  const day = STARTER_HOME.find((d) => d.id === dayId) ?? STARTER_HOME[0];

  const [energy, setEnergy] = useState<Level>(1);
  const [sleep, setSleep] = useState<Level>(1);
  const [pain, setPain] = useState<PainArea | 'none'>('none');

  const checkIn: CheckIn = { energy, sleep, pain };
  const { changes } = adaptWorkout(day, checkIn);

  const describe = (ch: Change): { icon: IconName; text: string } => {
    if (ch.type === 'fewerSets') return { icon: 'remove-circle-outline', text: t('checkin.fewerSets') };
    if (ch.type === 'lighter') return { icon: 'arrow-down-circle-outline', text: t('checkin.lighter') };
    return { icon: 'swap-horizontal', text: t('checkin.swapped', { from: t(`ex.${ch.from}`), to: t(`ex.${ch.to}`) }) };
  };

  return (
    <Screen
      title={t('checkin.title')}
      safeTop={false}
      footer={
        <Footer>
          <Button
            title={t('checkin.continue')}
            onPress={() =>
              router.replace({
                pathname: '/workout',
                params: { dayId: day.id, energy: String(energy), sleep: String(sleep), pain },
              })
            }
          />
        </Footer>
      }
    >
      <Body muted style={{ marginTop: -space.m }}>
        {t('checkin.subtitle')}
      </Body>

      <Section title={t('checkin.energy')}>
        <Chips<Level>
          value={energy}
          onChange={setEnergy}
          options={[
            { value: 0, label: t('checkin.low'), icon: 'battery-dead-outline' },
            { value: 1, label: t('checkin.medium'), icon: 'battery-half-outline' },
            { value: 2, label: t('checkin.high'), icon: 'battery-full-outline' },
          ]}
        />
      </Section>

      <Section title={t('checkin.sleep')}>
        <Chips<Level>
          value={sleep}
          onChange={setSleep}
          options={[
            { value: 0, label: t('checkin.poor') },
            { value: 1, label: t('checkin.ok') },
            { value: 2, label: t('checkin.good') },
          ]}
        />
      </Section>

      <Section title={t('checkin.pain')}>
        <Chips<PainArea | 'none'>
          value={pain}
          onChange={setPain}
          options={[
            { value: 'none', label: t('checkin.none') },
            { value: 'knee', label: t('checkin.knee') },
            { value: 'back', label: t('checkin.back') },
            { value: 'shoulder', label: t('checkin.shoulder') },
          ]}
        />
      </Section>

      <View
        accessibilityLiveRegion="polite"
        style={{
          backgroundColor: changes.length ? c.warnSoft : c.okSoft,
          borderRadius: radius.l,
          padding: space.l,
          gap: space.m,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s }}>
          <Icon name={changes.length ? 'sparkles' : 'checkmark-circle'} size={20} color={changes.length ? c.warn : c.ok} />
          <Text style={[type.headline, { color: changes.length ? c.warn : c.ok }]}>
            {changes.length ? t('checkin.adjusted') : t('checkin.noChanges')}
          </Text>
        </View>
        {changes.map((ch, i) => {
          const d = describe(ch);
          return (
            <View key={i} style={{ flexDirection: 'row', gap: space.s, alignItems: 'flex-start' }}>
              <Icon name={d.icon} size={18} color={c.ink} />
              <Small muted={false} style={{ flex: 1 }}>
                {d.text}
              </Small>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}
