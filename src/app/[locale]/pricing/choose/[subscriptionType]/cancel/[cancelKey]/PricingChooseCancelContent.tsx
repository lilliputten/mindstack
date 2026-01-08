'use client';

import React from 'react';

import { pricingAliasRoute } from '@/config/routesConfig';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';
import { useT } from '@/i18n';
import { Link } from '@/i18n/routing';

export function PricingChooseCancelContent() {
  const t = useT();

  return (
    <div
      className={cn(
        isDev && '__PricingChooseCancelContent', // DEBUG
        'mx-auto w-full max-w-4xl px-4 py-8',
      )}
    >
      <div
        className={cn(
          isDev && '__PricingChooseCancelContent_Header', // DEBUG
          'mb-12 text-center',
        )}
      >
        <div className="mb-6 flex justify-center">
          <div
            className={cn(
              isDev && '__PricingChooseCancelContent_Icon', // DEBUG
              'inline-block rounded-full',
              'p-4',
              'bg-red-500/70',
            )}
          >
            <Icons.CircleX className="size-12 text-white" />
          </div>
        </div>

        <h1 className="mb-4 text-4xl font-bold text-theme">
          {t('PricingChooseCancel.PaymentCanceled')}
        </h1>
      </div>

      <div className="flex flex-col justify-center gap-4 sm:flex-row">
        <Button variant="theme" size="lg">
          <Link
            href={pricingAliasRoute}
            className="flex h-full w-full items-center justify-center gap-2"
          >
            <Icons.ArrowRight className="size-4" />
            <span>{t('PricingChooseCancel.ViewPlans')}</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
