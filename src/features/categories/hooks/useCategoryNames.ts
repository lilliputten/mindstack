'use client';

import React from 'react';
import { useLocale } from 'next-intl';

import { TLocale, useT } from '@/i18n';

import { getCategoryName } from '../helpers';
import { useAvailableCategories } from '../query-hooks';

export function useCategoryNames() {
  const t = useT();
  const locale = useLocale() as TLocale;
  const availableCategoriesQuery = useAvailableCategories();
  const { allCategories } = availableCategoriesQuery;
  const categoryNames = React.useMemo(() => {
    return allCategories.reduce(
      (names, category) => {
        names[category.id] = getCategoryName(category, locale, t);
        return names;
      },
      {} as Record<string, string>,
    );
  }, [locale, allCategories, t]);
  return React.useMemo(() => {
    return {
      categoryNames,
      ...availableCategoriesQuery,
    };
  }, [categoryNames, availableCategoriesQuery]);
}
