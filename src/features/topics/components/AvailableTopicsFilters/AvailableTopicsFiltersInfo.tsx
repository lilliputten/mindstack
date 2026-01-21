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
} from '@/contexts/TopicsFiltersContext';
import { useCategoryNames } from '@/features/categories';

interface TProps extends TPropsWithClassName {
  filtersData?: TFiltersData;
  maxValueLength?: number;
}

export function AvailableTopicsFiltersInfo(props: TProps) {
  const { className, filtersData, maxValueLength = 30 } = props;
  // See texts aimed to be translated in the `src/contexts/TopicsFiltersContext/TopicsFiltersTexts.ts`
  const tTexts = useT('AvailableTopicsFilterTexts');
  const activeFilterIds = getActiveFilterIds(filtersData);
  const { categoryNames, isLoading: isCategoryNamesLoading } = useCategoryNames();
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
      if (val == undefined || (Array.isArray(val) && !val.length)) {
        return undefined;
      }
      if (id === 'categoryIds' && !convertedData?.categoryNames?.length) {
        return undefined;
      }
      const { showOnlyValue, value } = getFiltersDataValueString(id, {
        filtersData: convertedData,
        specific: true,
        t: tTexts,
      });
      const content = truncateString(value, maxValueLength);
      return (
        <span
          key={id}
          data-id={id}
          className={cn(
            isDev && '__AvailableTopicsFiltersInfo_Item', // DEBUG
            'me-2',
            '[&:not(:last-child)]:after:inline-block',
            '[&:not(:last-child)]:after:ps-1',
            '[&:not(:last-child)]:after:content-["|"]',
            '[&:not(:last-child)]:after:opacity-15',
            className,
          )}
        >
          {!showOnlyValue && (
            <span className="mr-1 inline-block opacity-50">{getFilterFieldName(id, tTexts)}:</span>
          )}
          <span>{content}</span>{' '}
        </span>
      );
    })
    .filter(Boolean);

  const hasFilters = !!renderItems.length;

  return (
    <span
      className={cn(
        isDev && '__AvailableTopicsFiltersInfo', // DEBUG
        className,
      )}
    >
      {hasFilters ? renderItems : tTexts('NoActiveFilters')}
    </span>
  );
}
