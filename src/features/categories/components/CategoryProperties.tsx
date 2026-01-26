'use client';

import React from 'react';
import { useLocale } from 'next-intl';

import { TLocale, useT } from '@/i18n';
import * as Icons from '@/components/shared/Icons';
import { getCategoryKeywords } from '@/features/categories/helpers';
import { TAvailableCategory } from '@/features/categories/types';

interface TCategoryPropertiesOptions {
  showDates?: boolean;
}
interface TCategoryPropertiesProps {
  category: TAvailableCategory;
}

export function CategoryProperties(props: TCategoryPropertiesProps & TCategoryPropertiesOptions) {
  const t = useT();
  const { category } = props;
  const { _count } = category;

  const locale = useLocale() as TLocale;

  const topicsCount = _count?.topics;

  // Get keywords from all translations
  const keywords = getCategoryKeywords(category, locale);
  const keywordsContent = keywords.map((kw, idx) => (
    <span key={`${idx}-${kw}`} className="truncate rounded-sm border bg-theme-700/10 px-1">
      {kw}
    </span>
  ));

  /* // UNUSED: Extra details omitted
   * const format = useFormatter();
   * const userQuery = useUserById(createdBy || undefined);
   * const { user } = userQuery;
   * const format = useFormatter();
   * const userQuery = useUserById(createdBy || undefined);
   * const { user } = userQuery;
   * const createdDateStr = getFormattedRelativeDate(format, createdAt);
   * const updatedDateStr = getFormattedRelativeDate(format, updatedAt);
   * const areDifferentDates = createdDateStr !== updatedDateStr;
   */

  return (
    <>
      <span id="topics" className="flex items-center gap-1" title={t('TopicsCount')}>
        <Icons.Topics className="mr-1 size-4 opacity-50" />
        {topicsCount ? topicsCount : t('NoTopics')}
      </span>

      {!!keywordsContent?.length && (
        <span
          id="keywords"
          className="content-truncate flex flex-wrap items-center gap-1"
          title={t('Keywords')}
        >
          <Icons.Tags className="mr-1 size-4 opacity-50" /> {keywordsContent}
        </span>
      )}

      {/* NOTE: Extra details are ommited
      {!!createdBy && (
        <span
          id="user-author"
          className="content-truncate flex items-center gap-1"
          title={t('Author')}
        >
          <SmallUserBlock className="content-truncate" isLoading={!user} user={user} tiny />
        </span>
      )}
      {showDates && (
        <span
          id="createdAt"
          className="content-truncate flex items-center gap-1 text-xs"
          title={t('CreationDate')}
        >
          <Icons.CalendarDays className="mr-1 size-4 opacity-50" />{' '}
          <span className="truncate">{createdDateStr}</span>
        </span>
      )}
      {showDates && updatedAt && areDifferentDates && (
        <span
          id="updatedAt"
          className="content-truncate flex items-center gap-1 text-xs"
          title={t('UpdatedDate')}
        >
          <Icons.Pencil className="mr-1 size-4 opacity-50" />{' '}
          <span className="truncate">{updatedDateStr}</span>
        </span>
      )}
      */}
    </>
  );
}
