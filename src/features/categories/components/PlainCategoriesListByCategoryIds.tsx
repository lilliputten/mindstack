import React from 'react';
import { useLocale } from 'next-intl';

import { generateArray } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { TLocale, useT } from '@/i18n';
import { Skeleton } from '@/components/ui/Skeleton';
import { isDev } from '@/config';

import { getCategoryName } from '../helpers';
import { useAvailableCategories } from '../query-hooks';
import { TCategoryId } from '../types';

interface TProps {
  categoryIds?: TCategoryId[];
  className?: string;
}

// TODO: Include optional (by parameter) category links to the dedicated category page, see Issue #66.

export function PlainCategoriesListByCategoryIds(props: TProps) {
  const { categoryIds, className } = props;
  const locale = useLocale() as TLocale;
  const t = useT();
  const availableCategoriesQuery = useAvailableCategories({
    traceId: 'PlainCategoriesListByCategoryIds',
    // includeTranslations: true, // USELESS: It's a default option
    all: true,
  });
  const {
    allCategories,
    isFetched: isCategoriesFetched,
    isLoading: isCategoriesLoading,
  } = availableCategoriesQuery;
  const isCategoriesReady = isCategoriesFetched && !isCategoriesLoading;
  const categoryNames = React.useMemo(() => {
    return allCategories.reduce(
      (names, category) => {
        names[category.id] = getCategoryName(category, locale, t);
        return names;
      },
      {} as Record<string, string>,
    );
  }, [locale, allCategories, t]);
  const categoriesBlock = React.useMemo(() => {
    if (!isCategoriesReady) {
      return (
        <span className="flex gap-1">
          {generateArray(categoryIds?.length || 1).map((n) => (
            <Skeleton key={n} className="h-4 w-12" />
          ))}
        </span>
      );
    }
    if (!categoryIds?.length) {
      return <span className="opacity-30">—</span>;
    }
    return categoryIds
      .map((id) => categoryNames[id])
      .filter(Boolean)
      .join(', ');
  }, [categoryIds, categoryNames, isCategoriesReady]);
  return (
    <span
      className={cn(
        isDev && '__PlainCategoriesList', // DEBUG
        className,
      )}
      title={typeof categoriesBlock === 'string' ? categoriesBlock : undefined}
    >
      {categoriesBlock}
    </span>
  );
}
