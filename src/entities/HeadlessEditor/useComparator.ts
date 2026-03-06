'use client';

import React from 'react';

import { TLocale } from '@/i18n';
import { compareNGrams, compareTokens, TextComprarator } from '@/packages/text-comparator';
import { SymmetricalTwoDimensionalWeakCache } from '@/shared/lib/objects';

import { TCmpItemBase, TCmpItemId } from './types';

/** An array of token or ngram strings */
// type TItemTokens = string[];
type ItemTokens<LargeTexts extends boolean> = LargeTexts extends true
  ? Map<string, number>
  : string[];

interface TProps<T extends TCmpItemBase, LargeTexts extends boolean = boolean> {
  isReady: boolean;

  // Options...
  // Locale for comparator
  locale: TLocale;
  // Compare using ngrams for large texts or with just tokens otherwise
  largeTexts: LargeTexts;

  // Items interface...
  // Are comparator and other data ready?
  items: T[];
  getItemText: (item: T) => string;
}

interface TItemOverall {
  value: number;
  count: number;
  total: number;
}

export function useComparator<T extends TCmpItemBase, LargeTexts extends boolean>(
  props: TProps<T, LargeTexts>,
) {
  const {
    isReady: isOuterReady,
    /// Options...
    locale,
    largeTexts,
    // Items...
    items,
    getItemText,
  } = props;

  // Comparator
  const [comparator, setComparator] = React.useState<TextComprarator | undefined>();
  const [isComparatorReady, setComparatorReady] = React.useState<boolean>(false);
  React.useEffect(() => {
    setComparatorReady(false);
    const comparator = new TextComprarator({ lang: locale });
    comparator.awaitedInit().then(() => setComparatorReady(true));
    setComparator(comparator);
  }, [locale]);

  const isReady = isOuterReady && isComparatorReady;
  // const isBusy = !isReady;

  const itemTokensCache: WeakMap<T, ItemTokens<LargeTexts>> = React.useMemo(
    () =>
      (largeTexts ? new WeakMap<T, Map<string, number>>() : new WeakMap<T, string[]>()) as WeakMap<
        T,
        ItemTokens<LargeTexts>
      >,
    [largeTexts],
  );

  const comparedItemsCache: SymmetricalTwoDimensionalWeakCache<T, number> = React.useMemo(
    () => new SymmetricalTwoDimensionalWeakCache<T, number>(),
    [],
  );

  const computeItemTokens = React.useCallback<(it: T) => ItemTokens<LargeTexts> | null>(
    (it: T) => {
      if (!comparator?.isInited) return null;
      const text = getItemText(it);
      const tokens = largeTexts
        ? comparator.getTextNGramsSync(text)
        : comparator.getTextTokensSync(text);
      return tokens as ItemTokens<LargeTexts>;
    },
    [largeTexts, comparator, getItemText],
  );
  const getItemTokens = React.useCallback(
    (it: T) => {
      const cached = itemTokensCache.has(it) && itemTokensCache.get(it);
      if (cached) {
        return cached;
      }
      const tokens = computeItemTokens(it);
      if (tokens) {
        itemTokensCache.set(it, tokens);
      }
      return tokens;
    },
    [itemTokensCache, computeItemTokens],
  );
  const compareItemTokens = React.useCallback(
    (tk1: ItemTokens<LargeTexts>, tk2: ItemTokens<LargeTexts>) => {
      if (largeTexts) {
        // TypeScript knows tk1/tk2 are Map<string, number> here
        return compareNGrams(tk1 as Map<string, number>, tk2 as Map<string, number>);
      } else {
        // TypeScript knows tk1/tk2 are string[] here
        return compareTokens(tk1 as string[], tk2 as string[]);
      }
    },
    [largeTexts],
  );
  const getComparedValue = React.useCallback(
    (it1: T, it2: T) => {
      const cached = comparedItemsCache.get(it1, it2);
      if (cached != undefined) {
        return cached;
      }
      const tk1 = getItemTokens(it1);
      const tk2 = getItemTokens(it2);
      if (!tk1 || !tk2) {
        return null;
      }
      const value = compareItemTokens(tk1, tk2);
      comparedItemsCache.set(it1, it2, value);
      return value;
    },
    [comparedItemsCache, getItemTokens, compareItemTokens],
  );

  // const overallComparedCache = React.useMemo(() => new Map<T, TItemOverall>(), []);

  // Effect:overall items comparsions
  const overallComparedCache = React.useMemo(() => {
    if (!isReady) return;
    const overallComparedCache = new Map<T, TItemOverall>();
    items.forEach((it) => {
      let count = 0;
      let total = 0;
      items
        .filter((it2) => it2 !== it)
        .forEach((it2) => {
          const value = getComparedValue(it, it2);
          if (value) {
            count++;
            total += value;
          }
        });
      const value = total ? total / items.length : 0;
      const overall: TItemOverall = { value, count, total };
      overallComparedCache.set(it, overall);
    });
    return overallComparedCache;
  }, [isReady, items, getComparedValue]);

  const itemsMap = React.useMemo(() => {
    const map = new Map<TCmpItemId, T>();
    items.forEach((it) => map.set(it.id, it));
    return map;
  }, [items]);

  return React.useMemo(
    () => ({
      isComparatorReady,
      getComparedValue,
      overallComparedCache,
      itemsMap,
    }),
    [
      // All the items as dependencies
      isComparatorReady,
      getComparedValue,
      overallComparedCache,
      itemsMap,
    ],
  );
}
