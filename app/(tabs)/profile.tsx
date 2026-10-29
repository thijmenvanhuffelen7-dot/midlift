import { Switch, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Lang } from '../../src/i18n';
import { Activity, dailyGoals, FoodGoal } from '../../src/logic/nutrition';
import { useStore } from '../../src/store';
import { space, useColors } from '../../src/theme';
import { Body, Card, H2, Input, Label, Screen, Segmented, Title } from '../../src/ui';

const num = (v: string, fallback: number) => {
  const n = Number(v.replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export default function Profile() {
  const { t } = useTranslation();
  const c = useColors();
  const { profile, updateProfile, ready } = useStore();
  const goals = dailyGoals(profile);

  return (
    <Screen>
      <Title>{t('profile.title')}</Title>

      <Card>
        <Label>{t('profile.language')}</Label>
        <Segmented<Lang>
          value={profile.lang}
          onChange={(lang) => updateProfile({ lang })}
          options={[
            { value: 'en', label: 'English' },
            { value: 'nl', label: 'Nederlands' },
          ]}
        />
      </Card>

      {/* key: remount the fields once saved data has loaded, so they show the saved values */}
      <Card key={ready ? 'loaded' : 'loading'}>
        <H2>{t('profile.body')}</H2>
        <View style={{ flexDirection: 'row', gap: space.s }}>
          <Input
            label={t('profile.age')}
            keyboardType="number-pad"
            defaultValue={String(profile.age)}
            onEndEditing={(e) => updateProfile({ age: num(e.nativeEvent.text, profile.age) })}
          />
          <Input
            label={t('profile.height')}
            keyboardType="number-pad"
            defaultValue={String(profile.heightCm)}
            onEndEditing={(e) => updateProfile({ heightCm: num(e.nativeEvent.text, profile.heightCm) })}
          />
          <Input
            label={t('profile.weight')}
            keyboardType="decimal-pad"
            defaultValue={String(profile.weightKg)}
            onEndEditing={(e) => updateProfile({ weightKg: num(e.nativeEvent.text, profile.weightKg) })}
          />
        </View>

        <Label>{t('profile.activity')}</Label>
        <Segmented<Activity>
          value={profile.activity}
          onChange={(activity) => updateProfile({ activity })}
          options={[
            { value: 0, label: t('profile.activityLow') },
            { value: 1, label: t('profile.activityMid') },
            { value: 2, label: t('profile.activityHigh') },
          ]}
        />

        <Label>{t('profile.goal')}</Label>
        <Segmented<FoodGoal>
          value={profile.goal}
          onChange={(goal) => updateProfile({ goal })}
          options={[
            { value: 'maintain', label: t('profile.goalMaintain') },
            { value: 'lose', label: t('profile.goalLose') },
          ]}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.m }}>
          <Body style={{ flex: 1 }}>{t('profile.hideCalories')}</Body>
          <Switch
            value={profile.hideCalories}
            onValueChange={(hideCalories) => updateProfile({ hideCalories })}
            trackColor={{ true: c.accent, false: c.line }}
          />
        </View>
      </Card>

      <Card>
        <Label>{t('profile.goals')}</Label>
        <Body>
          {t('food.protein')}: {goals.protein} {t('common.g')}
        </Body>
        {!profile.hideCalories ? (
          <Body>
            {t('food.calories')}: {goals.calories} {t('common.kcal')}
          </Body>
        ) : null}
      </Card>

      <Body muted>{t('profile.disclaimer')}</Body>
    </Screen>
  );
}
