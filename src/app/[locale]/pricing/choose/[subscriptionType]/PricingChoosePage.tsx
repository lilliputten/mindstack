'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';

import { getErrorText } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { CurrencySigns } from '@/components/currencies';
import * as Icons from '@/components/shared/Icons';
import { contactsAliasRoute, isDev, pricingAliasRoute } from '@/config';
import { useEnvConext } from '@/contexts/EnvContext';
import { localeCurrencies, stringifyPrice } from '@/features/currencies';
import { GradeComparisonResult } from '@/features/payments/helpers';
import { useYookassaPayment } from '@/features/payments/hooks';
import {
  parsePaidableSubscriptionType,
  TPaidableSubscriptionType,
  useAllSubscriptionPrices,
} from '@/features/subscriptions';
import { Link, TLocale, useT } from '@/i18n';

import { PricingChoosePaymentMethodCard } from './PricingChoosePaymentMethodCard';

interface PricingChoosePageProps {
  subscriptionType: TPaidableSubscriptionType;
  comparisonResult?: GradeComparisonResult;
  upgradePriceDifference?: number;
}

export function PricingChoosePage({
  subscriptionType,
  comparisonResult,
  upgradePriceDifference,
}: PricingChoosePageProps) {
  const t = useT();
  const { grade, period } = parsePaidableSubscriptionType(subscriptionType, t);
  const locale = useLocale() as TLocale;
  const localeCurrency = localeCurrencies[locale];

  // Determine current period - default to requested period if not provided
  // const effectiveCurrentPeriod = currentPeriod || period;
  const CurrencySign = CurrencySigns[localeCurrency];
  const TgStarSign = CurrencySigns.TGSTAR;
  const { BOT_USERNAME } = useEnvConext();

  const [isWorking, startWorking] = React.useTransition();

  const allSubscriptionPricesQuery = useAllSubscriptionPrices({ subscriptionType });
  const { prices, isLoading, isFetched } = allSubscriptionPricesQuery;
  const isPricesQueryReady = !!prices && !isLoading && isFetched;

  const localePrice = prices?.[localeCurrency];
  const tgPrice = prices?.TGSTAR;

  const telegramUrl = `https://t.me/${BOT_USERNAME}`;

  const yookassaPayment = useYookassaPayment({ subscriptionType });
  const { isReady: isYoukassaPaymentReady, startYoukassaPayment } = yookassaPayment;

  // Handle different comparison scenarios
  const isSame = comparisonResult?.type === 'same';
  const isGuest = comparisonResult?.type === 'guest';
  const isDowngrade = comparisonResult?.type === 'downgrade';
  const isUpgrade = comparisonResult?.type === 'upgrade';

  // DEBUG: Effect:comparisonResult
  React.useEffect(() => {
    console.log('[PricingChoosePage] Effect:comparisonResult', {
      isGuest,
      isDowngrade,
      isUpgrade,
      comparisonResult,
      // requestedGrade,
      // currentGrade,
    });
  }, [comparisonResult, isDowngrade, isGuest, isUpgrade]);

  const handleRussianCard = React.useCallback(() => {
    // // Guest users should authorize in order to be able to make payments
    if (isGuest) {
      // Should not reach here as guest users are redirected at server level
      toast.error(t('PricingChoosePage.GuestNotAllowed'));
      return;
    }

    if (isDowngrade) {
      // Show warning about downgrade and suggest contacting support
      toast.warning(t('PricingChoosePage.DowngradeWarning'));
      // In a real scenario, we might want to redirect to contact support
      // For now, we'll just show the warning
      return;
    }

    startWorking(async () => {
      try {
        const promise = startYoukassaPayment();
        toast.promise(promise, {
          loading: t('PricingChoosePage.PaymentIsStarting'),
          success: t('PricingChoosePage.PaymentSuccessfullyStarted'),
          // error: 'Payment starting error',
        });
        const result = await promise;
        const { paymentUrl } = result;
        // eslint-disable-next-line no-console
        console.log('[PricingChoosePage:handleRussianCard] done', {
          result,
          paymentUrl,
        });
        if (!paymentUrl) {
          throw new Error('No payment url provided');
        }
        if (typeof window === 'object') {
          window.location.href = paymentUrl;
        }
      } catch (error) {
        const message = t('UseYookassaPayment.PaymentStartingError');
        const details = getErrorText(error);
        const comboMsg = [message, details].filter(Boolean).join(': ');
        // eslint-disable-next-line no-console
        console.error('[PricingChoosePage:handleRussianCard]', comboMsg, {
          error,
        });
        debugger; // eslint-disable-line no-debugger
        // TODO: Use error in the toast.promise, without details
        toast.error(comboMsg);
      }
    });
  }, [startYoukassaPayment, isGuest, isDowngrade, t]);

  const handleInternationalCard = React.useCallback(() => {
    if (isGuest) {
      // Should not reach here as guest users are redirected at server level
      toast.error(t('PricingChoosePage.GuestNotAllowed'));
      return;
    }

    if (isDowngrade) {
      // Show warning about downgrade
      toast.warning(t('PricingChoosePage.DowngradeWarning'));
      // In a real scenario, we might want to redirect to contact support
      return;
    }

    // TODO
    // eslint-disable-next-line no-console
    console.log('[PricingChoosePage:handleInternationalCard]', subscriptionType);
    // eslint-disable-next-line no-debugger
    debugger;
  }, [subscriptionType, isGuest, isDowngrade, t]);

  const isReady = isYoukassaPaymentReady && !isWorking;

  // Determine the appropriate message based on comparison result
  const subscriptionMessage = React.useMemo(() => {
    if (isGuest) {
      return t('PricingChoosePage.GuestNotAllowed');
    } else if (isDowngrade) {
      return t.rich('PricingChoosePage.ContactSupportForDowngrade', {
        ContactsLink: (chunks) => <Link href={contactsAliasRoute}>{chunks}</Link>,
        strong: (chunks) => <strong>{chunks}</strong>,
        currentGrade: comparisonResult?.currentGrade,
        requestedGrade: comparisonResult?.requestedGrade,
      });
    } else if (isUpgrade) {
      return t.rich('PricingChoosePage.UpgradeMessage', {
        strong: (chunks) => <strong>{chunks}</strong>,
        currentGrade: comparisonResult?.currentGrade,
        requestedGrade: comparisonResult?.requestedGrade,
      });
    } else if (isSame) {
      return t('PricingChoosePage.SameGradeMessage', {
        currentGrade: comparisonResult?.currentGrade,
      });
    } else {
      return t('PricingChoosePage.CompleteSubscription', { planName: grade });
    }
  }, [
    comparisonResult?.currentGrade,
    comparisonResult?.requestedGrade,
    grade,
    isDowngrade,
    isGuest,
    isSame,
    isUpgrade,
    t,
  ]);

  // Determine the appropriate payment message based on comparison result
  const paymentMessage = React.useMemo(() => {
    if (isDowngrade) {
      return t.rich('PricingChoosePage.ContactSupportForDowngrade', {
        ContactsLink: (chunks) => <Link href={contactsAliasRoute}>{chunks}</Link>,
      });
    } else {
      return t('PricingChoosePage.YoureToPay');
    }
  }, [isDowngrade, t]);

  // Calculate price difference for upgrades
  const upgradePriceInfo = React.useMemo(() => {
    if (!comparisonResult || !isUpgrade || !isPricesQueryReady || !prices) {
      return t('PricingChoosePage.UpgradePriceInfo');
    }

    // If we have the price difference passed from the server component, use it
    if (upgradePriceDifference !== undefined) {
      return t('PricingChoosePage.UpgradePriceInfoWithDifference', {
        priceDifference: `${localeCurrency} ${stringifyPrice(upgradePriceDifference)}`,
      });
    }

    // Otherwise, return the default translation
    return t('PricingChoosePage.UpgradePriceInfo');
  }, [
    comparisonResult,
    isUpgrade,
    isPricesQueryReady,
    prices,
    upgradePriceDifference,
    t,
    localeCurrency,
  ]);

  return (
    <main
      className={cn(
        isDev && '__PricingChoosePage', // DEBUG
        'flex w-full max-w-6xl flex-col px-6 pb-6',
        'transition',
        !isReady && 'pointer-events-none opacity-50',
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
        <p
          className={cn(
            isDev && '__PricingChoosePage_subscriptionMessage', // DEBUG
            'text-content',
          )}
        >
          {subscriptionMessage}
        </p>
        {isSame && (
          <div className="mt-4">
            <Button variant="theme">
              <Link href={pricingAliasRoute} className="inline-flex items-center gap-2">
                {t('PricingChoosePage.CheckAvailableSubscriptionPlans')}
              </Link>
            </Button>
          </div>
        )}
        {!isSame && !isDowngrade && (
          <div
            className={cn(
              isDev && '__PricingChoosePage_PriceInfo', // DEBUG
              'mt-4 flex flex-col items-center',
            )}
          >
            <div className="flex flex-wrap items-baseline gap-1">
              <span
                className={cn(
                  isDev && '__PricingChoosePage_paymentMessage', // DEBUG
                  'text-content h-9',
                )}
              >
                {paymentMessage}:
              </span>
              {isDowngrade ? (
                <span className="text-muted-foreground">
                  {t('PricingChoosePage.DowngradeRequiresSupport')}
                </span>
              ) : isPricesQueryReady ? (
                <>
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
                  <span className="h-9 text-sm">
                    /{period === 'YEAR' ? t('Pricing.billedAnnually') : t('Pricing.billedMonthly')}
                  </span>
                </>
              ) : (
                <Skeleton className="h-7 w-28 max-w-full rounded" />
              )}
            </div>
            {isUpgrade && isPricesQueryReady && (
              <div className="mt-2 text-sm text-muted-foreground">{upgradePriceInfo}</div>
            )}
          </div>
        )}
      </div>

      {!isSame && (
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
            buttonText={
              isDowngrade
                ? t('PricingChoosePage.ContactSupport')
                : t('PricingChoosePage.PayWithRussianCard')
            }
            onClick={handleRussianCard}
            disabled={isDowngrade}
          />

          {/* International Card */}
          <PricingChoosePaymentMethodCard
            title={t('PricingChoosePage.InternationalCard')}
            icon={Icons.Globe}
            description={t('PricingChoosePage.InternationalCardDescription')}
            buttonText={
              isDowngrade
                ? t('PricingChoosePage.ContactSupport')
                : t('PricingChoosePage.PayWithInternationalCard')
            }
            onClick={handleInternationalCard}
            disabled={isDowngrade}
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
            buttonText={
              isDowngrade
                ? t('PricingChoosePage.ContactSupport')
                : t('PricingChoosePage.OpenTelegramBot', { botUsername: BOT_USERNAME })
            }
            link={isDowngrade ? '#' : telegramUrl}
            isLink={!isDowngrade}
            // disabled={isDowngrade}
          />
        </div>
      )}

      <div className="mt-12 flex flex-col items-center text-center">
        <p className="text-content text-muted-foreground">
          {t.rich('PricingChoosePage.OtherOptionsText', {
            PricingLink: (chunks) => <Link href={pricingAliasRoute}>{chunks}</Link>,
            ContactsLink: (chunks) => <Link href={contactsAliasRoute}>{chunks}</Link>,
          })}
        </p>
      </div>
    </main>
  );
}
