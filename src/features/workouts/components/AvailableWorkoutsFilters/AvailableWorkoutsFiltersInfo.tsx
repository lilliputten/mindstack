'use client';

import React from 'react';

import { truncateString } from '@/lib/helpers';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { isDev } from '@/config';
import { useCategoryNames } from '@/features/categories';
import {
  getActiveFilterIds,
  getFilterFieldName,
  getFiltersDataValueString,
  TFiltersData,
} from '@/features/workouts/contexts/WorkoutsFiltersContext/WorkoutsFiltersHelpers';

import { useWorkoutsFiltersContext } from '../../contexts';

interface TProps extends TPropsWithClassName {
  filtersData: TFiltersData;
  maxValueLength?: number;
}

export function AvailableWorkoutsFiltersInfo(props: TProps) {
  const { className, filtersData, maxValueLength = 30 } = props;

  const { isLocal } = useWorkoutsFiltersContext();

  const tTexts = useT('AvailableWorkoutsFilterTexts');

  const activeFilterIds = getActiveFilterIds(filtersData);
  const { categoryNames, isLoading: isCategoryNamesLoading } = useCategoryNames();

  if (!activeFilterIds.length) {
    return null;
  }

  const categoryIds = filtersData?.categoryIds?.length ? filtersData?.categoryIds : undefined;
  const convertedData = filtersData && {
    ...filtersData,
    categoryIds,
    categoryNames: !isCategoryNamesLoading
      ? categoryIds?.map((id) => categoryNames?.[id]).filter(Boolean)
      : undefined,
  };

  const renderItems = activeFilterIds
    .map((id) => {
      const val = convertedData?.[id];
      // Temporarily don't use `searchText` and `searchLang` for local mode: Required loading & caching topics data for local filtering
      if (isLocal && (id === 'searchText' || id === 'searchLang')) {
        return;
      }
      if (id === 'adminMode' && !val) {
        return;
      }
      if (id === 'categoryIds' && !convertedData?.categoryNames?.length) {
        return undefined;
      }
      const { showOnlyValue, value } = getFiltersDataValueString(id, {
        filtersData: convertedData,
        specific: true,
        t: tTexts,
      });
      return (
        <span
          key={id}
          data-id={id}
          className={cn(
            isDev && '__AvailableWorkoutsFiltersInfo_Item',
            // 'flex items-center gap-1',
            'me-2 truncate',
            '[&:not(:last-child)]:after:inline-block',
            '[&:not(:last-child)]:after:ps-1',
            '[&:not(:last-child)]:after:content-["|"]',
            '[&:not(:last-child)]:after:opacity-15',
          )}
        >
          {!showOnlyValue && (
            <>
              <span className="opacity-50">{getFilterFieldName(id, tTexts)}:</span>{' '}
            </>
          )}
          <span>{truncateString(value, maxValueLength)}</span>
        </span>
      );
    })
    .filter(Boolean);

  const hasFilters = !!renderItems.length;

  return (
    <div
      className={cn(
        isDev && '__AvailableWorkoutsFiltersInfo', // DEBUG
        className,
      )}
    >
      {hasFilters ? renderItems : tTexts('NoActiveFilters')}
    </div>
  );
}
