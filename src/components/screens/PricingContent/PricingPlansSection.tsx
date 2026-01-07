'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';

import {
  UserGradeType,
  // UserGradeSchema,
} from '@/generated/prisma';

import { cn } from '@/lib/utils';
import { Button, TButtonVariants } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { CurrencySigns } from '@/components/currencies';
import { useSignInModalContext } from '@/components/modals';
import * as Icons from '@/components/shared/Icons';
import { contactsAliasRoute, isDev, pricingChooseRoute, userStartAliasRoute } from '@/config';
import { useEnvConext } from '@/contexts/EnvContext';
import { localeCurrencies, stringifyPrice, TCurrencyPrices } from '@/features/currencies';
import {
  subscriptionsRequireUser,
  TPaidableSubscriptionType,
  TSubscriptionType,
  useAllSubscriptionPrices,
} from '@/features/subscriptions';
import { useGoToTheRoute } from '@/hooks';
import { TLocale, useT } from '@/i18n';
import { Link } from '@/i18n/routing';

import { TBillingPeriod } from './shared/types';

/** 'BASIC' | 'PRO' | 'PREMIUM' | 'UNLIMITED' */
type TExtendedGrade = Omit<UserGradeType, 'GUEST'> | 'UNLIMITED';
type TExtendedPrice = TCurrencyPrices | 'Free' | 'Contact' | undefined;

interface PricingPlan {
  grade: TExtendedGrade;
  name: string;
  description: string;
  prices: TExtendedPrice;
  subscription: TSubscriptionType;
  features: (React.ReactNode | string)[];
  buttonText: string;
  buttonVariant: TButtonVariants; // 'default' | 'outline';
  popular?: boolean;
  generations?: {
    type: 'total' | 'monthly' | 'unlimited';
    count?: number;
  };
}

interface PricingPlansSectionProps {
  billingPeriod: TBillingPeriod | undefined;
}

const futureStar = <span className="ml-1 inline text-theme">*</span>;

function usePlansData({
  isReady,
  billingPeriod,
}: {
  isReady?: boolean;
  billingPeriod: TBillingPeriod | undefined;
}) {
  const t = useT();
  const { BASIC_USER_GENERATIONS, PRO_USER_MONTHLY_GENERATIONS } = useEnvConext();
  const proSubscriptionType: TPaidableSubscriptionType = `PRO-${billingPeriod === 'yearly' ? 'YEAR' : 'MONTH'}`;
  const proPricesQuery = useAllSubscriptionPrices({
    isReady,
    subscriptionType: proSubscriptionType,
  });
  const premiumSubscriptionType: TPaidableSubscriptionType = `PREMIUM-${billingPeriod === 'yearly' ? 'YEAR' : 'MONTH'}`;
  const premiumPricesQuery = useAllSubscriptionPrices({
    isReady,
    subscriptionType: premiumSubscriptionType,
  });
  // prettier-ignore
  const tFuture = React.useCallback((text: string) => <>{t(text)} {futureStar}</>, [t]);
  const plansData: PricingPlan[] = React.useMemo(() => {
    const UNLIMITED: PricingPlan = {
      grade: 'UNLIMITED',
      name: t('Pricing.Plans.Unlimited.Name'),
      description: t('Pricing.Plans.Unlimited.Description'),
      prices: 'Contact',
      subscription: 'UNLIMITED',
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
    };
    const BASIC: PricingPlan = {
      grade: 'BASIC',
      name: t('Pricing.Plans.Basic.Name'),
      description: t('Pricing.Plans.Basic.Description'),
      prices: 'Free',
      subscription: 'BASIC',
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
    };
    const PRO: PricingPlan = {
      grade: 'PRO',
      name: t('Pricing.Plans.Pro.Name'),
      description: t('Pricing.Plans.Pro.Description'),
      prices: proPricesQuery.prices,
      subscription: proSubscriptionType,
      features: [
        t('Pricing.Plans.Pro.Features.Unlimited'),
        t('Pricing.Plans.Pro.Features.Ai'),
        tFuture('Pricing.Plans.Pro.Features.Analytics'),
        tFuture('Pricing.Plans.Pro.Features.Support'),
        t('Pricing.Plans.Pro.Features.Generations'),
      ],
      buttonText: t('Pricing.Plans.Pro.Button'),
      buttonVariant: 'theme',
      popular: true,
      generations: {
        type: 'monthly',
        count: PRO_USER_MONTHLY_GENERATIONS, // From PRO_USER_MONTHLY_GENERATIONS env var
      },
    };
    const PREMIUM: PricingPlan = {
      grade: 'PREMIUM',
      name: t('Pricing.Plans.Premium.Name'),
      description: t('Pricing.Plans.Premium.Description'),
      prices: premiumPricesQuery.prices,
      subscription: premiumSubscriptionType,
      features: [
        t('Pricing.Plans.Premium.Features.Everything'),
        t('Pricing.Plans.Premium.Features.UnlimitedGenerations'),
        tFuture('Pricing.Plans.Premium.Features.Priority'),
        tFuture('Pricing.Plans.Premium.Features.Advanced'),
        tFuture('Pricing.Plans.Premium.Features.Export'),
      ],
      buttonText: t('Pricing.Plans.Premium.Button'),
      buttonVariant: 'outline',
      generations: {
        type: 'unlimited',
      },
    };
    return [
      // All plans, starting with UNLIMITED (will be processed separately)
      UNLIMITED,
      BASIC,
      PRO,
      PREMIUM,
    ];
  }, [
    BASIC_USER_GENERATIONS,
    PRO_USER_MONTHLY_GENERATIONS,
    premiumPricesQuery.prices,
    premiumSubscriptionType,
    proPricesQuery.prices,
    proSubscriptionType,
    t,
    tFuture,
  ]);
  return plansData;
}

