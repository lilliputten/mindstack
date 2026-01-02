'use client';

import React from 'react';

import { ContentFooter } from '@/components/shared';

import { PricingComparisonTable } from './PricingComparisonTable';
import { PricingHeroSection } from './PricingHeroSection';
import { PricingPlansSection } from './PricingPlansSection';
import { TBillingPeriod } from './shared/types';

const BILLING_PERIOD_KEY = 'pricing-billing-period';
/* // UNUSED: paymentMode: TPaymentMode
 * const PAYMENT_MODE_KEY = 'pricing-payment-mode';
 */

export function PricingContent() {
  const [billingPeriod, setBillingPeriod] = React.useState<TBillingPeriod | undefined>();
  /* // UNUSED: paymentMode: TPaymentMode
   * const [paymentMode, setPaymentMode] = React.useState<TPaymentMode | undefined>();
   */

  React.useEffect(() => {
    // Initialize from localStorage or default to 'yearly'
    if (typeof window !== 'undefined') {
      const savedPeriodRaw = localStorage.getItem(BILLING_PERIOD_KEY);
      const savedPeriod =
        savedPeriodRaw === 'monthly' || savedPeriodRaw === 'yearly' ? savedPeriodRaw : 'yearly';
      setBillingPeriod(savedPeriod);

      /* // UNUSED: paymentMode: TPaymentMode
       * const savedModeRaw = localStorage.getItem(PAYMENT_MODE_KEY);
       * const savedMode = savedModeRaw === 'once' || savedModeRaw === 'regular' ? savedModeRaw : 'regular';
       * setPaymentMode(savedMode);
       */
    }
  }, []);

  // Update localStorage when billingPeriod changes
  React.useEffect(() => {
    if (typeof window !== 'undefined' && billingPeriod) {
      localStorage.setItem(BILLING_PERIOD_KEY, billingPeriod);
    }
  }, [billingPeriod]);

  /* // UNUSED: paymentMode: TPaymentMode
   * // Update localStorage when paymentMode changes
   * React.useEffect(() => {
   *   if (typeof window !== 'undefined' && paymentMode) {
   *     localStorage.setItem(PAYMENT_MODE_KEY, paymentMode);
   *   }
   * }, [paymentMode]);
   */

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
