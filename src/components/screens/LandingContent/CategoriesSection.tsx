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
        <h2 className="content-truncate mb-4 mt-0 text-3xl font-semibold leading-tight tracking-tight lg:text-4xl">
          <div className="content-truncate text-gr2 py-2">
            {t('Landing.CategoriesSection.Title')}
          </div>
        </h2>
        <p className="content-truncate">{t('Landing.CategoriesSection.Description')}</p>
      </div>
      {true && !!recentCategories?.length ? (
        <div
          className={cn(
            isDev && '__CategoriesSection_Categories', // DEBUG
            'flex flex-col gap-4',
          )}
        >
          <h3 className="content-truncate mb-3 mt-0 text-xl font-semibold text-theme">
            {t('Landing.CategoriesSection.IntroduceCategories')}
          </h3>
          <div className="mt-0 grid gap-2 gap-x-6 lg:grid-cols-2">
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
        </div>
      ) : (
        <p className="content-truncate">{t('Landing.CategoriesSection.NoCategories')}</p>
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
          <span className="truncate">{t('Landing.CategoriesSection.ViewAllCategoriesText')}</span>
        </Link>
        <Link
          href={`${availableCategoriesRoute}/suggest` as TRoutePath}
          className={cn(
            buttonVariants({ variant: 'outline' }),
            // buttonVariants({ variant: user?.id ? 'outline' : 'outline' }),
            'content-truncate flex items-center gap-2',
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
