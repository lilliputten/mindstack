'use client';

import React from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Link } from '@/i18n/routing';
import { buttonVariants } from '@/components/ui/Button';
import * as Icons from '@/components/shared/Icons';
import { availableCategoriesRoute, isDev, startAliasRoute } from '@/config';

export function HeroSection() {
  const t = useT();

  return (
    <section
      className={cn(
        isDev && '__HeroSection', // DEBUG
        'flex flex-col items-center pb-8 pt-12',
      )}
    >
      <div className="content-truncate mb-3 flex max-w-2xl flex-col items-center text-center">
        {/* // TODO: Announce block
        <Link
          href="/"
          className={cn(
            isDev && '__HeroSection_Announce', // DEBUG
            'mb-3 inline-flex items-center rounded-2xl',
            'border border-theme/50',
            'bg-muted/50 px-3 py-0.5 text-sm text-theme hover:underline',
          )}
        >
          Version 0.0.4 released!
        </Link>
         */}
        <h1 className="content-truncate text-gradient-brand mb-4 mt-0 text-balance p-4 text-5xl font-semibold leading-tight tracking-tight lg:text-6xl">
          {t('Landing.HeroSection.Title')}
        </h1>
        <p className="content-truncate mb-6 text-balance text-base leading-6 lg:text-lg">
          {t('Landing.HeroSection.Description')}
        </p>
        <div className="content-truncate flex flex-wrap items-center justify-center gap-3">
          <Link
            href={startAliasRoute}
            className={cn(
              buttonVariants({ variant: 'theme' }),
              'content-truncate flex items-center gap-2',
            )}
          >
            <Icons.Rocket className="size-4 shrink-0 opacity-50" />
            <span className="truncate">{t('Landing.HeroSection.StartTrainingFreeText')}</span>
          </Link>
          <Link
            href={availableCategoriesRoute}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'content-truncate flex items-center gap-2',
            )}
          >
            <Icons.Categories className="size-4 shrink-0 opacity-50" />
            <span className="truncate">
              {t('Landing.HeroSection.ExploreAvailableCategoriesText')}
            </span>
          </Link>
        </div>
      </div>
      <div
        className={cn(
          isDev && '__HeroSection_ImageWrapper', // DEBUG
          'relative mt-8 w-full max-w-none',
        )}
      >
        <div
          className={cn(
            isDev && '__HeroSection_ImageContainer', // DEBUG
            'relative w-full overflow-hidden rounded-lg',
            'aspect-video',
          )}
        >
          <Image
            src="/static/landing/features/14.jpg"
            alt={t('Landing.HeroSection.Title')}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
