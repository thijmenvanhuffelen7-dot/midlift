import type { TFunction } from 'i18next';
import type { Change, CheckIn } from './logic/adapt';

/**
 * Turns the check-in's changes into one short line ("Adjusted: 1 set less, you slept badly")
 * and a longer explanation. Returns null when nothing changed.
 */
export function describeChanges(t: TFunction, changes: Change[], c: CheckIn): { short: string; detail: string } | null {
  if (changes.length === 0) return null;

  const what = changes
    .filter((ch, i, all) => ch.type !== 'swapped' || all.findIndex((x) => x.type === 'swapped') === i)
    .map((ch) => {
      if (ch.type === 'fewerSets') return t('adjust.fewerSetsShort');
      if (ch.type === 'lighter') return t('adjust.lighterShort');
      return t('adjust.swappedShort', { count: changes.filter((x) => x.type === 'swapped').length });
    });

  const why: string[] = [];
  if (c.energy === 0 && c.sleep === 0) why.push(t('adjust.whyTired'));
  else if (c.sleep === 0) why.push(t('adjust.whySleep'));
  else if (c.energy === 0) why.push(t('adjust.whyEnergy'));
  if (c.pain !== 'none') why.push(t('adjust.whyPain', { area: t(`adjust.area.${c.pain}`) }));

  const detail = changes.map((ch) => {
    if (ch.type === 'fewerSets') return t('adjust.fewerSetsDetail');
    if (ch.type === 'lighter') return t('adjust.lighterDetail');
    return t('adjust.swappedDetail', { from: t(`ex.${ch.from}`), to: t(`ex.${ch.to}`) });
  });
  if (changes.some((ch) => ch.type === 'fewerSets')) {
    if (!changes.some((ch) => ch.type === 'lighter')) detail.push(t('adjust.weightsSame'));
    detail.push(t('adjust.addSetHint'));
  }

  return {
    short: t('adjust.short', { what: what.join(', '), why: why.join(t('adjust.and')) }),
    detail: detail.join(' '),
  };
}
