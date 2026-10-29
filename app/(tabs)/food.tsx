import { Plus, ScanBarcode, Search, Trash2 } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, PanResponder, Pressable, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FoodProduct, searchFood } from '../../src/data/openFoodFacts';
import { dayKey } from '../../src/logic/dates';
import { dailyGoals, portion } from '../../src/logic/nutrition';
import { FoodEntry, useStore } from '../../src/store';
import { radius, space, type, useColors } from '../../src/theme';
import { Button, Card, Label, Meter, Muted, Screen, Strong } from '../../src/ui';

const DELETE_WIDTH = 104;
const COL_PROTEIN = 56;
const COL_KCAL = 64;

/** Food row that slides left (swipe or tap) to reveal a delete button. */
function FoodRow({ entry, showKcal, onDelete }: { entry: FoodEntry; showKcal: boolean; onDelete: () => void }) {
  const { t } = useTranslation();
  const c = useColors();
  const x = useRef(new Animated.Value(0)).current;
  const open = useRef(false);
  const settle = (to: boolean) => {
    open.current = to;
    Animated.timing(x, { toValue: to ? -DELETE_WIDTH : 0, duration: 180, useNativeDriver: true }).start();
  };
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => x.setValue(Math.max(-DELETE_WIDTH, Math.min(0, (open.current ? -DELETE_WIDTH : 0) + g.dx))),
      onPanResponderRelease: (_, g) => settle((open.current ? -DELETE_WIDTH : 0) + g.dx < -DELETE_WIDTH / 2),
      onPanResponderTerminate: () => settle(open.current),
    }),
  ).current;

  return (
    <View style={{ overflow: 'hidden', borderTopWidth: 1, borderTopColor: c.line }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('food.remove', { name: entry.name })}
        onPress={onDelete}
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: DELETE_WIDTH, backgroundColor: c.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
      >
        <Trash2 size={18} color={c.accentInk} strokeWidth={2} />
        <Text style={{ color: c.accentInk, fontSize: 16, fontWeight: '600' }}>{t('food.delete')}</Text>
      </Pressable>
      <Animated.View style={{ transform: [{ translateX: x }], backgroundColor: c.bg }} {...pan.panHandlers}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('food.rowAria', { name: entry.name, protein: entry.protein, kcal: entry.kcal })}
          onPress={() => settle(!open.current)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: space.s, minHeight: 60, paddingVertical: space.s }}
        >
          <View style={{ flex: 1, gap: 2 }}>
            <Strong numberOfLines={1}>{entry.name}</Strong>
            {entry.grams > 0 ? <Muted>{entry.grams} g</Muted> : null}
          </View>
          <Strong style={{ width: COL_PROTEIN, textAlign: 'right', fontVariant: ['tabular-nums'] }}>{Math.round(entry.protein)} g</Strong>
          {showKcal ? <Muted style={{ width: COL_KCAL, textAlign: 'right', fontVariant: ['tabular-nums'] }}>{entry.kcal}</Muted> : null}
        </Pressable>
      </Animated.View>
    </View>
  );
}

