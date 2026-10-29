import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FoodProduct, searchFood } from '../../src/data/openFoodFacts';
import { dayKey } from '../../src/logic/dates';
import { dailyGoals, portion } from '../../src/logic/nutrition';
import { useStore } from '../../src/store';
import { space, type, useColors } from '../../src/theme';
import { Button, Card, Divider, Icon, Input, Meter, Row, Screen, Section, Small } from '../../src/ui';

export default function Food() {
  const { t } = useTranslation();
  const c = useColors();
  const { profile, food, addFood, removeFood } = useStore();

  const goals = dailyGoals(profile);
  const today = dayKey();
  const todays = food.filter((f) => f.date === today);
  const totals = todays.reduce((a, f) => ({ kcal: a.kcal + f.kcal, protein: a.protein + f.protein }), { kcal: 0, protein: 0 });

  // Search
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodProduct[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [picked, setPicked] = useState<FoodProduct | null>(null);
  const [grams, setGrams] = useState('100');

  // Quick add
  const [qName, setQName] = useState('');
  const [qKcal, setQKcal] = useState('');
  const [qProtein, setQProtein] = useState('');

  const runSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(false);
    setPicked(null);
    try {
      setResults(await searchFood(query.trim(), profile.lang));
    } catch {
      setError(true);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const addPicked = () => {
    if (!picked) return;
    const g = Number(grams.replace(',', '.')) || 0;
    if (g <= 0) return;
    const p = portion({ kcal: picked.kcal100, protein: picked.protein100 }, g);
    addFood({ date: today, name: picked.name, grams: g, kcal: p.kcal, protein: p.protein });
    setPicked(null);
    setResults(null);
    setQuery('');
    setGrams('100');
  };

  const addQuick = () => {
    if (!qName.trim()) return;
    addFood({
      date: today,
      name: qName.trim(),
      grams: 0,
      kcal: Math.round(Number(qKcal.replace(',', '.')) || 0),
      protein: Number(qProtein.replace(',', '.')) || 0,
    });
    setQName('');
    setQKcal('');
    setQProtein('');
  };

  return (
    <Screen title={t('food.title')}>
      <Card style={{ gap: space.l }}>
        <Meter label={t('food.protein')} value={totals.protein} goal={goals.protein} unit={t('common.g')} />
        {!profile.hideCalories ? (
          <Meter label={t('food.calories')} value={totals.kcal} goal={goals.calories} unit={t('common.kcal')} color={c.muted} />
        ) : null}
        <View style={{ flexDirection: 'row', gap: space.s }}>
          <Icon name="information-circle-outline" size={18} color={c.muted} />
          <Small style={{ flex: 1 }}>{t('food.proteinTip')}</Small>
        </View>
      </Card>

      <Section title={t('food.search')}>
        <Input
          icon="search"
          value={query}
          onChangeText={setQuery}
          placeholder={t('food.searchPlaceholder')}
          returnKeyType="search"
          onSubmitEditing={runSearch}
          accessibilityLabel={t('food.search')}
        />

        {loading ? <ActivityIndicator color={c.accent} /> : null}
        {error ? <Small>{t('food.error')}</Small> : null}
        {results && results.length === 0 ? <Small>{t('food.noResults')}</Small> : null}

        {picked ? (
          <Card>
            <View style={{ gap: 2 }}>
              <Text style={[type.headline, { color: c.ink }]}>{picked.name}</Text>
              <Small>
                {t('food.per100')}: {Math.round(picked.kcal100)} {t('common.kcal')} · {picked.protein100} {t('common.g')}{' '}
                {t('food.protein').toLowerCase()}
              </Small>
            </View>
            <View style={{ flexDirection: 'row', gap: space.s, alignItems: 'flex-end' }}>
              <View style={{ flex: 1 }}>
                <Input
                  label={t('food.amount')}
                  keyboardType="decimal-pad"
                  value={grams}
                  onChangeText={setGrams}
                />
              </View>
              <Button title={t('food.add')} icon="add" onPress={addPicked} />
            </View>
            <Button variant="plain" compact title={t('common.cancel')} onPress={() => setPicked(null)} />
          </Card>
        ) : results && results.length > 0 ? (
          <View>
            {results.slice(0, 12).map((p, i) => (
              <View key={p.code + p.name}>
                {i > 0 ? <Divider /> : null}
                <Row
                  title={p.name}
                  subtitle={`${p.brand ? `${p.brand} · ` : ''}${Math.round(p.kcal100)} ${t('common.kcal')} · ${p.protein100} ${t('common.g')} ${t('food.protein').toLowerCase()} / 100 g`}
                  trailing={<Icon name="add-circle" size={26} color={c.accent} />}
                  onPress={() => setPicked(p)}
                />
              </View>
            ))}
          </View>
        ) : null}
        <Text style={[type.footnote, { color: c.muted }]}>{t('food.source')}</Text>
      </Section>

      <Section title={t('food.quickAdd')}>
        <Input label={t('food.name')} value={qName} onChangeText={setQName} />
        <View style={{ flexDirection: 'row', gap: space.s }}>
          {!profile.hideCalories ? (
            <Input label={t('common.kcal')} keyboardType="number-pad" value={qKcal} onChangeText={setQKcal} />
          ) : null}
          <Input
            label={`${t('food.protein')} (${t('common.g')})`}
            keyboardType="decimal-pad"
            value={qProtein}
            onChangeText={setQProtein}
          />
        </View>
        <Button title={t('food.add')} icon="add" variant="secondary" onPress={addQuick} disabled={!qName.trim()} />
      </Section>

      <Section title={t('food.today')} trailing={todays.length ? `${Math.round(totals.protein)} ${t('common.g')} ${t('food.protein').toLowerCase()}` : undefined}>
        {todays.length === 0 ? (
          <View style={{ alignItems: 'center', gap: space.s, paddingVertical: space.l }}>
            <Icon name="restaurant-outline" size={28} color={c.muted} />
            <Small style={{ textAlign: 'center' }}>{t('food.empty')}</Small>
          </View>
        ) : (
          <View>
            {todays.map((f, i) => (
              <View key={f.id}>
                {i > 0 ? <Divider /> : null}
                <Row
                  title={f.name}
                  subtitle={`${f.grams > 0 ? `${f.grams} g · ` : ''}${!profile.hideCalories ? `${f.kcal} ${t('common.kcal')} · ` : ''}${f.protein} ${t('common.g')} ${t('food.protein').toLowerCase()}`}
                  trailing={
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={t('food.remove', { name: f.name })}
                      onPress={() => removeFood(f.id)}
                      hitSlop={8}
                      style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Icon name="trash-outline" size={20} color={c.muted} />
                    </Pressable>
                  }
                />
              </View>
            ))}
          </View>
        )}
      </Section>
    </Screen>
  );
}
