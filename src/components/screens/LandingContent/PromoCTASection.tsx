'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { buttonVariants } from '@/components/ui/Button';
import * as Icons from '@/components/shared/Icons';
import { aboutAliasRoute, isDev, startAliasRoute } from '@/config';

export function PromoCTASection() {
  return (
    <section
      className={cn(
        isDev && '__PromoCTASection', // DEBUG
        'relative',
        'mb-12 rounded-2xl py-12',
        'bg-header-gradient',
        'dark text-white',
        'overflow-hidden',
        // 'bg-gradient-to-br from-purple-200 to-blue-200',
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
      <div className="z-1 relative mx-auto flex max-w-2xl flex-col items-center px-4 text-center">
        <h2 className="mb-6 mt-0 text-3xl font-semibold leading-tight tracking-tight lg:text-4xl">
          Start Building Your Knowledge Today
        </h2>
        <p className="mb-6 text-base leading-6 text-muted-foreground lg:text-lg">
          Join a growing community of learners and discover a better way to remember
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href={startAliasRoute}
            className={cn(
              buttonVariants({ variant: 'theme', size: 'lg', rounded: 'lg' }),
              'text-truncate flex items-center gap-2',
            )}
          >
            <Icons.Rocket className="size-4 shrink-0 opacity-50" />
            <span className="truncate">Start Free Training</span>
          </Link>
          {/* TODO: Create Your Account */}
          <Link
            href={aboutAliasRoute}
            className={cn(
              buttonVariants({ variant: 'theme', size: 'lg', rounded: 'lg' }),
              'text-truncate flex items-center gap-2',
            )}
          >
            <Icons.Categories className="size-4 shrink-0 opacity-50" />
            <span className="truncate">Explore Categories</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
