import { Monitor, Moon, Sun } from 'lucide-react-native';
import { useState } from 'react';
import { Switch, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Lang } from '../../src/i18n';
import { Activity, FoodGoal } from '../../src/logic/nutrition';
import { Profile as ProfileData, useStore } from '../../src/store';
import { radius, space, type, ThemePref, useColors } from '../../src/theme';
import { Button, Label, ListRow, Muted, Screen, Segmented, Sheet, SheetItem } from '../../src/ui';

type NumberField = 'age' | 'heightCm' | 'weightKg';
type Editing = { kind: 'number'; field: NumberField } | { kind: 'activity' } | { kind: 'goal' } | null;

export default function Profile() {
  const { t } = useTranslation();
  const c = useColors();
  const { profile, updateProfile } = useStore();
  const [editing, setEditing] = useState<Editing>(null);
  const [draft, setDraft] = useState('');

  const numberLabel: Record<NumberField, string> = { age: t('profile.age'), heightCm: t('profile.height'), weightKg: t('profile.weight') };
  const activityLabel: Record<Activity, string> = { 0: t('profile.activityLow'), 1: t('profile.activityMid'), 2: t('profile.activityHigh') };
  const goalLabel: Record<FoodGoal, string> = { maintain: t('profile.goalMaintain'), lose: t('profile.goalLose') };

  const editNumber = (field: NumberField) => {
    setDraft(String(profile[field]));
    setEditing({ kind: 'number', field });
  };
  const saveNumber = () => {
    if (editing?.kind !== 'number') return;
    const n = Number(draft.replace(',', '.'));
    if (Number.isFinite(n) && n > 0) updateProfile({ [editing.field]: n } as Partial<ProfileData>);
    setEditing(null);
  };

  return (
    <Screen title={t('profile.title')} gap={space.xxl}>
      <View style={{ gap: space.s }}>
        <Label>{t('profile.appearance')}</Label>
        <Segmented<ThemePref>
          label={t('profile.appearance')}
          value={profile.theme}
          onChange={(theme) => updateProfile({ theme })}
          options={[
            { value: 'system', label: t('profile.themeSystem'), icon: Monitor },
            { value: 'dark', label: t('profile.themeDark'), icon: Moon },
            { value: 'light', label: t('profile.themeLight'), icon: Sun },
          ]}
        />
        <Muted>{t('profile.themeHint')}</Muted>
      </View>

      <View style={{ gap: space.s }}>
        <Label>{t('profile.language')}</Label>
        <Segmented<Lang>
          label={t('profile.language')}
          value={profile.lang}
          onChange={(lang) => updateProfile({ lang })}
          options={[
            { value: 'nl', label: 'Nederlands' },
            { value: 'en', label: 'English' },
          ]}
        />
      </View>

      <View>
        <Label style={{ paddingBottom: space.s }}>{t('profile.body')}</Label>
        <ListRow label={t('profile.age')} value={String(profile.age)} onPress={() => editNumber('age')} />
        <ListRow label={t('profile.height')} value={`${profile.heightCm} cm`} onPress={() => editNumber('heightCm')} />
        <ListRow label={t('profile.weight')} value={`${profile.weightKg} kg`} onPress={() => editNumber('weightKg')} />
        <ListRow label={t('profile.activity')} value={activityLabel[profile.activity]} onPress={() => setEditing({ kind: 'activity' })} />
        <ListRow label={t('profile.goal')} value={t(`profile.goalShort.${profile.goal}`)} onPress={() => setEditing({ kind: 'goal' })} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 56, borderTopWidth: 1, borderBottomWidth: 1, borderColor: c.line }}>
          <Text style={[type.body, { color: c.ink, flex: 1 }]}>{t('profile.hideCalories')}</Text>
          <Switch
            accessibilityLabel={t('profile.hideCalories')}
            value={profile.hideCalories}
            onValueChange={(hideCalories) => updateProfile({ hideCalories })}
            trackColor={{ true: c.accent, false: c.line }}
            ios_backgroundColor={c.line}
          />
        </View>
      </View>

      <Muted>{t('profile.disclaimer')}</Muted>

      <Sheet visible={editing?.kind === 'number'} title={editing?.kind === 'number' ? numberLabel[editing.field] : ''} onClose={() => setEditing(null)}>
        <View style={{ gap: space.m }}>
          <TextInput
            autoFocus
            keyboardType={editing?.kind === 'number' && editing.field === 'weightKg' ? 'decimal-pad' : 'number-pad'}
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={saveNumber}
            selectionColor={c.accent}
            style={{ minHeight: 52, borderRadius: radius.m, backgroundColor: c.surface2, color: c.ink, fontSize: 20, fontWeight: '600', paddingHorizontal: space.l }}
          />
          <Button title={t('common.save')} onPress={saveNumber} />
          <Button variant="outline" title={t('common.cancel')} onPress={() => setEditing(null)} />
        </View>
      </Sheet>

      <Sheet visible={editing?.kind === 'activity'} title={t('profile.activity')} onClose={() => setEditing(null)}>
        {([0, 1, 2] as Activity[]).map((a, i) => (
          <SheetItem
            key={a}
            label={activityLabel[a]}
            selected={profile.activity === a}
            last={i === 2}
            onPress={() => {
              updateProfile({ activity: a });
              setEditing(null);
            }}
          />
        ))}
      </Sheet>

      <Sheet visible={editing?.kind === 'goal'} title={t('profile.goal')} onClose={() => setEditing(null)}>
        {(['maintain', 'lose'] as FoodGoal[]).map((g, i) => (
          <SheetItem
            key={g}
            label={goalLabel[g]}
            selected={profile.goal === g}
            last={i === 1}
            onPress={() => {
              updateProfile({ goal: g });
              setEditing(null);
            }}
          />
        ))}
      </Sheet>
    </Screen>
  );
}
