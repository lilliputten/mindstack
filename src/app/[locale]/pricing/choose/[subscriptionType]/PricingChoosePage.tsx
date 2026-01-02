'use client';

import React from 'react';
import { useLocale } from 'next-intl';

import { getRandomHashString } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { CurrencySigns } from '@/components/currencies';
import * as Icons from '@/components/shared/Icons';
import { isDev, pricingAliasRoute } from '@/config';
import { PREMIUM_MONTHLY_USD_PRICE, PRO_MONTHLY_USD_PRICE } from '@/constants/prices';
import { TPaidableSubscriptionType, TPeriodType } from '@/constants/subscriptions';
import { useEnvConext } from '@/contexts/EnvContext';
import { localeCurrencies, stringifyPrice } from '@/features/currencies';
import {
  useAllPrices,
  useCurrencyRatios,
} from '@/features/currencies/query-hooks/useCurrencyRatios';
import { UserGradeType } from '@/generated/prisma';
import { Link, TLocale, useT } from '@/i18n';

import { PricingChoosePaymentMethodCard } from './PricingChoosePaymentMethodCard';

interface PricingChoosePageProps {
  subscriptionType: TPaidableSubscriptionType;
  grade: UserGradeType;
  period: TPeriodType;
}

export function PricingChoosePage({ subscriptionType, grade, period }: PricingChoosePageProps) {
  const t = useT();
  const locale = useLocale() as TLocale;
  const localeCurrency = localeCurrencies[locale];
  const CurrencySign = CurrencySigns[localeCurrency];
  const TgStarSign = CurrencySigns.TGSTAR;
  const { BOT_USERNAME } = useEnvConext();

  const { loading: isRatiosLoading } = useCurrencyRatios({ isReady: true });
  const isReady = !isRatiosLoading;

  const idempotenceKey = React.useMemo(() => getRandomHashString(), []);

  const isYearly = period === 'YEAR';

  /** Base price based on a grade */
  const basePlanPrice = React.useMemo(() => {
    switch (grade) {
      case 'PRO':
        return PRO_MONTHLY_USD_PRICE;
      case 'PREMIUM':
        return PREMIUM_MONTHLY_USD_PRICE;
      default:
        return 0;
    }
  }, [grade]);
  /** Grade name */
  const planName = React.useMemo(() => {
    switch (grade) {
      case 'PRO':
        return 'Pro';
      case 'PREMIUM':
        return 'Premium';
      default:
        return subscriptionType;
    }
  }, [grade, subscriptionType]);

  const allPrices = useAllPrices(basePlanPrice, { isReady, prettify: true });
  const { yearlyPrices, monthlyPrices } = allPrices;

  const prices = isYearly ? yearlyPrices : monthlyPrices;
  const localePrice = prices[localeCurrency];
  const tgPrice = prices.TGSTAR;

  const telegramUrl = `https://t.me/${BOT_USERNAME}`;

  const handleRussianCard = React.useCallback(() => {
    const rubPrice = prices.RUB;
    console.log('Russian card payment for:', {
      rubPrice,
      localePrice,
      localeCurrency,
      prices,
      grade,
      period,
      basePlanPrice,
      planName,
      subscriptionType,
      idempotenceKey,
    });
    debugger;
  }, [
    // DEMO
    localePrice,
    localeCurrency,
    prices,
    grade,
    period,
    basePlanPrice,
    planName,
    subscriptionType,
    idempotenceKey,
  ]);

  const handleInternationalCard = React.useCallback(() => {
    console.log('International card payment for:', subscriptionType);
    debugger;
  }, []);

  const isPricesReady = true && !isRatiosLoading && basePlanPrice > 0;

  return (
    <main
      className={cn(
        isDev && '__PricingChoosePage', // DEBUG
        'flex w-full max-w-6xl flex-col px-6 pb-6',
      )}
    >
      <div className="mb-8 flex flex-col items-center text-center">
        <h1
          className={cn(
            isDev && '__PricingChoosePage_Title', // DEBUG
            'text-3xl md:text-5xl lg:text-6xl',
            'text-balance leading-tight tracking-tight',
            'text-gradient-brand font-semibold',
            'mb-6 mt-12 p-4',
          )}
        >
          {t('PricingChoosePage.ChoosePaymentMethod')}
        </h1>
        <p className="text-muted-foreground">
          {t('PricingChoosePage.CompleteSubscription', { planName })}
        </p>
        <div className="mt-4 text-lg">
          <div className="flex flex-wrap items-baseline gap-1">
            <span className="h-9">{t('PricingChoosePage.YoureToPay')}:</span>
            {isPricesReady ? (
              <span className="flex h-9 flex-wrap items-baseline gap-1">
                <span className="flex flex-wrap items-center text-3xl font-bold">
                  <CurrencySign className="text-3xl" />
                  <span>{stringifyPrice(localePrice)}</span>
                </span>
                {tgPrice && (
                  <div className="flex flex-wrap items-center gap-1 text-sm">
                    <span>{t('or')}</span>
                    <span>{stringifyPrice(tgPrice)}</span>
                    <TgStarSign className="size-4 text-base" />
                  </div>
                )}
              </span>
            ) : (
              <Skeleton className="h-7 w-28 max-w-full rounded" />
            )}
            <span className="h-9 text-sm">
              /{period === 'YEAR' ? t('Pricing.billedAnnually') : t('Pricing.billedMonthly')}
            </span>
          </div>
        </div>
      </div>

      <div
        className={cn(
          isDev && '__PricingChoosePage_Cards', // DEBUG
          'grid gap-6',
          'md:grid-cols-2',
          '2xl:grid-cols-3',
        )}
      >
        {/* Russian Card */}
        <PricingChoosePaymentMethodCard
          title={t('PricingChoosePage.RussianBankCard')}
          icon={Icons.Billing}
          description={t('PricingChoosePage.RussianBankCardDescription')}
          buttonText={t('PricingChoosePage.PayWithRussianCard')}
          onClick={handleRussianCard}
        />

        {/* International Card */}
        <PricingChoosePaymentMethodCard
          title={t('PricingChoosePage.InternationalCard')}
          icon={Icons.Globe}
          description={t('PricingChoosePage.InternationalCardDescription')}
          buttonText={t('PricingChoosePage.PayWithInternationalCard')}
          onClick={handleInternationalCard}
        />

        {/* Telegram Stars */}
        <PricingChoosePaymentMethodCard
          className="md:col-span-2 2xl:md:col-span-1"
          title={t('PricingChoosePage.TelegramStars')}
          icon={Icons.Telegram}
          description={
            <>
              <p>{t('PricingChoosePage.TelegramStarsOptionAvailable')}</p>
              <p className="text-sm opacity-50">
                {t('PricingChoosePage.TelegramStarsCompletePayment')}
              </p>
            </>
          }
          buttonText={t('PricingChoosePage.OpenTelegramBot', { botUsername: BOT_USERNAME })}
          link={telegramUrl}
          isLink={true}
        />
      </div>

      <div className="mt-12 flex flex-col items-center text-center">
        <p className="text-content text-muted-foreground">
          {t.rich('PricingChoosePage.OtherSubscriptionOptions', {
            PricingLink: (chunks) => (
              <Link href={pricingAliasRoute} className="underline">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </div>
    </main>
  );
}
