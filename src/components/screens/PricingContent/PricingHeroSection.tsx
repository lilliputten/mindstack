'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { isDev } from '@/config';
import { useT } from '@/i18n';

import { ToggleButton, ToggleContainer } from './shared';
import { TBillingPeriod } from './shared/types';

interface PricingHeroSectionProps {
  billingPeriod: TBillingPeriod;
  setBillingPeriod: (period: TBillingPeriod) => void;
}

const buttonWidth = 28;

export function PricingHeroSection({ billingPeriod, setBillingPeriod }: PricingHeroSectionProps) {
  const t = useT();

  return (
    <section
      className={cn(
        isDev && '__PricingHeroSection', // DEBUG
        'py-6 text-center',
      )}
    >
      <h1 className="text-gradient-brand mb-4 mt-0 text-balance p-4 text-5xl font-semibold leading-tight tracking-tight lg:text-6xl">
        {t('Pricing.Hero.Title')}
      </h1>
      <p className="mb-4 text-lg">{t('Pricing.Hero.Subtitle')}</p>
      <ToggleContainer
        debugId="HeroBillingToggle"
        activeIndex={billingPeriod === 'monthly' ? 0 : 1}
        buttonWidth={buttonWidth}
      >
        <ToggleButton
          debugId="Monthly"
          isActive={billingPeriod === 'monthly'}
          onClick={() => setBillingPeriod('monthly')}
          buttonWidth={buttonWidth}
        >
          {t('Pricing.Hero.Monthly')}
        </ToggleButton>
        <ToggleButton
          debugId="Yearly"
          isActive={billingPeriod === 'yearly'}
          onClick={() => setBillingPeriod('yearly')}
          buttonWidth={buttonWidth}
        >
          {t('Pricing.Hero.Yearly')}
        </ToggleButton>
      </ToggleContainer>
    </section>
  );
}
