'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
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
          Ready to Improve Your Memory?
        </h2>
        <p className="mb-6 text-base leading-6 text-muted-foreground lg:text-lg">
          Join MindStack today and start building your knowledge base. Create your first topic and
          begin training in minutes.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="theme" size="lg" rounded="lg">
            <Link href={startAliasRoute} className="flex items-center gap-2">
              <Icons.ArrowRight className="size-4 opacity-50" />
              <span>Get Started Free</span>
            </Link>
          </Button>
          <Button variant="outline" size="lg" rounded="lg">
            <Link href={aboutAliasRoute} className="flex items-center gap-2">
              <Icons.Info className="size-4 opacity-50" />
              <span>Learn More</span>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