interface TStartSubscriptionParams {
  subscriptionType: TSubscriptionType;
  priceValue?: number;
}

export function PricingPlansSection({ billingPeriod }: PricingPlansSectionProps) {
  const t = useT();
  const locale = useLocale() as TLocale;
  const localeCurrency = localeCurrencies[locale];
  const CurrencySign = CurrencySigns[localeCurrency];
  const TgStarSign = CurrencySigns.TGSTAR;

  const goToTheRoute = useGoToTheRoute();

  const { showSignInModal } = useSignInModalContext();

  const { data: session, status: sessionStatus } = useSession();
  const user = session?.user;
  const isReady = sessionStatus !== 'loading' && !!billingPeriod;

  const plansData: PricingPlan[] = usePlansData({ isReady, billingPeriod });
  const [unlimitedPlan, ...mainPlans] = plansData;

  const startSubscription = React.useCallback(
    ({ subscriptionType }: TStartSubscriptionParams) => {
      const requiresUser = subscriptionsRequireUser.includes(subscriptionType);
      const isBasicSubscription = subscriptionType === 'BASIC';
      const choosePlanUrl = isBasicSubscription
        ? userStartAliasRoute
        : `${pricingChooseRoute}/${subscriptionType.toLowerCase()}`;
      if (requiresUser && !user) {
        const introText = isBasicSubscription
          ? t('PricingPlansSection.SignInModalIntroForBasic')
          : t('PricingPlansSection.SignInModalIntroAuth');
        showSignInModal({ redirectUrl: choosePlanUrl, introText });
      } else {
        goToTheRoute(choosePlanUrl);
      }
    },
    [user, t, showSignInModal, goToTheRoute],
  );

  return (
    <section
      className={cn(
        isDev && '__PricingPlansSection', // DEBUG
        'py-6',
      )}
    >
      <div className="grid gap-8 md:grid-cols-3">
        {mainPlans.map((plan) => {
          const { subscription, prices } = plan;
          const isPrices = prices && typeof prices === 'object';
          const priceValue = isPrices ? prices[localeCurrency] : undefined;
          const tgPriceValue = isPrices ? prices.TGSTAR : undefined;
          const subscriptionType: TSubscriptionType | undefined =
            typeof subscription !== 'object'
              ? subscription
              : billingPeriod
                ? subscription[billingPeriod]
                : undefined;

          return (
            <Card
              key={String(plan.grade)}
              className={cn(
                'relative flex flex-col justify-between p-6',
                'overflow-visible',
                'bg-theme/10',
                plan.popular && 'ring-2 ring-theme',
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="truncate rounded-full bg-theme px-6 py-2 text-xs font-medium text-white">
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
                      {!prices ? (
                        <Skeleton className="inline h-9 w-40 max-w-full rounded" />
                      ) : prices === 'Free' ? (
                        <span className="text-3xl font-bold">{t('Pricing.Free')}</span>
                      ) : prices === 'Contact' ? (
                        <span className="text-3xl font-bold">{t('Pricing.ContactUs')}</span>
                      ) : (
                        <>
                          <span className="flex flex-wrap items-center text-3xl font-bold">
                            <CurrencySign className="text-3xl" />
                            <span>{stringifyPrice(priceValue)}</span>
                          </span>
                          {tgPriceValue && (
                            <div className="flex flex-wrap items-center gap-1 text-sm">
                              <span>{t('or')}</span>
                              <span>{stringifyPrice(tgPriceValue)}</span>
                              <TgStarSign className="size-4 text-base" />
                            </div>
                          )}
                          <span className="text-sm">
                            /{' '}
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
              {subscriptionType && (
                <Button
                  variant={plan.buttonVariant}
                  className="mt-8 w-full"
                  size="lg"
                  onClick={() => startSubscription({ subscriptionType, priceValue })}
                >
                  {plan.buttonText}
                </Button>
              )}
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
            <Link href={contactsAliasRoute} className="flex items-center gap-2">
              {unlimitedPlan.buttonText}
            </Link>
          </Button>
        </Card>
      )}
    </section>
  );
}
