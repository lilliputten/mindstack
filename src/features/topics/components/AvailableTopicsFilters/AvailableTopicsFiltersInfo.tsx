'use client';

import React from 'react';

import { truncateString } from '@/lib/helpers';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { isDev } from '@/config';
import { useT } from '@/i18n';

import {
  getActiveFilterIds,
  getFilterFieldName,
  getFiltersDataValueString,
} from './AvailableTopicsFiltersHelpers';
import { TFiltersData } from './AvailableTopicsFiltersTypes';

interface TProps extends TPropsWithClassName {
  filtersData?: TFiltersData;
  maxValueLength?: number;
}

export function AvailableTopicsFiltersInfo(props: TProps) {
  const { className, filtersData, maxValueLength = 30 } = props;
  const t = useT('AvailableTopicsFilters');
  const activeFilterIds = getActiveFilterIds(filtersData);
  const renderItems = activeFilterIds
    .map((id) => {
      const { showOnlyValue, value } = getFiltersDataValueString(id, {
        filtersData,
        specific: true,
        t,
      });
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
            <>
              <span className="opacity-50">{getFilterFieldName(id, t)}:</span>{' '}
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
        isDev && '__AvailableTopicsFiltersInfo', // DEBUG
        className,
      )}
    >
      {hasFilters ? renderItems : 'No active filters'}
    </span>
  );
}
