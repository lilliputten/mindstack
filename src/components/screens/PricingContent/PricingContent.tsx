'use client';

import React from 'react';

import { ContentFooter } from '@/components/shared';

import { PricingComparisonTable } from './PricingComparisonTable';
import { PricingHeroSection } from './PricingHeroSection';
import { PricingPlansSection } from './PricingPlansSection';
import { TBillingPeriod } from './shared/types';

type BillingPeriod = TBillingPeriod;

export function PricingContent() {
  const [billingPeriod, setBillingPeriod] = React.useState<BillingPeriod>('yearly');

  return (
    <>
      <main className="flex w-full max-w-6xl flex-col px-6 pb-6">
        <PricingHeroSection billingPeriod={billingPeriod} setBillingPeriod={setBillingPeriod} />
        <PricingPlansSection billingPeriod={billingPeriod} />
        <PricingComparisonTable />
      </main>
      <ContentFooter />
    </>
  );
}
