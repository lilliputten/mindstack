'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';

import { cn } from '@/lib/utils';
import { Button, TButtonVariants } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { CurrencySigns } from '@/components/currencies';
import { useSignInModalContext } from '@/components/modals';
import * as Icons from '@/components/shared/Icons';
import { contactsAliasRoute, isDev, pricingChooseRoute, userStartAliasRoute } from '@/config';
import {
  PREMIUM_MONTHLY_USD_PRICE,
  // PREMIUM_YEARLY_USD_PRICE,
  PRO_MONTHLY_USD_PRICE,
  subscriptionsRequireUser,
  TSubscriptionType,
  // PRO_YEARLY_USD_PRICE,
} from '@/constants';
import { useEnvConext } from '@/contexts/EnvContext';
import { localeCurrencies, stringifyPrice, TCurrencyPrices } from '@/features/currencies';
import {
  useAllPrices,
  useCurrencyRatios,
} from '@/features/currencies/query-hooks/useCurrencyRatios';
import {
  UserGradeType,
  // UserGradeSchema,
} from '@/generated/prisma';
import { useGoToTheRoute } from '@/hooks';
import { TLocale, useT } from '@/i18n';
import { Link } from '@/i18n/routing';

import { TBillingPeriod } from './shared/types';

/** 'BASIC' | 'PRO' | 'PREMIUM' | 'UNLIMITED' */
type TExtendedGrade = Omit<UserGradeType, 'GUEST'> | 'UNLIMITED';

interface PricingPlan {
  grade: TExtendedGrade;
  name: string;
  description: string;
  price: {
    monthly: TCurrencyPrices | 'Free' | 'Contact';
    yearly: TCurrencyPrices | 'Free' | 'Contact';
  };
  subscription:
    | TSubscriptionType
    | {
        monthly: TSubscriptionType;
        yearly: TSubscriptionType;
      };
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
  /* // UNUSED: paymentMode: TPaymentMode
   * paymentMode?: TPaymentMode;
   */
}

const futureStar = <span className="ml-1 inline text-theme">*</span>;

function usePlansData({ isReady }: { isReady?: boolean }) {
  const t = useT();
  const { BASIC_USER_GENERATIONS, PRO_USER_MONTHLY_GENERATIONS } = useEnvConext();
  const allPricesOptions = { isReady, prettify: true };
  const proPrices = useAllPrices(isReady ? PRO_MONTHLY_USD_PRICE : 0, allPricesOptions);
  const premiumPrices = useAllPrices(isReady ? PREMIUM_MONTHLY_USD_PRICE : 0, allPricesOptions);
  const tFuture = React.useCallback(
    (text: string) => (
      <>
        {t(text)} {futureStar}
      </>
    ),
    [t],
  );
  const plansData: PricingPlan[] = React.useMemo(() => {
    const UNLIMITED: PricingPlan = {
      grade: 'UNLIMITED',
      name: t('Pricing.Plans.Unlimited.Name'),
      description: t('Pricing.Plans.Unlimited.Description'),
      price: { monthly: 'Contact', yearly: 'Contact' },
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
      price: { monthly: 'Free', yearly: 'Free' },
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
      price: {
        monthly: proPrices.monthlyPrices, // PRO_MONTHLY_USD_PRICE,
        yearly: proPrices.yearlyPrices, // PRO_YEARLY_USD_PRICE,
      },
      subscription: {
        monthly: 'PRO-MONTH',
        yearly: 'PRO-YEAR',
      },
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
      price: {
        monthly: premiumPrices.monthlyPrices, // PREMIUM_MONTHLY_USD_PRICE,
        yearly: premiumPrices.yearlyPrices, // PREMIUM_YEARLY_USD_PRICE,
      },
      subscription: {
        monthly: 'PREMIUM-MONTH',
        yearly: 'PREMIUM-YEAR',
      },
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
  }, [t, tFuture, BASIC_USER_GENERATIONS, PRO_USER_MONTHLY_GENERATIONS, proPrices, premiumPrices]);
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

  const { loading: isRatiosLoading } = useCurrencyRatios({
    isReady: !!billingPeriod,
  });

  const isReady = sessionStatus !== 'loading' && !!billingPeriod && !isRatiosLoading;

  const plansData: PricingPlan[] = usePlansData({ isReady });
  const [unlimitedPlan, ...mainPlans] = plansData;

  const startSubscription = React.useCallback(
    ({ subscriptionType, priceValue }: TStartSubscriptionParams) => {
      const requiresUser = subscriptionsRequireUser.includes(subscriptionType);
      const isBasicSubscription = subscriptionType === 'BASIC';
      const choosePlanUrl = isBasicSubscription
        ? userStartAliasRoute
        : `${pricingChooseRoute}/${subscriptionType.toLowerCase()}`;
      console.log('[PricingPlansSection:startSubscription]', {
        priceValue,
        subscriptionType,
        isBasicSubscription,
        user,
        subscriptionsRequireUser,
        requiresUser,
        choosePlanUrl,
      });
      debugger;
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
          const { subscription, price: priceData } = plan;
          const planData = billingPeriod ? priceData[billingPeriod] : undefined;
          const priceValue = typeof planData === 'object' ? planData[localeCurrency] : undefined;
          const tgPriceValue =
            planData && typeof planData === 'object' ? planData.TGSTAR : undefined;
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
                      {isRatiosLoading || !planData ? (
                        <Skeleton className="inline h-9 w-40 max-w-full rounded" />
                      ) : planData === 'Free' ? (
                        <span className="text-3xl font-bold">{t('Pricing.Free')}</span>
                      ) : planData === 'Contact' ? (
                        <span className="text-3xl font-bold">{t('Pricing.ContactUs')}</span>
                      ) : (
                        <>
                          <span className="flex flex-wrap items-center text-3xl font-bold">
                            <CurrencySign className="text-3xl" />
                            <span>{stringifyPrice(planData[localeCurrency])}</span>
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
                            {/* // UNUSED: paymentMode: TPaymentMode
                             * , {paymentMode === 'once'
                             *   ? t('Pricing.payOnce')
                             *   : t('Pricing.payRegular')}
                             */}
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
