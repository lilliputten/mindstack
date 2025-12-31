'use client';

import React from 'react';
import { useLocale } from 'next-intl';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { CurrencySigns } from '@/components/currencies';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';
import {
  PREMIUM_MONTHLY_USD_PRICE,
  // PREMIUM_YEARLY_USD_PRICE,
  PRO_MONTHLY_USD_PRICE,
  // PRO_YEARLY_USD_PRICE,
} from '@/constants';
import { useEnvConext } from '@/contexts/EnvContext';
import { localeCurrencies, TCurrencyStrings } from '@/features/currencies';
import {
  useAllPrices,
  useCurrencyRatios,
} from '@/features/currencies/query-hooks/useCurrencyRatios';
import { TLocale, useT } from '@/i18n';

interface PricingPlan {
  grade: 'BASIC' | 'PRO' | 'PREMIUM' | 'UNLIMITED';
  name: string;
  description: string;
  price: {
    monthly: TCurrencyStrings | 'Free' | 'Contact';
    yearly: TCurrencyStrings | 'Free' | 'Contact';
    starsMonthly?: number;
    starsYearly?: number;
  };
  features: string[];
  buttonText: string;
  buttonVariant: 'default' | 'outline';
  popular?: boolean;
  generations?: {
    type: 'total' | 'monthly' | 'unlimited';
    count?: number;
  };
}

interface PricingPlansSectionProps {
  billingPeriod: 'monthly' | 'yearly';
}

function usePlansData() {
  const t = useT();
  const { BASIC_USER_GENERATIONS, PRO_USER_MONTHLY_GENERATIONS } = useEnvConext();
  const { stringifiedMonthlyPrices: proMonthlyPrices, stringifiedYearlyPrices: proYearlyPrices } =
    useAllPrices(PRO_MONTHLY_USD_PRICE);
  const {
    stringifiedMonthlyPrices: premiumMonthlyPrices,
    stringifiedYearlyPrices: premiumYearlyPrices,
  } = useAllPrices(PREMIUM_MONTHLY_USD_PRICE);
  const plansData: PricingPlan[] = React.useMemo(
    () => [
      {
        grade: 'UNLIMITED',
        name: t('Pricing.Plans.Unlimited.Name'),
        description: t('Pricing.Plans.Unlimited.Description'),
        price: { monthly: 'Contact', yearly: 'Contact' },
        features: [
          t('Pricing.Plans.Unlimited.Features.Everything'),
          t('Pricing.Plans.Unlimited.Features.Enterprise'),
          t('Pricing.Plans.Unlimited.Features.Security'),
          t('Pricing.Plans.Unlimited.Features.Support'),
          t('Pricing.Plans.Unlimited.Features.Custom'),
        ],
        buttonText: t('Pricing.Plans.Unlimited.Button'),
        buttonVariant: 'outline',
        generations: {
          type: 'unlimited',
        },
      },
      {
        grade: 'BASIC',
        name: t('Pricing.Plans.Basic.Name'),
        description: t('Pricing.Plans.Basic.Description'),
        price: { monthly: 'Free', yearly: 'Free' },
        features: [
          t('Pricing.Plans.Basic.Features.Topics'),
          t('Pricing.Plans.Basic.Features.Workouts'),
          t('Pricing.Plans.Basic.Features.Progress'),
          t('Pricing.Plans.Basic.Features.Community'),
          t('Pricing.Plans.Basic.Features.Generations'),
        ],
        buttonText: t('Pricing.Plans.Basic.Button'),
        buttonVariant: 'outline',
        generations: {
          type: 'total',
          count: BASIC_USER_GENERATIONS, // From BASIC_USER_GENERATIONS env var
        },
      },
      {
        grade: 'PRO',
        name: t('Pricing.Plans.Pro.Name'),
        description: t('Pricing.Plans.Pro.Description'),
        price: {
          monthly: proMonthlyPrices, // PRO_MONTHLY_USD_PRICE,
          yearly: proYearlyPrices, // PRO_YEARLY_USD_PRICE,
        },
        features: [
          t('Pricing.Plans.Pro.Features.Unlimited'),
          t('Pricing.Plans.Pro.Features.Ai'),
          t('Pricing.Plans.Pro.Features.Analytics') + ' *',
          t('Pricing.Plans.Pro.Features.Support') + ' *',
          t('Pricing.Plans.Pro.Features.Generations'),
        ],
        buttonText: t('Pricing.Plans.Pro.Button'),
        buttonVariant: 'default',
        popular: true,
        generations: {
          type: 'monthly',
          count: PRO_USER_MONTHLY_GENERATIONS, // From PRO_USER_MONTHLY_GENERATIONS env var
        },
      },
      {
        grade: 'PREMIUM',
        name: t('Pricing.Plans.Premium.Name'),
        description: t('Pricing.Plans.Premium.Description'),
        price: {
          monthly: premiumMonthlyPrices, // PREMIUM_MONTHLY_USD_PRICE,
          yearly: premiumYearlyPrices, // PREMIUM_YEARLY_USD_PRICE,
        },
        features: [
          t('Pricing.Plans.Premium.Features.Everything'),
          t('Pricing.Plans.Premium.Features.UnlimitedGenerations'),
          t('Pricing.Plans.Premium.Features.Priority') + ' *',
          t('Pricing.Plans.Premium.Features.Advanced') + ' *',
          t('Pricing.Plans.Premium.Features.Export') + ' *',
        ],
        buttonText: t('Pricing.Plans.Premium.Button'),
        buttonVariant: 'outline',
        generations: {
          type: 'unlimited',
        },
      },
    ],
    [
      t,
      BASIC_USER_GENERATIONS,
      proMonthlyPrices,
      proYearlyPrices,
      PRO_USER_MONTHLY_GENERATIONS,
      premiumMonthlyPrices,
      premiumYearlyPrices,
    ],
  );
  return plansData;
}

