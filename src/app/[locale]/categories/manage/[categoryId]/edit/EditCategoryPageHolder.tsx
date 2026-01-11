'use client';

import React from 'react';

import { generateArray } from '@/lib/helpers';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { isDev } from '@/constants';
import { useAvailableCategories, useAvailableCategoryById } from '@/features/categories';
import { TCategoryId } from '@/features/categories/types';

import { EditCategoryPage } from './EditCategoryPage';

interface TEditCategoryPageHolderProps extends TPropsWithClassName {
  categoryId: TCategoryId;
}

export function EditCategoryPageHolder(props: TEditCategoryPageHolderProps) {
  const { categoryId } = props;

  if (!categoryId) {
    throw new Error('No category specified');
  }

  const availableCategoriesQuery = useAvailableCategories({});
  const { isFetched: isCategoriesFetched, queryKey: availableCategoriesQueryKey } =
    availableCategoriesQuery;

  const availableCategoryQuery = useAvailableCategoryById({
    traceId: 'EditCategoryPageHolder',
    id: categoryId,
    availableCategoriesQueryKey,
  });

  const { isFetched: isCategoryFetched, isCached: isCategoryCached } = availableCategoryQuery;

  const isCategoryReady = isCategoryCached || isCategoryFetched;

  // No data loaded yet - show skeleton
  if (!isCategoryReady || !isCategoriesFetched) {
    return (
      <div
        className={cn(
          isDev && '__EditCategoryPageHolder_Skeleton', // DEBUG
          'flex size-full flex-1 flex-col gap-4 px-6',
        )}
      >
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-8 w-full rounded-lg" />
        {generateArray(3).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return <EditCategoryPage categoryId={categoryId} />;
}
