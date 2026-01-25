'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';

import { CardWithIcon } from './shared';

export function HowItWorksCards() {
  const t = useT();
  return (
    <section
      className={cn(
        isDev && '__HowItWorksCards', // DEBUG
        'py-8 pb-0',
      )}
    >
      <div className="mb-3 flex max-w-2xl flex-col">
        <h2 className="content-truncate mb-4 mt-0 py-2 text-3xl font-semibold leading-tight tracking-tight text-theme lg:text-4xl">
          {t('Landing.HowItWorksCards.Title')}
        </h2>
        {
          <p className="content-truncate text-base leading-6 text-muted-foreground lg:text-lg">
            {t('Landing.HowItWorksCards.Description')}
          </p>
        }
      </div>
      <div className="mt-3 grid gap-6 py-6 lg:grid-cols-3">
        <CardWithIcon
          debugId="Card-1"
          icon={Icons.Sparkles}
          title={t('Landing.HowItWorksCards.Title-1')}
          description={t('Landing.HowItWorksCards.Text-1')}
        />
        <CardWithIcon
          debugId="Card-2"
          icon={Icons.Activity}
          title={t('Landing.HowItWorksCards.Title-2')}
          description={t('Landing.HowItWorksCards.Text-2')}
        />
        <CardWithIcon
          debugId="Card-3"
          icon={Icons.LineChart}
          title={t('Landing.HowItWorksCards.Title-3')}
          description={t('Landing.HowItWorksCards.Text-3')}
        />
      </div>
    </section>
  );
}