export function PricingPlansSection({ billingPeriod }: PricingPlansSectionProps) {
  const t = useT();
  const locale = useLocale() as TLocale;
  const localeCurrency = localeCurrencies[locale];
  const CurrencySign = CurrencySigns[localeCurrency];
  const TgStarSign = CurrencySigns.TGSTAR;

  const ratiosQuery = useCurrencyRatios();
  const { loading: isRatiosLoading } = ratiosQuery;

  const plansData: PricingPlan[] = usePlansData();
  const [unlimitedPlan, ...mainPlans] = plansData;

  return (
    <section
      className={cn(
        isDev && '__PricingPlansSection', // DEBUG
        'py-6',
      )}
    >
      <div className="grid gap-8 md:grid-cols-3">
        {mainPlans.map((plan) => {
          const planData = plan.price[billingPeriod];
          const tgPrice = typeof planData === 'object' ? planData.TGSTAR : undefined;
          return (
            <Card
              key={plan.grade}
              className={cn(
                'relative flex flex-col justify-between p-6',
                'overflow-visible',
                'bg-theme/10',
                plan.popular && 'ring-2 ring-theme',
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="truncate rounded-full bg-theme px-3 py-1 text-xs font-medium text-white">
                    {t('Pricing.MostPopular')}
                  </span>
                </div>
              )}
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-theme">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                  <div className="mt-4">
                    <div className="flex flex-wrap items-baseline gap-1">
                      {planData === 'Free' ? (
                        <span className="text-3xl font-bold">{t('Pricing.Free')}</span>
                      ) : planData === 'Contact' ? (
                        <span className="text-3xl font-bold">{t('Pricing.ContactUs')}</span>
                      ) : (
                        <>
                          <span className="flex flex-wrap items-center text-3xl font-bold">
                            <CurrencySign className="text-3xl" />
                            {isRatiosLoading ? (
                              <Skeleton className="inline h-7 w-10 rounded" />
                            ) : (
                              planData[localeCurrency]
                            )}
                          </span>
                          {tgPrice && (
                            <div className="flex flex-wrap items-center gap-1 text-sm">
                              <span>or</span>
                              {isRatiosLoading ? (
                                <Skeleton className="inline h-5 w-7 rounded" />
                              ) : (
                                <span>{tgPrice}</span>
                              )}
                              <TgStarSign className="size-4 text-base" />
                            </div>
                          )}
                          <span className="text-sm">
                            {t('Pricing.PerMonth')}
                            {', '}
                            {billingPeriod === 'yearly'
                              ? t('Pricing.billedAnnually')
                              : t('Pricing.billedMonthly')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <hr className="my-4 bg-theme-800/5" />
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm">
                      <Icons.Check className="mt-0.5 size-4 shrink-0 text-theme" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button variant={plan.buttonVariant} className="mt-8 w-full" size="lg">
                {plan.buttonText}
              </Button>
            </Card>
          );
        })}
      </div>
      {!!unlimitedPlan && (
        <Card className="mt-8 flex flex-col items-start gap-6 bg-theme/10 p-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-bold text-theme">{unlimitedPlan.name}</h3>
            <p className="text-muted-foreground">{unlimitedPlan.description}</p>
          </div>
          <Button variant={unlimitedPlan.buttonVariant} size="lg">
            {unlimitedPlan.buttonText}
          </Button>
        </Card>
      )}
    </section>
  );
}
