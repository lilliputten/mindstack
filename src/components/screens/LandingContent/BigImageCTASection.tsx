'use client';

import React from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { buttonVariants } from '@/components/ui/Button';
import * as Icons from '@/components/shared/Icons';
import { isDev, startAliasRoute } from '@/config';

export function BigImageCTASection() {
  return (
    <section
      className={cn(
        isDev && '__BigImageCTASection', // DEBUG
        'py-8',
      )}
    >
      <div className="mb-3 max-w-2xl">
        <h2 className="text-truncate mb-4 mt-0 text-3xl font-semibold leading-tight tracking-tight text-theme lg:text-4xl">
          Build Your Knowledge Base Today
        </h2>
        <p className="text-truncate mb-6 text-base leading-6 text-muted-foreground lg:text-lg">
          Whether you're learning a new language, preparing for exams, or mastering professional
          skills, MindStack adapts to your goals.
        </p>
        <div className="mb-6 flex flex-wrap gap-3">
          <Link
            href={startAliasRoute}
            className={cn(
              buttonVariants({ variant: 'theme' }),
              'text-truncate flex items-center gap-2',
            )}
          >
            <Icons.ArrowRight className="size-4 shrink-0 opacity-50" />
            <span className="truncate">Try It Free</span>
          </Link>
        </div>
      </div>
      <div className="relative mt-4 w-full max-w-none">
        <div className="relative aspect-[2356/1404] w-full overflow-hidden rounded-lg">
          <Image
            src="/static/landing/placeholder-main-ui.png"
            alt="MindStack dashboard overview"
            fill
            className="object-contain"
          />
        </div>
      </div>
    </section>
  );
}
