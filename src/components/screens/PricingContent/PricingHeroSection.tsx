'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { isDev } from '@/config';
import { yearlyDiscountPercents } from '@/constants';
import { useT } from '@/i18n';

import { ToggleButton, ToggleContainer } from './shared';
import { TBillingPeriod } from './shared/types';

interface PricingHeroSectionProps {
  billingPeriod?: TBillingPeriod;
  setBillingPeriod: (period: TBillingPeriod) => void;
}

/** Button width (em) */
const buttonWidthEm = 10;

export function PricingHeroSection({ billingPeriod, setBillingPeriod }: PricingHeroSectionProps) {
  const t = useT();

  return (
    <section
      className={cn(
        isDev && '__PricingHeroSection', // DEBUG
        'flex flex-col items-center py-6 text-center',
      )}
    >
      <h1 className="text-gradient-brand mb-4 mt-0 text-balance p-4 text-5xl font-semibold leading-tight tracking-tight lg:text-6xl">
        {t('Pricing.Hero.Title')}
      </h1>
      <p className="mb-4 text-lg">
        {t('Pricing.Hero.Subtitle', {
          yearlyDiscountPercents,
        })}
      </p>
      {!billingPeriod ? (
        <Skeleton className="h-11 rounded" style={{ width: `${buttonWidthEm * 2}em` }} />
      ) : (
        <ToggleContainer
          debugId="HeroBillingToggle"
          activeIndex={billingPeriod === 'monthly' ? 0 : 1}
          buttonWidthEm={buttonWidthEm}
        >
          <ToggleButton
            debugId="Monthly"
            isActive={billingPeriod === 'monthly'}
            onClick={() => setBillingPeriod('monthly')}
            buttonWidthEm={buttonWidthEm}
          >
            {t('Pricing.Hero.Monthly')}
          </ToggleButton>
          <ToggleButton
            debugId="Yearly"
            isActive={billingPeriod === 'yearly'}
            onClick={() => setBillingPeriod('yearly')}
            buttonWidthEm={buttonWidthEm}
          >
            {t('Pricing.Hero.Yearly')}
          </ToggleButton>
        </ToggleContainer>
      )}
    </section>
  );
}
