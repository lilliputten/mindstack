import React from 'react';
import Image from 'next/image';
import { useLocale } from 'next-intl';

import { cn } from '@/lib/utils';
import { TLocale, useT } from '@/i18n';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import * as Icons from '@/components/shared/Icons';
import { availableTopicsRoute, manageCategoriesRoute, TRoutePath } from '@/config';
import { isDev } from '@/constants';
import { CategoryHeader, CategoryProperties } from '@/features/categories/components';
import { getCategoryName } from '@/features/categories/helpers';
import { TAvailableCategory } from '@/features/categories/types';
import { useGoToTheRoute, useSessionData } from '@/hooks';

// TODO: Use 'next/navigation'

interface TAvailableCategoriesListItemProps {
  className?: string;
  category: TAvailableCategory;
  omitExtraDetails?: boolean;
}

export function AvailableCategoriesListItem(props: TAvailableCategoriesListItemProps) {
  const { category, className, omitExtraDetails } = props;
  const t = useT();

  const locale = useLocale() as TLocale;

  const categoryRoutePath = `${availableTopicsRoute}?categoryIds=${category.id}` as TRoutePath; // `/categories/${category.id}`;

  const { user } = useSessionData();
  const isOwner = category?.createdBy && category?.createdBy === user?.id;
  const isAdminMode = user?.role === 'ADMIN';
  const allowedEdit = isAdminMode || isOwner;

  const categoryName = getCategoryName(category, locale, t);

  const goToTheRoute = useGoToTheRoute();

  const __useLink = true;

  let cardContent = (
    <>
      <CardContent
        className={cn(
          isDev && '__AvailableCategoriesListItem_Content', // DEBUG
          'flex flex-1 gap-6 max-xs:flex-col',
          // 'xs:items-center',
          'p-6',
          'text-base',
        )}
      >
        <div
          className={cn(
            isDev && '__AvailableCategoriesListItem_Content_Image', // DEBUG
            'flex items-start gap-2',
          )}
        >
          <div
            className={cn(
              isDev && '__AvailableCategoriesListItem_Content_ImageWrapper', // DEBUG
              'relative size-24 overflow-hidden rounded-lg border',
              'flex flex-shrink-0 items-center justify-center truncate',
            )}
          >
            {category.imageUrl ? (
              <Image
                src={category.imageUrl}
                className="rounded object-cover"
                alt={categoryName}
                fill
              />
            ) : (
              <Icons.Categories className="size-8 opacity-50" />
            )}
          </div>
        </div>
        <div
          className={cn(
            isDev && '__AvailableCategoriesListItem_Content_MainContent', // DEBUG
            'flex flex-1 flex-col items-stretch gap-2',
            // 'max-xs:flex-col-reverse',
          )}
        >
          <div
            className={cn(
              isDev && '__AvailableCategoriesListItem_Content_Header', // DEBUG
              'flex flex-1 items-stretch gap-2',
              // 'max-xs:flex-col-reverse',
            )}
          >
            <CategoryHeader
              category={category}
              className={cn(
                isDev && '__AvailableCategoriesListItem_CategoryHeader', // DEBUG
                'flex-1 max-xs:flex-col-reverse',
              )}
              showProperties={false}
            />
            {!omitExtraDetails && (
              <div
                className={cn(
                  isDev && '__AvailableCategoriesListItem_Content_RightActions', // DEBUG
                  'flex flex-wrap items-center gap-2 xs:items-end',
                )}
              >
                {allowedEdit && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={(ev) => {
                      ev.preventDefault();
                      goToTheRoute(`${manageCategoriesRoute}/${category.id}`);
                    }}
                    className="flex items-center justify-center gap-2"
                    title={t('AvailableCategories.ManageCategory')}
                  >
                    <Link href={`${manageCategoriesRoute}/${category.id}` as TRoutePath}>
                      <Icons.Edit className="size-4" />
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>
          {!omitExtraDetails && (
            <div
              className={cn(
                isDev && '__AvailableCategoriesListItem_Content_CategoryProperties', // DEBUG
                'flex flex-1 flex-wrap items-center gap-4 gap-y-2',
                'text-xs',
                'content-truncate',
              )}
            >
              <CategoryProperties
                category={category}
                showDates
                omitExtraDetails={omitExtraDetails}
              />
            </div>
          )}
        </div>
      </CardContent>
    </>
  );
  if (__useLink) {
    cardContent = (
      <Link className="flex-1 text-xl font-medium" href={categoryRoutePath}>
        {cardContent}
      </Link>
    );
  }
  return (
    <Card
      className={cn(
        isDev && '__AvailableCategoriesListItem', // DEBUG
        'relative flex flex-1 flex-col',
        'overflow-visible',
        'cursor-pointer border border-theme-800/10 transition',
        'bg-theme/10',
        'hover:bg-theme/15',
        className,
      )}
    >
      {cardContent}
    </Card>
  );
}
