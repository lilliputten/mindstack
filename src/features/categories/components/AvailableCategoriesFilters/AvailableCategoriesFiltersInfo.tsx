'use client';

import React from 'react';

import { truncateString } from '@/lib/helpers';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { isDev } from '@/config';
import {
  getActiveFilterIds,
  getFilterFieldName,
  getFiltersDataValueString,
  TFiltersData,
} from '@/features/categories/contexts/CategoriesFiltersContext';

interface TProps extends TPropsWithClassName {
  filtersData?: TFiltersData;
  maxValueLength?: number;
}

export function AvailableCategoriesFiltersInfo(props: TProps) {
  const { className, filtersData, maxValueLength = 30 } = props;
  // See texts aimed to be translated in the `src/features/categories/contexts/CategoriesFiltersContext/CategoriesFiltersTexts.ts`
  const tTexts = useT('AvailableCategoriesFilterTexts');
  const activeFilterIds = getActiveFilterIds(filtersData);
  const renderItems = activeFilterIds
    .map((id) => {
      const { showOnlyValue, value } = getFiltersDataValueString(id, {
        filtersData,
        specific: true,
        t: tTexts,
      });
      return (
        <span
          key={id}
          data-id={id}
          className={cn(
            isDev && '__AvailableCategoriesFiltersInfo_Item', // DEBUG
            'me-2',
            '[&:not(:last-child)]:after:inline-block',
            '[&:not(:last-child)]:after:ps-1',
            '[&:not(:last-child)]:after:content-["|"]',
            '[&:not(:last-child)]:after:opacity-15',
            className,
          )}
        >
          {!showOnlyValue && (
            <>
              <span className="opacity-50">{getFilterFieldName(id, tTexts)}:</span>{' '}
            </>
          )}
          <span className="">{truncateString(value, maxValueLength)}</span>{' '}
        </span>
      );
    })
    .filter(Boolean);

  const hasFilters = !!renderItems.length;

  return (
    <span
      className={cn(
        isDev && '__AvailableCategoriesFiltersInfo', // DEBUG
        className,
      )}
    >
      {hasFilters ? renderItems : tTexts('NoActiveFilters')}
    </span>
  );
}
