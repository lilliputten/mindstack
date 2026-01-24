'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { Link, useT } from '@/i18n';
import { buttonVariants } from '@/components/ui/Button';
import * as Icons from '@/components/shared/Icons';
import { availableCategoriesRoute, isDev } from '@/config';

export function CategoriesSection() {
  const t = useT();
  return (
    <section
      className={cn(
        isDev && '__CategoriesSection', // DEBUG
        'py-8 pb-8',
        // 'border border-red-500',
      )}
    >
      <div className="mb-3 flex flex-col">
        <h2 className="mb-4 mt-0 text-3xl font-semibold leading-tight tracking-tight text-theme lg:text-4xl">
          Learn Anything, From Languages to Programming
        </h2>
        <p className="text-base leading-6 text-muted-foreground lg:text-lg">
          Explore predefined categories or create your own. Here are some popular starting points:
        </p>
      </div>
      <div className="my-3 grid gap-6 py-6 lg:grid-cols-3">
        <div>--SHORT CATEGORIES LIST--</div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={availableCategoriesRoute}
          className={cn(
            buttonVariants({ variant: 'theme' }),
            'text-truncate flex items-center gap-2',
          )}
        >
          <Icons.Categories className="size-4 shrink-0 opacity-50" />
          <span className="truncate">View All Categories</span>
        </Link>
      </div>
    </section>
  );
}
