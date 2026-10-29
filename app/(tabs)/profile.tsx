import { Platform, Switch, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Lang } from '../../src/i18n';
import { Activity, dailyGoals, FoodGoal } from '../../src/logic/nutrition';
import { useStore } from '../../src/store';
import { space, type, useColors } from '../../src/theme';
import { Card, ChoiceList, Divider, Icon, Input, Row, Screen, Section, Segmented, Small } from '../../src/ui';

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
    <Screen title={t('profile.title')}>
      <Section title={t('profile.language')}>
        <Segmented<Lang>
          value={profile.lang}
          onChange={(lang) => updateProfile({ lang })}
          options={[
            { value: 'en', label: 'English' },
            { value: 'nl', label: 'Nederlands' },
          ]}
        />
      </Section>

      {/* key: remount the fields once saved data has loaded, so they show the saved values */}
      <Section title={t('profile.body')} key={ready ? 'loaded' : 'loading'}>
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
      </Section>

      <Section title={t('profile.activity')}>
        <ChoiceList<Activity>
          value={profile.activity}
          onChange={(activity) => updateProfile({ activity })}
          options={[
            { value: 0, label: t('profile.activityLow') },
            { value: 1, label: t('profile.activityMid') },
            { value: 2, label: t('profile.activityHigh') },
          ]}
        />
      </Section>

      <Section title={t('profile.goal')}>
        <ChoiceList<FoodGoal>
          value={profile.goal}
          onChange={(goal) => updateProfile({ goal })}
          options={[
            { value: 'maintain', label: t('profile.goalMaintain') },
            { value: 'lose', label: t('profile.goalLose') },
          ]}
        />
        <Row
          title={t('profile.hideCalories')}
          trailing={
            <Switch
              accessibilityLabel={t('profile.hideCalories')}
              value={profile.hideCalories}
              onValueChange={(hideCalories) => updateProfile({ hideCalories })}
              trackColor={{ true: c.accent, false: Platform.OS === 'android' ? c.muted : undefined }}
              thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
            />
          }
        />
      </Section>

      <Section title={t('profile.goals')}>
        <Card style={{ gap: 0, paddingVertical: space.xs }}>
          <Row
            leading={<Icon name="egg-outline" size={22} color={c.accent} />}
            title={t('food.protein')}
            trailing={<Text style={[type.headline, { color: c.ink }]}>{goals.protein} {t('common.g')}</Text>}
          />
          {!profile.hideCalories ? (
            <>
              <Divider inset={22 + space.m} />
              <Row
                leading={<Icon name="flame-outline" size={22} color={c.muted} />}
                title={t('food.calories')}
                trailing={<Text style={[type.headline, { color: c.ink }]}>{goals.calories} {t('common.kcal')}</Text>}
              />
            </>
          ) : null}
        </Card>
      </Section>

      <Small>{t('profile.disclaimer')}</Small>
    </Screen>
  );
}
