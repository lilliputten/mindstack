'use client';

import React from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { buttonVariants } from '@/components/ui/Button';
import * as Icons from '@/components/shared/Icons';
import { availableCategoriesRoute, isDev, startAliasRoute } from '@/config';

export function HeroSection() {
  return (
    <section
      className={cn(
        isDev && '__HeroSection', // DEBUG
        'flex flex-col items-center pb-8 pt-12',
      )}
    >
      <div className="text-truncate mb-3 flex max-w-2xl flex-col items-center text-center">
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
        <h1 className="text-truncate text-gradient-brand mb-4 mt-0 text-balance p-4 text-5xl font-semibold leading-tight tracking-tight lg:text-6xl">
          Train Your Brain. Build Your Knowledge.
        </h1>
        <p className="text-truncate mb-6 text-balance text-base leading-6 lg:text-lg">
          MindStack transforms how you learn and remember with AI‑powered memory training, spaced
          repetition, and active recall.
        </p>
        <div className="text-truncate flex flex-wrap items-center justify-center gap-3">
          <Link
            href={startAliasRoute}
            className={cn(
              buttonVariants({ variant: 'theme' }),
              'text-truncate flex items-center gap-2',
            )}
          >
            <Icons.Rocket className="size-4 shrink-0 opacity-50" />
            <span className="truncate">Start Training Free</span>
          </Link>
          <Link
            href={availableCategoriesRoute}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'text-truncate flex items-center gap-2',
            )}
          >
            <Icons.Categories className="size-4 shrink-0 opacity-50" />
            <span className="truncate">Explore Available Categories</span>
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
            'relative w-full overflow-hidden rounded-xl',
            // 'border border-dashed border-red-500/50', // DEBUG
            // 'aspect-[2356/1404]',
            'aspect-[16/9]',
          )}
        >
          <Image
            // src="/static/landing/placeholder-main-ui.png"
            // src="/static/landing/top-splash/como-estas-v1.jpg"
            // src="/static/landing/top-splash/brain-clash-v2.jpg"
            src="/static/landing/top-splash/brain-clash-v6.jpg"
            alt="MindStack Mind Trainer Application"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
