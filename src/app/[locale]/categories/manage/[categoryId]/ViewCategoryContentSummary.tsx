'use client';

import React from 'react';
import Image from 'next/image';
import { useFormatter, useLocale } from 'next-intl';

import { CategoryStatusSchema } from '@/generated/prisma';

import { generateArray, getFormattedRelativeDate } from '@/lib/helpers';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { TLocale, useT } from '@/i18n';
import { Badge } from '@/components/ui/Badge';
import { MarkdownText } from '@/components/ui/MarkdownText';
import { Separator } from '@/components/ui/Separator';
import { Skeleton } from '@/components/ui/Skeleton';
import { isDev } from '@/constants';
import {
  getAllCategoryKeywords,
  getCategoryDescription,
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

  return (
    <div
      className={cn(
        isDev && '__ViewCategoryContentDetails', // DEBUG
        'w-full p-6',
        className,
      )}
    >
      {/* Basic Info Section */}
      <div className="mb-6">
        <h2 className="mb-4 truncate text-xl font-semibold">
          {t('ViewCategoryContentSummary.BasicInfo')}
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* // DEBUG?
          <div className="flex flex-col gap-2">
            <h3 className="truncate text-sm font-medium opacity-50">
              {t('ViewCategoryContentSummary.Id')}
            </h3>
            <p className="text-truncate">{category.id}</p>
          </div>
          */}

          <div className="flex flex-col gap-2">
            <h3 className="truncate text-sm font-medium opacity-50">
              {t('ViewCategoryContentSummary.Name')}
            </h3>
            <p className="text-truncate">{categoryName}</p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="truncate text-sm font-medium opacity-50">
              {t('ViewCategoryContentSummary.Status')}
            </h3>
            <div className="pt-1">
              <Badge variant={getStatusBadgeVariant(category.status)}>{t(category.status)}</Badge>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="truncate text-sm font-medium opacity-50">
              {t('ViewCategoryContentSummary.TopicsCount')}
            </h3>
            <p className="text-truncate">{category._count?.topics || 0}</p>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="mb-6">
        <h2 className="mb-4 truncate text-xl font-semibold">
          {t('ViewCategoryContentSummary.Description')}
        </h2>
        {categoryDescription ? (
          <div className="rounded-lg bg-slate-500/10 p-4">
            <MarkdownText>{categoryDescription}</MarkdownText>
          </div>
        ) : (
          <p className="text-truncate opacity-50">
            {t('ViewCategoryContentSummary.NoDescription')}
          </p>
        )}
      </div>

      {/* Keywords Section */}
      {category.translations && category.translations.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-4 truncate text-xl font-semibold">
            {t('ViewCategoryContentSummary.Keywords')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {getAllCategoryKeywords(category).map((keyword, idx) => (
              <Badge key={idx} variant="secondary">
                {keyword.trim()}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Image Section */}
      {category.imageUrl && (
        <div className="mb-6">
          <h2 className="mb-4 truncate text-xl font-semibold">
            {t('ViewCategoryContentSummary.Image')}
          </h2>
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
                isDev && '__ViewCategoryContentDetails', // DEBUG
                'object-cover',
              )}
            />
          </div>
        </div>
      )}

      {/* Creator/Updater Info */}
      <Separator className="my-6" />
      <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <h3 className="truncate font-medium opacity-50">
            {t('ViewCategoryContentSummary.CreatedBy')}
          </h3>
          <SmallUserBlock isLoading={isCreatedUserLoading} user={createdUser} />
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="truncate font-medium opacity-50">
            {t('ViewCategoryContentSummary.UpdatedBy')}
          </h3>
          <SmallUserBlock isLoading={isUpdatedUserLoading} user={updatedUser} />
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="truncate text-sm font-medium opacity-50">
            {t('ViewCategoryContentSummary.CreatedAt')}
          </h3>
          <p className="text-truncate">{getFormattedRelativeDate(format, category.createdAt)}</p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="truncate text-sm font-medium opacity-50">
            {t('ViewCategoryContentSummary.UpdatedAt')}
          </h3>
          <p className="text-truncate">{getFormattedRelativeDate(format, category.updatedAt)}</p>
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
