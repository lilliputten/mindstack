'use client';

import React from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Link } from '@/i18n/routing';
import { buttonVariants } from '@/components/ui/Button';
import * as Icons from '@/components/shared/Icons';
import { isDev, startAliasRoute } from '@/config';

export function BigImageCTASection() {
  const t = useT();

  return (
    <section
      className={cn(
        isDev && '__BigImageCTASection', // DEBUG
        'py-8',
      )}
    >
      <div className="mb-3 max-w-2xl">
        <h2 className="text-truncate mb-4 mt-0 py-2 text-3xl font-semibold leading-tight tracking-tight text-theme lg:text-4xl">
          {t('Landing.BigImageCTASection.Title')}
        </h2>
        <p className="text-truncate mb-6 text-base leading-6 text-muted-foreground lg:text-lg">
          {t('Landing.BigImageCTASection.Description')}
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
            <span className="truncate">{t('Landing.BigImageCTASection.TryItFreeText')}</span>
          </Link>
        </div>
      </div>
      <div className="relative mt-4 w-full max-w-none">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <Image
            src="/static/landing/features/02.jpg"
            alt={t('Landing.BigImageCTASection.Title')}
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
