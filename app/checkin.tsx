import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PainArea, STARTER_HOME } from '../src/data/program';
import { adaptWorkout, Change, CheckIn, Level } from '../src/logic/adapt';
import { space } from '../src/theme';
import { Body, Button, Card, Label, Screen, Segmented, Title } from '../src/ui';

export default function CheckInScreen() {
  const { t } = useTranslation();
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
  const day = STARTER_HOME.find((d) => d.id === dayId) ?? STARTER_HOME[0];

  const [energy, setEnergy] = useState<Level>(1);
  const [sleep, setSleep] = useState<Level>(1);
  const [pain, setPain] = useState<PainArea | 'none'>('none');

  const checkIn: CheckIn = { energy, sleep, pain };
  const { changes } = adaptWorkout(day, checkIn);

  const describe = (ch: Change) => {
    if (ch.type === 'fewerSets') return t('checkin.fewerSets');
    if (ch.type === 'lighter') return t('checkin.lighter');
    return t('checkin.swapped', { from: t(`ex.${ch.from}`), to: t(`ex.${ch.to}`) });
  };

  return (
    <Screen safeTop={false}>
      <Title>{t('checkin.title')}</Title>
      <Body muted>{t('checkin.subtitle')}</Body>

      <View style={{ gap: space.s }}>
        <Label>{t('checkin.energy')}</Label>
        <Segmented<Level>
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

      <Card>
        <Label accent>{t('checkin.adjusted')}</Label>
        {changes.length === 0 ? (
          <Body>{t('checkin.noChanges')}</Body>
        ) : (
          changes.map((ch, i) => <Body key={i}>• {describe(ch)}</Body>)
        )}
      </Card>

      <Button
        title={t('checkin.continue')}
        onPress={() =>
          router.replace({
            pathname: '/workout',
            params: { dayId: day.id, energy: String(energy), sleep: String(sleep), pain },
          })
        }
      />
    </Screen>
  );
}
