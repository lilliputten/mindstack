'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Link } from '@/i18n/routing';
import { buttonVariants } from '@/components/ui/Button';
import * as Icons from '@/components/shared/Icons';
import { availableCategoriesRoute, isDev, startAliasRoute } from '@/config';

export function PromoCTASection() {
  const t = useT();

  return (
    <section
      className={cn(
        isDev && '__PromoCTASection', // DEBUG
        'relative',
        'mb-12 rounded-2xl py-12',
        'bg-gradient-to-r from-triadic1/30 to-triadic2/30',
        'dark text-white',
        'overflow-hidden',
        'transition',
      )}
    >
      <div
        className={cn(
          isDev && '__PromoCTASection_Decor', // DEBUG
          'absolute inset-0 overflow-hidden',
          'bg-header-gradient',
          'after-header-decor',
          'z-0',
          'opacity-50',
        )}
      />
      <div className="z-1 relative mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 text-center">
        <h2 className="content-truncate text-3xl font-semibold leading-tight tracking-tight lg:text-4xl">
          <div className="content-truncate py-2 text-white">
            {t('Landing.PromoCTASection.Title')}
          </div>
        </h2>
        <p className="content-truncate text-base leading-6 text-muted-foreground lg:text-lg">
          {t('Landing.PromoCTASection.Description')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href={startAliasRoute}
            className={cn(
              buttonVariants({ variant: 'gr2', size: 'lg', rounded: 'lg' }),
              'content-truncate flex items-center gap-2',
            )}
          >
            <Icons.Rocket className="size-4 shrink-0 opacity-50" />
            <span className="truncate">{t('Landing.PromoCTASection.StartFreeTrainingText')}</span>
          </Link>
          <Link
            href={availableCategoriesRoute}
            className={cn(
              buttonVariants({ variant: 'outline', size: 'lg', rounded: 'lg' }),
              'content-truncate flex items-center gap-2',
            )}
          >
            <Icons.Categories className="size-4 shrink-0 opacity-50" />
            <span className="truncate">{t('Landing.PromoCTASection.ExploreCategoriesText')}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
