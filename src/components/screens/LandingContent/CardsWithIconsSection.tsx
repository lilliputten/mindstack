'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Icons } from '@/components/shared';
import { isDev } from '@/config';

import { CardWithIcon } from './shared';

export function CardsWithIconsSection() {
  const t = useT();
  return (
    <section
      className={cn(
        isDev && '__CardsWithIconsSection', // DEBUG
        'py-8 pb-0',
      )}
    >
      <div className="mb-3 flex max-w-2xl flex-col">
        <h2 className="content-truncate mb-4 mt-0 text-3xl font-semibold leading-tight tracking-tight text-theme lg:text-4xl">
          <div className="content-truncate text-gr2 py-2">
            {t('Landing.CardsWithIconsSection.Title')}
          </div>
        </h2>
        <p className="content-truncate text-base leading-6 text-muted-foreground lg:text-lg">
          {t('Landing.CardsWithIconsSection.Description')}
        </p>
      </div>
      <div className="my-3 grid gap-6 py-6 lg:grid-cols-3">
        <CardWithIcon
          debugId="Card-1"
          icon={Icons.Timer}
          title={t('Landing.CardsWithIconsSection.Title-1')}
          description={t('Landing.CardsWithIconsSection.Text-1')}
        />
        <CardWithIcon
          debugId="Card-2"
          icon={Icons.Activity}
          title={t('Landing.CardsWithIconsSection.Title-2')}
          description={t('Landing.CardsWithIconsSection.Text-2')}
        />
        <CardWithIcon
          debugId="Card-3"
          icon={Icons.ScanEye}
          title={t('Landing.CardsWithIconsSection.Title-3')}
          description={t('Landing.CardsWithIconsSection.Text-3')}
        />
      </div>
    </section>
  );
}
