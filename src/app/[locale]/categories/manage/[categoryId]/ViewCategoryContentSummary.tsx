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
import { Separator } from '@/components/ui/Separator';
import { Skeleton } from '@/components/ui/Skeleton';
import { isDev } from '@/constants';
import { getCategoryDescription, getCategoryName } from '@/features/categories/helpers';
import { useAvailableCategoryById } from '@/features/categories/query-hooks';
import { TAvailableCategory } from '@/features/categories/types';

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

  return (
    <div className={cn(isDev && '__ViewCategoryContentDetails', 'p-4', className)}>
      {/* Basic Info Section */}
      <div className="mb-6">
        <h2 className="mb-4 text-xl font-semibold">{t('ViewCategoryContentSummary.BasicInfo')}</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t('ViewCategoryContentSummary.Id')}
            </h3>
            <p className="text-base">{category.id}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t('ViewCategoryContentSummary.Name')}
            </h3>
            <p className="text-base">{getCategoryName(category, locale, t)}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t('ViewCategoryContentSummary.Status')}
            </h3>
            <div className="pt-1">
              <Badge variant={getStatusBadgeVariant(category.status)}>{t(category.status)}</Badge>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t('ViewCategoryContentSummary.CreatedAt')}
            </h3>
            <p className="text-base">{getFormattedRelativeDate(format, category.createdAt)}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t('ViewCategoryContentSummary.UpdatedAt')}
            </h3>
            <p className="text-base">{getFormattedRelativeDate(format, category.updatedAt)}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t('ViewCategoryContentSummary.TopicsCount')}
            </h3>
            <p className="text-base">{category._count?.topics || 0}</p>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="mb-6">
        <h2 className="mb-4 text-xl font-semibold">
          {t('ViewCategoryContentSummary.Description')}
        </h2>
        <p className="text-base text-gray-700 dark:text-gray-300">
          {getCategoryDescription(category, locale, t) ||
            t('ViewCategoryContentSummary.NoDescription')}
        </p>
      </div>

      {/* Keywords Section */}
      {category.translations && category.translations.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-4 text-xl font-semibold">{t('ViewCategoryContentSummary.Keywords')}</h2>
          <div className="flex flex-wrap gap-2">
            {(category.translations[0].keywords || '').split(',').map((keyword, idx) => (
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
          <h2 className="mb-4 text-xl font-semibold">{t('ViewCategoryContentSummary.Image')}</h2>
          <Image
            src={category.imageUrl}
            alt={getCategoryName(category, locale, t)}
            className="h-auto max-w-xs rounded-lg border"
          />
        </div>
      )}

      {/* Creator/Updater Info */}
      <Separator className="my-6" />
      <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
        <div>
          <h3 className="font-medium text-gray-500 dark:text-gray-400">
            {t('ViewCategoryContentSummary.CreatedBy')}
          </h3>
          <p>{category.createdBy || t('ViewCategoryContentSummary.Unknown')}</p>
        </div>
        <div>
          <h3 className="font-medium text-gray-500 dark:text-gray-400">
            {t('ViewCategoryContentSummary.UpdatedBy')}
          </h3>
          <p>{category.updatedBy || t('ViewCategoryContentSummary.Unknown')}</p>
        </div>
      </div>
    </div>
  );
}

function CategoryContentSummarySkeleton() {
  return (
    <div className="space-y-6 p-4">
      <div>
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

      <div>
        <h2 className="mb-4 text-xl font-semibold">
          <Skeleton className="h-6 w-1/4 rounded" />
        </h2>
        <Skeleton className="mb-2 h-4 w-full rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
      </div>

      <div>
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
