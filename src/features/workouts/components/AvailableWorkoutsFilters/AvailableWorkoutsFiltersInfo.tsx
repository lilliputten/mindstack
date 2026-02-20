'use client';

import React from 'react';
import { useLocale } from 'next-intl';

import { truncateString } from '@/lib/helpers';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { TLocale, useT } from '@/i18n';
import { LanguageName } from '@/components/shared';
import { isDev } from '@/config';
import { useCategoryNames } from '@/features/categories/hooks';
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

  const locale = useLocale() as TLocale;

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
      if (id != 'langCode') {
        if (id === 'langName' || val == undefined || (Array.isArray(val) && !val.length)) {
          return;
        }
        if (id === 'categoryIds' && !convertedData?.categoryNames?.length) {
          return;
        }
      }
      // Temporarily don't use `searchText` and `langCode` (?) for local mode: Required loading & caching topics data for local filtering
      if (isLocal && id === 'searchText') {
        return;
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
            <span className="mr-1 opacity-50">{getFilterFieldName(id, tTexts)}:</span>
          )}
          {/*
          <span>{truncateString(value, maxValueLength)}</span>
          */}
          {id === 'langCode' ? (
            value === '-' ? (
              tTexts('AnyLanguage')
            ) : (
              <LanguageName
                langCode={val && typeof val === 'string' ? val : locale}
                langName={convertedData?.langName}
              />
            )
          ) : (
            <span>{content}</span>
          )}{' '}
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
