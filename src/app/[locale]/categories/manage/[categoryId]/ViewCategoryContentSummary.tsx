'use client';

import * as React from 'react';
import Image from 'next/image';
import { useFormatter, useLocale } from 'next-intl';

import { CategoryStatusSchema } from '@/generated/prisma';

import { generateArray, getFormattedRelativeDate } from '@/lib/helpers';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Link, TLocale, useT } from '@/i18n';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MarkdownText } from '@/components/ui/MarkdownText';
import { Separator } from '@/components/ui/Separator';
import { Skeleton } from '@/components/ui/Skeleton';
import * as Icons from '@/components/shared/Icons';
import { allTopicsRoute, TRoutePath } from '@/config';
import { isDev } from '@/constants';
import {
  getCategoryDescription,
  getCategoryKeywords,
  getCategoryName,
} from '@/features/categories/helpers';
import { useAvailableCategoryById } from '@/features/categories/query-hooks';
import { TAvailableCategory } from '@/features/categories/types';
import { SmallUserBlock } from '@/features/users';
import { useUserById } from '@/features/users/query-hooks';

interface TViewCategoryContentSummaryProps extends TPropsWithClassName {
  availableCategoryQuery: ReturnType<typeof useAvailableCategoryById>;
}

export function ViewCategoryContentSummary(props: TViewCategoryContentSummaryProps) {
  const { availableCategoryQuery, className } = props;

  const {
    category,
    isFetched: isCategoryFetched,
    isLoading: isCategoryLoading,
  } = availableCategoryQuery;

  if (!isCategoryFetched || isCategoryLoading || !category) {
    return <CategoryContentSummarySkeleton />;
  }

  return <CategoryContentDetails category={category} className={className} />;
}

interface TCategoryContentDetailsProps extends TPropsWithClassName {
  category: TAvailableCategory;
}

