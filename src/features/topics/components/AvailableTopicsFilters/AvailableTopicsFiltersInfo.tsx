'use client';

import React from 'react';
import { useLocale } from 'next-intl';

import { truncateString } from '@/lib/helpers';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { TLocale, useT } from '@/i18n';
import { LanguageName } from '@/components/shared';
import { isDev } from '@/config';
import {
  getActiveFilterIds,
  getFilterFieldName,
  getFiltersDataValueString,
  TFiltersData,
} from '@/contexts/TopicsFiltersContext';
import { useCategoryNames } from '@/features/categories/hooks'; // ATTENTION: Inter-features import!

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

  const locale = useLocale() as TLocale;

  const categoryIds = filtersData?.categoryIds?.length ? filtersData?.categoryIds : undefined;
  const convertedData = React.useMemo(
    () =>
      filtersData && {
        ...filtersData,
        categoryIds,
        categoryNames: !isCategoryNamesLoading
          ? categoryIds?.map((id) => categoryNames?.[id]).filter(Boolean)
          : undefined,
      },
    [categoryIds, categoryNames, filtersData, isCategoryNamesLoading],
  );

  const renderItems = React.useMemo(
    () =>
      activeFilterIds
        .map((id) => {
          const val = convertedData?.[id];
          if (id != 'searchLang') {
            if (val == undefined || (Array.isArray(val) && !val.length)) {
              return undefined;
            }
            if (id === 'categoryIds' && !convertedData?.categoryNames?.length) {
              return undefined;
            }
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
                <span className="mr-1 inline-block opacity-50">
                  {getFilterFieldName(id, tTexts)}:
                </span>
              )}
              {id === 'searchLang' ? (
                value === '-' ? (
                  tTexts('AnyLanguage')
                ) : (
                  <LanguageName langCode={val && typeof val === 'string' ? val : locale} />
                )
              ) : (
                <span>{content}</span>
              )}{' '}
            </span>
          );
        })
        .filter(Boolean),
    [activeFilterIds, convertedData, tTexts, maxValueLength, className, locale],
  );

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
