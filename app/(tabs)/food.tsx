import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FoodProduct, searchFood } from '../../src/data/openFoodFacts';
import { dayKey } from '../../src/logic/dates';
import { dailyGoals, portion } from '../../src/logic/nutrition';
import { useStore } from '../../src/store';
import { radius, space, useColors } from '../../src/theme';
import { Body, Button, Card, H2, Input, Label, Meter, Screen, Title } from '../../src/ui';

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
    <Screen>
      <Title>{t('food.title')}</Title>

      <Card>
        <Meter label={t('food.protein')} value={totals.protein} goal={goals.protein} unit={t('common.g')} />
        {!profile.hideCalories ? (
          <Meter label={t('food.calories')} value={totals.kcal} goal={goals.calories} unit={t('common.kcal')} />
        ) : null}
        <Body muted>{t('food.proteinTip')}</Body>
      </Card>

      <Card>
        <H2>{t('food.search')}</H2>
        <View style={{ flexDirection: 'row', gap: space.s, alignItems: 'flex-end' }}>
          <Input
            value={query}
            onChangeText={setQuery}
            placeholder={t('food.searchPlaceholder')}
            returnKeyType="search"
            onSubmitEditing={runSearch}
          />
          <View style={{ width: 110 }}>
            <Button title={t('food.search')} onPress={runSearch} variant="secondary" />
          </View>
        </View>

        {loading ? <ActivityIndicator color={c.accent} /> : null}
        {error ? <Body muted>{t('food.error')}</Body> : null}
        {results && results.length === 0 ? <Body muted>{t('food.noResults')}</Body> : null}

        {picked ? (
          <View style={{ gap: space.s }}>
            <Body style={{ fontWeight: '700' }}>{picked.name}</Body>
            <Body muted>
              {t('food.per100')}: {Math.round(picked.kcal100)} {t('common.kcal')} · {picked.protein100} {t('common.g')}{' '}
              {t('food.protein').toLowerCase()}
            </Body>
            <View style={{ flexDirection: 'row', gap: space.s, alignItems: 'flex-end' }}>
              <Input label={t('food.amount')} keyboardType="decimal-pad" value={grams} onChangeText={setGrams} />
              <View style={{ width: 120 }}>
                <Button title={t('food.add')} onPress={addPicked} />
              </View>
            </View>
          </View>
        ) : (
          results?.slice(0, 12).map((p) => (
            <Pressable
              key={p.code + p.name}
              accessibilityRole="button"
              onPress={() => setPicked(p)}
              style={({ pressed }) => ({
                paddingVertical: space.s,
                borderTopWidth: 1,
                borderTopColor: c.line,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text style={{ color: c.ink, fontWeight: '600' }}>{p.name}</Text>
              <Text style={{ color: c.muted, fontSize: 13 }}>
                {p.brand ? `${p.brand} · ` : ''}
                {Math.round(p.kcal100)} {t('common.kcal')} · {p.protein100} {t('common.g')} {t('food.protein').toLowerCase()} /
                100 g
              </Text>
            </Pressable>
          ))
        )}
        <Text style={{ color: c.muted, fontSize: 12 }}>{t('food.source')}</Text>
      </Card>

      <Card>
        <H2>{t('food.quickAdd')}</H2>
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
        <Button title={t('food.add')} onPress={addQuick} variant="secondary" />
      </Card>

      <Card>
        <Label>{t('food.today')}</Label>
        {todays.length === 0 ? <Body muted>{t('food.empty')}</Body> : null}
        {todays.map((f) => (
          <View
            key={f.id}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.s }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.ink, fontWeight: '600' }}>{f.name}</Text>
              <Text style={{ color: c.muted, fontSize: 13 }}>
                {f.grams > 0 ? `${f.grams} g · ` : ''}
                {!profile.hideCalories ? `${f.kcal} ${t('common.kcal')} · ` : ''}
                {f.protein} {t('common.g')} {t('food.protein').toLowerCase()}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove ${f.name}`}
              onPress={() => removeFood(f.id)}
              style={{ padding: space.s, borderRadius: radius.s }}
            >
              <Text style={{ color: c.muted, fontSize: 18 }}>×</Text>
            </Pressable>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