function CategoryContentDetails({ category, className }: TCategoryContentDetailsProps) {
  const locale = useLocale() as TLocale;
  const t = useT();
  const format = useFormatter();

  // Status badge styling based on status
  const getStatusBadgeVariant = (status: typeof CategoryStatusSchema._output) => {
    switch (status) {
      case 'PUBLIC':
        return 'success';
      case 'SUGGESTED':
        return 'secondary';
      case 'HIDDEN':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const categoryName = getCategoryName(category, locale, t);
  const categoryDescription = getCategoryDescription(category, locale, t);

  const createdUserQuery = useUserById(category.createdBy || undefined);
  const {
    data: createdUser,
    isLoading: isCreatedUserLoading,
    // isFetched: isCreatedUserFetched,
    // isEnabled: isCreatedUserEnabled,
  } = createdUserQuery;
  const updatedUserQuery = useUserById(category.updatedBy || undefined);
  const {
    data: updatedUser,
    isLoading: isUpdatedUserLoading,
    // isFetched: isUpdatedUserFetched,
    // isEnabled: isUpdatedUserEnabled,
  } = updatedUserQuery;

  const keywords = getCategoryKeywords(category, locale);

  const topicsCount = category._count?.topics || 0;

  return (
    <div
      className={cn(
        isDev && '__ViewCategoryContentSummary', // DEBUG
        'm-6 flex w-full flex-col gap-4',
        className,
      )}
    >
      {/* Title */}
      <h2 className="content-truncate mb-2 text-2xl">{categoryName}</h2>

      {/* Description Section */}
      {categoryDescription && (
        <div data-testid="__ViewCategoryContentSummary_Description" className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">{t('Description')}</h3>
          <div className="rounded-lg bg-slate-500/10 p-4">
            <MarkdownText>{categoryDescription}</MarkdownText>
          </div>
        </div>
      )}

      {/* Category Topics */}
      <div
        data-testid="__ViewCategoryContentSummary_Section_Topics"
        className="flex flex-col gap-4"
      >
        <h3 className="text-lg font-semibold">{t('Topics')}</h3>
        <div className="flex flex-wrap gap-4">
          {!!topicsCount && (
            <span className="flex items-center gap-2">
              <Icons.AllTopics className="size-4 opacity-50" />
              <span>
                {t('TopicsCount')}: {topicsCount}
              </span>
            </span>
          )}
          <Button variant="theme" size="sm">
            <Link
              href={`${allTopicsRoute}/?categoryIds=${category.id}` as TRoutePath}
              className="flex items-center gap-2"
            >
              <Icons.Edit className="size-4 opacity-50" />
              <span>{t('ManageTopics')}</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Category Properties */}
        <div
          data-testid="__ViewCategoryContentSummary_Section_Properties"
          className="flex flex-col gap-4"
        >
          <h3 className="text-lg font-semibold">{t('Properties')}</h3>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={getStatusBadgeVariant(category.status)}
              className="flex gap-2 px-2 py-1"
              title={t('Status')}
            >
              <Icons.Tags className="size-4 opacity-50" />
              {t(category.status)}
            </Badge>
          </div>
        </div>

        {/* Keywords */}
        {!!keywords.length && (
          <div
            data-testid="__ViewCategoryContentSummary_Section_Keywords"
            className="flex flex-col gap-4"
          >
            <h3 className="text-lg font-semibold">{t('Keywords')}</h3>
            <div className="flex flex-wrap gap-1">
              {keywords.map((keyword, idx) => (
                <span key={idx} className="rounded-sm bg-theme-700/10 px-2 text-sm">
                  {keyword.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Section */}
      {category.imageUrl && (
        <div
          data-testid="__ViewCategoryContentSummary_Section_Image"
          className="flex flex-col gap-4"
        >
          <h3 className="text-lg font-semibold">{t('Image')}</h3>
          <div
            className={cn(
              isDev && '__ViewCategoryContentSummary_ImageWrapper', // DEBUG
              'relative size-32 overflow-hidden rounded-lg border',
            )}
          >
            <Image
              src={category.imageUrl}
              alt={categoryName}
              fill
              className={cn(
                isDev && '__ViewCategoryContentDetails_Image', // DEBUG
                'object-cover',
              )}
            />
          </div>
        </div>
      )}

      <Separator />

      {/* Creator/Updater Info */}
      <div
        data-testid="__ViewCategoryContentSummary_Section_CreatorUpdater"
        className="flex flex-col gap-4"
      >
        <h3 className="text-lg font-semibold">{t('Timeline')}</h3>
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <h4 className="truncate font-medium opacity-50">{t('Created')}</h4>
            <div className="flex flex-wrap items-center gap-2">
              <SmallUserBlock isLoading={isCreatedUserLoading} user={createdUser} />
              <div className="content-truncate opacity-50">
                {getFormattedRelativeDate(format, category.createdAt)}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="truncate font-medium opacity-50">{t('Modified')}</h4>
            <div className="flex flex-wrap items-center gap-2">
              <SmallUserBlock isLoading={isUpdatedUserLoading} user={updatedUser} />
              <div className="content-truncate opacity-50">
                {getFormattedRelativeDate(format, category.updatedAt)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryContentSummarySkeleton() {
  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col gap-2">
        <h2 className="mb-4 text-xl font-semibold">
          <Skeleton className="h-6 w-1/4 rounded" />
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {generateArray(6).map((i) => (
            <div key={i}>
              <Skeleton className="mb-2 h-4 w-1/3 rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="mb-4 text-xl font-semibold">
          <Skeleton className="h-6 w-1/4 rounded" />
        </h2>
        <Skeleton className="mb-2 h-4 w-full rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="mb-4 text-xl font-semibold">
          <Skeleton className="h-6 w-1/4 rounded" />
        </h2>
        <div className="flex flex-wrap gap-2">
          {generateArray(4).map((i) => (
            <Skeleton key={i} className="h-6 w-16 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
