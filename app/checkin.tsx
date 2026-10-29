import { router, useLocalSearchParams } from 'expo-router';
import { Moon } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { PainArea, STARTER_HOME } from '../src/data/program';
import { adaptWorkout, CheckIn, Level } from '../src/logic/adapt';
import { space, useColors } from '../src/theme';
import { Button, Card, Label, Muted, Screen, Segmented } from '../src/ui';
import { describeChanges } from '../src/adjustments';

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
  const summary = describeChanges(t, changes, checkIn);

  return (
    <Screen
      title={t('checkin.title')}
      subtitle={t('checkin.subtitle')}
      footer={
        <SafeAreaView edges={['bottom']} style={{ backgroundColor: c.bg, borderTopWidth: 1, borderTopColor: c.line }}>
          <View style={{ padding: space.l, paddingBottom: space.s }}>
            <Button
              title={t('checkin.continue')}
              onPress={() =>
                router.replace({
                  pathname: '/workout',
                  params: { dayId: day.id, energy: String(energy), sleep: String(sleep), pain },
                })
              }
            />
          </View>
        </SafeAreaView>
      }
    >
      <View style={{ gap: space.s }}>
        <Label>{t('checkin.energy')}</Label>
        <Segmented<Level>
          label={t('checkin.energy')}
          value={energy}
          onChange={setEnergy}
          options={[
            { value: 0, label: t('checkin.low') },
            { value: 1, label: t('checkin.medium') },
            { value: 2, label: t('checkin.high') },
          ]}
        />
      </View>

      <View style={{ gap: space.s }}>
        <Label>{t('checkin.sleep')}</Label>
        <Segmented<Level>
          label={t('checkin.sleep')}
          value={sleep}
          onChange={setSleep}
          options={[
            { value: 0, label: t('checkin.poor') },
            { value: 1, label: t('checkin.ok') },
            { value: 2, label: t('checkin.good') },
          ]}
        />
      </View>

      <View style={{ gap: space.s }}>
        <Label>{t('checkin.pain')}</Label>
        <Segmented<PainArea | 'none'>
          label={t('checkin.pain')}
          value={pain}
          onChange={setPain}
          options={[
            { value: 'none', label: t('checkin.none') },
            { value: 'knee', label: t('checkin.knee') },
            { value: 'back', label: t('checkin.back') },
            { value: 'shoulder', label: t('checkin.shoulder') },
          ]}
        />
      </View>

      <Card style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.m }}>
        <Moon size={20} color={c.accent} strokeWidth={2} />
        <View style={{ flex: 1, gap: space.xs }} accessibilityLiveRegion="polite">
          <Muted ink>{summary ? summary.short : t('checkin.noChanges')}</Muted>
          {summary ? <Muted>{summary.detail}</Muted> : null}
        </View>
      </Card>
    </Screen>
  );
}
