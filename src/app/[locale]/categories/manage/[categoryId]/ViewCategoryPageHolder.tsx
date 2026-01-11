'use client';

import React from 'react';

import { generateArray } from '@/lib/helpers';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { isDev } from '@/constants';
import { useAvailableCategoryById } from '@/features/categories/query-hooks';
import { TCategoryId } from '@/features/categories/types';

import { ViewCategoryPage } from './ViewCategoryPage';

interface TViewCategoryPageHolderProps extends TPropsWithClassName {
  categoryId: TCategoryId;
}

export function ViewCategoryPageHolder(props: TViewCategoryPageHolderProps) {
  const { categoryId } = props;

  if (!categoryId) {
    throw new Error('No category specified');
  }

  const availableCategoryQuery = useAvailableCategoryById({
    traceId: 'ViewCategoryPageHolder',
    id: categoryId,
  });

  const { isFetched: isCategoryFetched, isCached: isCategoryCached } = availableCategoryQuery;

  const isCategoryReady = isCategoryCached || isCategoryFetched;

  // No data loaded yet - show skeleton
  if (!isCategoryReady) {
    return (
      <div
        className={cn(
          isDev && '__ViewCategoryPage_Skeleton', // DEBUG
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

  return (
    <ViewCategoryPage categoryId={categoryId} availableCategoryQuery={availableCategoryQuery} />
  );
}
