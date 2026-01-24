'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { Link, useT } from '@/i18n';
import { buttonVariants } from '@/components/ui/Button';
import * as Icons from '@/components/shared/Icons';
import { availableCategoriesRoute, isDev, TRoutePath } from '@/config';
import { useLandingPageContext } from '@/contexts/LandingPageContext';
import { useSessionData } from '@/hooks';

import { CategoriesSectionItem } from './CategoriesSectionItem';

export function CategoriesSection() {
  const t = useT();
  const { user /* loading: isUserLoading */ } = useSessionData();
  const { recentCategories } = useLandingPageContext();
  return (
    <section
      className={cn(
        isDev && '__CategoriesSection', // DEBUG
        'flex flex-col gap-6 py-8 pb-8',
      )}
    >
      <div className="flex flex-col">
        <h2 className="text-truncate mb-4 mt-0 py-2 text-3xl font-semibold leading-tight tracking-tight text-theme lg:text-4xl">
          {t('Landing.CategoriesSection.Title')}
        </h2>
        <p className="text-truncate">{t('Landing.CategoriesSection.Description')}</p>
      </div>
      {true && !!recentCategories?.length ? (
        <div
          className={cn(
            isDev && '__CategoriesSection_Categories', // DEBUG
            'flex flex-col gap-4',
          )}
        >
          <p className="text-truncate">{t('Landing.CategoriesSection.IntroduceCategories')}</p>
          {recentCategories.map((category) => (
            <CategoriesSectionItem
              key={category.id}
              category={category}
              className={cn(
                isDev && '__CategoriesSection_Category', // DEBUG
              )}
            />
          ))}
        </div>
      ) : (
        <p className="text-truncate">{t('Landing.CategoriesSection.NoCategories')}</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={availableCategoriesRoute}
          className={cn(
            buttonVariants({ variant: 'theme' }),
            'text-truncate flex items-center gap-2',
          )}
        >
          <Icons.Categories className="size-4 shrink-0 opacity-50" />
          <span className="truncate">{t('Landing.CategoriesSection.ViewAllCategoriesText')}</span>
        </Link>
        <Link
          href={`${availableCategoriesRoute}/suggest` as TRoutePath}
          className={cn(
            buttonVariants({ variant: 'theme' }),
            'text-truncate flex items-center gap-2',
            !user?.id && 'disabled',
          )}
        >
          <Icons.Categories className="size-4 shrink-0 opacity-50" />
          <span className="truncate">{t('Landing.CategoriesSection.SuggestCategory')}</span>
        </Link>
      </div>
    </section>
  );
}