export default function Food() {
  const { t } = useTranslation();
  const c = useColors();
  const { profile, food, addFood, removeFood } = useStore();

  const goals = dailyGoals(profile);
  const today = dayKey();
  const todays = food.filter((f) => f.date === today);
  const totals = todays.reduce((a, f) => ({ kcal: a.kcal + f.kcal, protein: a.protein + f.protein }), { kcal: 0, protein: 0 });
  const proteinLeft = Math.max(0, goals.protein - totals.protein);

  // Search
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodProduct[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [picked, setPicked] = useState<FoodProduct | null>(null);
  const [grams, setGrams] = useState('100');

  // Manual entry
  const [manual, setManual] = useState(false);
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

  const clearSearch = () => {
    setPicked(null);
    setResults(null);
    setQuery('');
    setGrams('100');
  };

  const addPicked = () => {
    if (!picked) return;
    const g = Number(grams.replace(',', '.')) || 0;
    if (g <= 0) return;
    const p = portion({ kcal: picked.kcal100, protein: picked.protein100 }, g);
    addFood({ date: today, name: picked.name, grams: g, kcal: p.kcal, protein: p.protein });
    clearSearch();
  };

  const addManual = () => {
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
    setManual(false);
  };

  const field = { minHeight: 48, borderRadius: radius.m, backgroundColor: c.surface2, color: c.ink, fontSize: 16, paddingHorizontal: space.m };

  return (
    <Screen title={t('food.title')}>
      <View style={{ gap: space.l }}>
        <Meter
          label={t('food.protein')}
          value={totals.protein}
          goal={goals.protein}
          unit={t('common.g')}
          remainingLabel={t('food.left', { value: Math.round(proteinLeft), unit: t('common.g') })}
        />
        {!profile.hideCalories ? (
          <Meter label={t('food.calories')} value={totals.kcal} goal={goals.calories} unit={t('common.kcal')} color={c.muted} />
        ) : null}
      </View>

      <View style={{ gap: space.m }}>
        <View style={{ flexDirection: 'row', gap: space.s }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48, paddingHorizontal: space.m, borderRadius: radius.m, backgroundColor: c.surface2 }}>
            <Search size={20} color={c.muted} strokeWidth={2} />
            <TextInput
              accessibilityLabel={t('food.search')}
              value={query}
              onChangeText={setQuery}
              placeholder={t('food.search')}
              placeholderTextColor={c.muted}
              selectionColor={c.accent}
              returnKeyType="search"
              onSubmitEditing={runSearch}
              style={{ flex: 1, minHeight: 48, color: c.ink, fontSize: 16 }}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('food.scan')}
            onPress={() => Alert.alert(t('food.scan'), t('food.scanSoon'))}
            style={({ pressed }) => ({ width: 48, height: 48, borderRadius: radius.m, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}
          >
            <ScanBarcode size={22} color={c.ink} strokeWidth={2} />
          </Pressable>
        </View>

        {loading ? <ActivityIndicator color={c.accent} /> : null}
        {error ? <Muted>{t('food.error')}</Muted> : null}
        {results && results.length === 0 ? <Muted>{t('food.noResults')}</Muted> : null}

        {picked ? (
          <Card>
            <View style={{ gap: 2 }}>
              <Strong>{picked.name}</Strong>
              <Muted>
                {t('food.per100')}: {Math.round(picked.kcal100)} {t('common.kcal')} · {picked.protein100} {t('common.g')} {t('food.protein').toLowerCase()}
              </Muted>
            </View>
            <View style={{ flexDirection: 'row', gap: space.s, alignItems: 'flex-end' }}>
              <View style={{ flex: 1, gap: 6 }}>
                <Label>{t('food.amount')}</Label>
                <TextInput keyboardType="decimal-pad" value={grams} onChangeText={setGrams} selectionColor={c.accent} style={field} />
              </View>
              <Button title={t('food.add')} onPress={addPicked} />
            </View>
            <Button variant="text" title={t('common.cancel')} onPress={() => setPicked(null)} />
          </Card>
        ) : results && results.length > 0 ? (
          <View>
            {results.slice(0, 12).map((p) => (
              <Pressable
                key={p.code + p.name}
                accessibilityRole="button"
                onPress={() => setPicked(p)}
                style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 60, paddingVertical: space.s, borderTopWidth: 1, borderTopColor: c.line, opacity: pressed ? 0.6 : 1 })}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <Strong numberOfLines={1}>{p.name}</Strong>
                  <Muted numberOfLines={1}>
                    {p.brand ? `${p.brand} · ` : ''}
                    {p.protein100} {t('common.g')} {t('food.protein').toLowerCase()} / 100 g
                  </Muted>
                </View>
                <Plus size={22} color={c.accent} strokeWidth={2.5} />
              </Pressable>
            ))}
            <Button variant="text" title={t('common.close')} onPress={clearSearch} />
          </View>
        ) : null}

        {manual ? (
          <Card>
            <TextInput placeholder={t('food.name')} placeholderTextColor={c.muted} value={qName} onChangeText={setQName} selectionColor={c.accent} style={field} />
            <View style={{ flexDirection: 'row', gap: space.s }}>
              <TextInput
                placeholder={`${t('food.protein')} (${t('common.g')})`}
                placeholderTextColor={c.muted}
                keyboardType="decimal-pad"
                value={qProtein}
                onChangeText={setQProtein}
                selectionColor={c.accent}
                style={[field, { flex: 1 }]}
              />
              {!profile.hideCalories ? (
                <TextInput
                  placeholder={t('common.kcal')}
                  placeholderTextColor={c.muted}
                  keyboardType="number-pad"
                  value={qKcal}
                  onChangeText={setQKcal}
                  selectionColor={c.accent}
                  style={[field, { flex: 1 }]}
                />
              ) : null}
            </View>
            <Button title={t('food.add')} onPress={addManual} disabled={!qName.trim()} />
            <Button variant="text" title={t('common.cancel')} onPress={() => setManual(false)} />
          </Card>
        ) : !picked && !results ? (
          <View style={{ alignItems: 'flex-start' }}>
            <Button variant="text" icon={Plus} title={t('food.manual')} onPress={() => setManual(true)} />
          </View>
        ) : null}
      </View>

      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', gap: space.s, paddingBottom: space.xs }}>
          <Label style={{ flex: 1 }}>{t('food.today')}</Label>
          <Label style={{ width: COL_PROTEIN, textAlign: 'right' }}>{t('food.protein')}</Label>
          {!profile.hideCalories ? <Label style={{ width: COL_KCAL, textAlign: 'right' }}>{t('common.kcal')}</Label> : null}
        </View>
        {todays.length === 0 ? (
          <View style={{ borderTopWidth: 1, borderTopColor: c.line, paddingVertical: space.l }}>
            <Muted>{t('food.empty')}</Muted>
          </View>
        ) : (
          <View style={{ borderBottomWidth: 1, borderBottomColor: c.line }}>
            {todays.map((f) => (
              <FoodRow key={f.id} entry={f} showKcal={!profile.hideCalories} onDelete={() => removeFood(f.id)} />
            ))}
          </View>
        )}
        <Text style={[type.caption, { color: c.muted, marginTop: space.s }]}>
          {todays.length ? `${t('food.swipeHint')} · ` : ''}
          {t('food.source')}
        </Text>
      </View>
    </Screen>
  );
}
