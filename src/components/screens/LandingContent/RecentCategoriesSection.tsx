'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { Link, useT } from '@/i18n';
import { buttonVariants } from '@/components/ui/Button';
import * as Icons from '@/components/shared/Icons';
import { availableCategoriesRoute, isDev, TRoutePath } from '@/config';
import { useLandingPageContext } from '@/contexts/LandingPageContext';
import { useSessionData } from '@/hooks';

import { RecentCategoriesSectionItem } from './RecentCategoriesSectionItem';

export function RecentCategoriesSection() {
  const t = useT();
  const { user /* loading: isUserLoading */ } = useSessionData();
  const { recentCategories } = useLandingPageContext();
  return (
    <section
      className={cn(
        isDev && '__RecentCategoriesSection', // DEBUG
        'flex flex-col gap-6 py-8 pb-8',
      )}
    >
      <div className="flex max-w-2xl flex-col">
        <h2 className="content-truncate mb-4 mt-0 text-3xl font-semibold leading-tight tracking-tight lg:text-4xl">
          <div className="content-truncate text-gr2 py-2">
            {t('Landing.RecentCategoriesSection.Title')}
          </div>
        </h2>
        <p className="content-truncate">{t('Landing.RecentCategoriesSection.Description')}</p>
      </div>
      {true && !!recentCategories?.length ? (
        <div
          className={cn(
            isDev && '__RecentCategoriesSection_Categories', // DEBUG
            'flex flex-col gap-4',
          )}
        >
          <h3 className="content-truncate mb-3 mt-0 text-xl font-semibold text-theme">
            {t('Landing.RecentCategoriesSection.IntroduceCategories')}
          </h3>
          <div
            className={cn(
              'mt-0 grid gap-2 gap-x-6',
              // Render in grid only if there are more than one topic
              recentCategories.length > 1 && 'lg:grid-cols-2',
            )}
          >
            {recentCategories.map((category) => (
              <RecentCategoriesSectionItem
                key={category.id}
                category={category}
                className={cn(
                  isDev && '__RecentCategoriesSection_Category', // DEBUG
                )}
              />
            ))}
          </div>
        </div>
      ) : (
        <p className="content-truncate">{t('Landing.RecentCategoriesSection.NoCategories')}</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={availableCategoriesRoute}
          className={cn(
            buttonVariants({ variant: 'gr1' }),
            'content-truncate flex items-center gap-2',
          )}
        >
          <Icons.Categories className="size-4 shrink-0 opacity-50" />
          <span className="truncate">
            {t('Landing.RecentCategoriesSection.ViewAllCategoriesText')}
          </span>
        </Link>
        <Link
          href={`${availableCategoriesRoute}/suggest` as TRoutePath}
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'content-truncate flex items-center gap-2',
            !user?.id && 'disabled',
          )}
        >
          <Icons.Plus className="size-4 shrink-0 opacity-50" />
          <span className="truncate">{t('Landing.RecentCategoriesSection.SuggestCategory')}</span>
        </Link>
      </div>
    </section>
  );
}
