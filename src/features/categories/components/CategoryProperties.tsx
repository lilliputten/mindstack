'use client';

import React from 'react';
import { useFormatter } from 'next-intl';

import { getFormattedRelativeDate } from '@/lib/helpers/dates';
import { useT } from '@/i18n';
import * as Icons from '@/components/shared/Icons';
import { getAllCategoryKeywords } from '@/features/categories/helpers';
import { TAvailableCategory } from '@/features/categories/types';
import { SmallUserBlock, useUserById } from '@/features/users';

interface TCategoryPropertiesOptions {
  showDates?: boolean;
}
interface TCategoryPropertiesProps {
  category: TAvailableCategory;
}

export function CategoryProperties(props: TCategoryPropertiesProps & TCategoryPropertiesOptions) {
  const t = useT();
  const { category, showDates } = props;
  const format = useFormatter();
  const { _count, createdAt, updatedAt, createdBy } = category;

  const topicsCount = _count?.topics;
  const userQuery = useUserById(createdBy || undefined);
  const { user } = userQuery;

  // Get keywords from all translations
  const keywords = getAllCategoryKeywords(category);
  const keywordsContent = keywords.map((kw, idx) => (
    <span key={`${idx}-${kw}`} className="truncate rounded-sm border bg-theme-700/10 px-1">
      {kw}
    </span>
  ));

  const createdDateStr = getFormattedRelativeDate(format, createdAt);
  const updatedDateStr = getFormattedRelativeDate(format, updatedAt);
  const areDifferentDates = createdDateStr !== updatedDateStr;

  return (
    <>
      <span id="topics" className="flex items-center gap-1" title={t('TopicsCount')}>
        <Icons.Topics className="mr-1 size-4 opacity-50" />
        {topicsCount ? topicsCount : t('NoTopics')}
      </span>

      {!!keywordsContent?.length && (
        <span
          id="keywords"
          className="text-truncate flex flex-wrap items-center gap-1"
          title={t('Keywords')}
        >
          <Icons.Tags className="mr-1 size-4 opacity-50" /> {keywordsContent}
        </span>
      )}

      {!!createdBy && (
        <span
          id="user-author"
          className="text-truncate flex items-center gap-1"
          title={t('Author')}
        >
          <SmallUserBlock className="text-truncate" isLoading={!user} user={user} tiny />
        </span>
      )}

      {showDates && (
        <span
          id="createdAt"
          className="text-truncate flex items-center gap-1 text-xs"
          title={t('CreationDate')}
        >
          <Icons.CalendarDays className="mr-1 size-4 opacity-50" />{' '}
          <span className="truncate">{createdDateStr}</span>
        </span>
      )}

      {showDates && updatedAt && areDifferentDates && (
        <span
          id="updatedAt"
          className="text-truncate flex items-center gap-1 text-xs"
          title={t('UpdatedDate')}
        >
          <Icons.Pencil className="mr-1 size-4 opacity-50" />{' '}
          <span className="truncate">{updatedDateStr}</span>
        </span>
      )}
    </>
  );
}
