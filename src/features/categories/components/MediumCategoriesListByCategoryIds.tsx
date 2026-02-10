import React from 'react';
import Image from 'next/image';
import { useLocale } from 'next-intl';

import { generateArray } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { TLocale, useT } from '@/i18n';
import { Skeleton } from '@/components/ui/Skeleton';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';

import { getCategoryName } from '../helpers';
import { useAvailableCategories } from '../query-hooks';
import { TAvailableCategory, TCategoryId } from '../types';

interface TProps {
  categoryIds?: TCategoryId[];
  className?: string;
}

export function MediumCategoriesListByCategoryIds(props: TProps) {
  const { categoryIds, className } = props;
  const locale = useLocale() as TLocale;
  const t = useT();
  const availableCategoriesQuery = useAvailableCategories({
    traceId: 'MediumCategoriesListByCategoryIds',
    // includeTranslations: true, // USELESS: It's a default option
    all: true,
  });
  const {
    allCategories,
    isFetched: isCategoriesFetched,
    isLoading: isCategoriesLoading,
  } = availableCategoriesQuery;
  const isCategoriesReady = isCategoriesFetched && !isCategoriesLoading;
  const categoriesHash = React.useMemo(() => {
    return allCategories.reduce(
      (hash, category) => {
        hash[category.id] = category;
        return hash;
      },
      {} as Record<string, TAvailableCategory>,
    );
  }, [allCategories]);
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
      .map((id) => categoriesHash[id])
      .filter(Boolean)
      .map((category) => {
        const name = getCategoryName(category, locale, t);
        return (
          <div
            key={category.id}
            // TODO: Use link component and point it to the specific category page, when it'll be added, Issue #66
            className={cn(
              isDev && '__MediumCategoriesListByCategoryIds_Item', // DEBUG
              'flex items-center gap-2',
              'content-truncate',
              // 'cursor-pointer',
              // 'hover:bg-theme/10',
              'transitiion truncate',
            )}
          >
            <span
              className={cn(
                isDev && '__MediumCategoriesListByCategoryIds_ImageWrapper', // DEBUG
                'relative size-8 overflow-hidden rounded-lg border',
                'flex flex-shrink-0 items-center justify-center truncate',
              )}
            >
              {category.imageUrl ? (
                <Image src={category.imageUrl} className="rounded object-cover" alt={name} fill />
              ) : (
                <Icons.Categories className="size-5" />
              )}
            </span>
            <span className={cn('truncate')}>{name}</span>
          </div>
        );
      });
  }, [isCategoriesReady, categoryIds, categoriesHash, locale, t]);
  return (
    <span
      className={cn(
        isDev && '__PlainCategoriesList', // DEBUG
        'flex gap-2',
        className,
      )}
    >
      {categoriesBlock}
    </span>
  );
}
