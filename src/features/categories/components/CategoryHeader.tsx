'use client';

import React from 'react';
import { useLocale } from 'next-intl';

import { cn } from '@/lib/utils';
import { TLocale, useT } from '@/i18n';
import { comparePathsWithoutLocalePrefix } from '@/i18n/helpers';
import { Link, usePathname } from '@/i18n/routing';
import { MarkdownText } from '@/components/ui/MarkdownText';
import { availableTopicsRoute, TRoutePath } from '@/config';
import { isDev } from '@/constants';
import { getCategoryDescription, getCategoryName } from '@/features/categories/helpers';
import { TAvailableCategory } from '@/features/categories/types';

import { CategoryProperties } from './CategoryProperties';

interface TCategoryHeaderOptions {
  showDates?: boolean;
  showName?: boolean;
  showDescription?: boolean;
  showProperties?: boolean;
  withLink?: boolean;
}

interface TCategoryHeaderProps {
  category: TAvailableCategory;
  className?: string;
}

const TRUNCATE_TITLE = false;

/* // UNUSED: ShowDetails
 * function ShowDetails(
 *   props: Pick<TCategoryHeaderOptions, 'showDates'> &
 *     Pick<TCategoryHeaderProps, 'category'> & {
 *       className?: string;
 *     },
 * ) {
 *   const { category, showDates } = props;
 *   const { createdBy, status, createdAt, updatedAt } = category;
 *
 *   // const categoryId = category.id;
 *
 *   const user = useSessionUser();
 *   const isOwner = createdBy && createdBy === user?.id;
 *   const format = useFormatter();
 *   const PublicIcon = status === 'PUBLIC' ? Icons.Eye : Icons.EyeOff;
 *   const t = useT();
 *
 *   return (
 *     <>
 *       {isOwner && (
 *         <span id="isOwner" title={t('CategoryHeader.YourCategory')}>
 *           <Icons.ShieldCheck className="size-4 text-green-600" />
 *         </span>
 *       )}
 *       {status === 'PUBLIC' && (
 *         <span id="isPublic" title={status === 'PUBLIC' ? t('Public') : t('Private')}>
 *           <PublicIcon className="size-4" />
 *         </span>
 *       )}
 *       {showDates && (
 *         <span id="createdAt" className="flex items-center gap-1 text-xs" title={t('CreationDate')}>
 *           <Icons.CalendarDays className="mr-1 size-4 opacity-50" />{' '}
 *           {getFormattedRelativeDate(format, createdAt)}
 *         </span>
 *       )}
 *       {showDates && updatedAt && !!compareDates(updatedAt, createdAt) && (
 *         <span id="updatedAt" className="flex items-center gap-1 text-xs" title={t('UpdatedDate')}>
 *           <Icons.Pencil className="mr-1 size-4 opacity-50" />{' '}
 *           {getFormattedRelativeDate(format, updatedAt)}
 *         </span>
 *       )}
 *     </>
 *   );
 * }
 */

export function CategoryHeader(props: TCategoryHeaderProps & TCategoryHeaderOptions) {
  const {
    category,
    className,
    // Options...
    // showDates,
    showName = true,
    showDescription = true,
    showProperties = true,
    withLink,
  } = props;

  const t = useT();

  const locale = useLocale() as TLocale;

  const categoryName = getCategoryName(category, locale, t);
  const categoryDescription = getCategoryDescription(category, locale, t);

  const categoryRoutePath = `${availableTopicsRoute}?categoryIds=${category.id}`; // `/categories/${category.id}`;
  const pathname = usePathname();
  let nameContent = showName ? <>{categoryName}</> : null;
  if (nameContent && withLink) {
    const isCurrentCategoryRoutePath = comparePathsWithoutLocalePrefix(categoryRoutePath, pathname);
    if (!isCurrentCategoryRoutePath) {
      // Do not use a link if it's already on the its page
      nameContent = (
        <Link
          className="flex-1 text-xl font-medium hover:underline"
          href={categoryRoutePath as TRoutePath}
        >
          {nameContent}
        </Link>
      );
    }
  }

  const hasName = !!nameContent;
  const hasDescription = showDescription && !!categoryDescription;
  const hasMainSection = hasName || hasDescription;

  const showDetails = !hasMainSection || showProperties;

  return (
    <div
      className={cn(
        isDev && '__CategoryHeader', // DEBUG
        'flex flex-col items-stretch gap-4',
        'content-truncate',
        className,
      )}
    >
      {hasMainSection && (
        <div
          className={cn(
            isDev && '__CategoryHeader_MainSection', // DEBUG
            'flex flex-1 items-start gap-2 max-sm:flex-col',
          )}
        >
          <div
            className={cn(
              isDev && '__CategoryHeader_Texts', // DEBUG
              'flex h-full flex-1 flex-col justify-evenly gap-2',
              TRUNCATE_TITLE ? 'truncate' : 'overflow-hidden text-ellipsis',
            )}
          >
            {hasName && (
              <h2
                id="name"
                className={cn(
                  isDev && '__CategoryHeader_Name', // DEBUG
                  TRUNCATE_TITLE ? 'truncate' : 'overflow-hidden text-ellipsis',
                  'text-xl',
                )}
              >
                {nameContent}
              </h2>
            )}
            {hasDescription && (
              <div
                className={cn(
                  isDev && '__CategoryHeader_Description', // DEBUG
                  'content-truncate text-base',
                )}
              >
                <MarkdownText className="content-truncate content-text">
                  {categoryDescription}
                </MarkdownText>
              </div>
            )}
          </div>
          {/*
          <div
            className={cn(
              isDev && '__CategoryHeader_RightDetails', // DEBUG
              '!mt-0 flex min-h-6 flex-wrap items-center gap-4 gap-y-2',
              'text-xs opacity-50',
            )}
          >
            <ShowDetails category={category} showDates={showDates} />
          </div>
          */}
        </div>
      )}
      {showDetails && (
        <div
          className={cn(
            isDev && '__CategoryHeader_DetailsSection', // DEBUG
            'flex flex-1 flex-wrap items-center gap-4 gap-y-2',
            'text-xs opacity-50',
            'content-truncate',
          )}
        >
          {/*!hasMainSection && <ShowDetails category={category} showDates={showDates} />*/}
          {showProperties && <CategoryProperties category={category} showDates />}
        </div>
      )}
    </div>
  );
}
