'use client';

import React from 'react';
import { RichTranslationValues } from 'next-intl';
import { toast } from 'sonner';

import { getErrorText } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Link, TLocale, useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import * as Icons from '@/components/shared/Icons';
import { contactsAliasRoute, isDev, pricingAliasRoute, tgUrlPrefix } from '@/config';
import { useEnvContext } from '@/contexts/EnvContext';
import { TCurrencyPrices, TCurrencyType } from '@/features/currencies';
import { TGradeComparisonResult } from '@/features/payments/helpers';
import { useStripePayment, useYookassaPayment } from '@/features/payments/hooks';
import { parsePaidableSubscriptionType, TPaidableSubscriptionType } from '@/features/subscriptions';

import { PriceText } from './PriceText';
import { PricingChoosePaymentMethodCard } from './PricingChoosePaymentMethodCard';

interface PricingChoosePageProps {
  subscriptionType: TPaidableSubscriptionType;
  comparisonResult?: TGradeComparisonResult;
  locale: TLocale;
  prices: TCurrencyPrices;
}

type TPaymentResult = { paymentUrl?: string };

export function PricingChoosePage(props: PricingChoosePageProps) {
  const {
    subscriptionType,
    comparisonResult,
    // locale,
    prices,
  } = props;
  const t = useT();
  const { grade, period } = parsePaidableSubscriptionType(subscriptionType, t);
  // const localeCurrency = localeCurrencies[locale];

  // const CurrencySign = CurrencySigns[localeCurrency];
  // const TgStarSign = CurrencySigns.TGSTAR;
  const { BOT_USERNAME } = useEnvContext();

  const [isWorking, startWorking] = React.useTransition();

  // const localePrice = prices?.[localeCurrency];
  // const tgPrice = prices?.TGSTAR;

  const telegramUrl = `${tgUrlPrefix}/${BOT_USERNAME}`;

  const stripePayment = useStripePayment({ subscriptionType });
  const { isReady: isStripePaymentReady, runStartStripeCheckout } = stripePayment;

  const yookassaPayment = useYookassaPayment({ subscriptionType });
  const { isReady: isYookassaPaymentReady, startYookassaPayment } = yookassaPayment;

  // Handle different comparison scenarios
  const isSame = comparisonResult?.type === 'same';
  const isGuest = comparisonResult?.type === 'guest';
  const isDowngrade = comparisonResult?.type === 'downgrade';
  const isUpgrade = comparisonResult?.type === 'upgrade';

  const richProps = React.useMemo<RichTranslationValues>(
    () => ({
      PricingLink: (chunks) => <Link href={pricingAliasRoute}>{chunks}</Link>,
      ContactsLink: (chunks) => <Link href={contactsAliasRoute}>{chunks}</Link>,
      strong: (chunks) => <strong>{chunks}</strong>,
      currentGrade: comparisonResult?.currentGrade,
      requestedGrade: comparisonResult?.requestedGrade,
      period,
    }),
    [comparisonResult, period],
  );

  const ensureValidConditions = React.useCallback(() => {
    // Guest users should authorize in order to be able to make payments
    if (isGuest) {
      // Should not reach here as guest users are redirected at server level
      throw new Error(t('PricingChoosePage.GuestNotAllowed'));
    }
    if (isDowngrade) {
      // Show warning about downgrade and suggest contacting support
      throw new Error(t('PricingChoosePage.DowngradeWarning'));
      // In a real scenario, we might want to redirect to contact support
      // For now, we'll just show the warning
    }
  }, [isDowngrade, isGuest, t]);

  const handlePayment = React.useCallback(
    (startPayment: () => Promise<TPaymentResult>) => {
      startWorking(async () => {
        ensureValidConditions();
        try {
          const promise = startPayment();
          toast.promise(promise, {
            loading: t('PricingChoosePage.PaymentIsCreating'),
            success: t('PricingChoosePage.PaymentCreated'),
            // error: 'Payment starting error',
          });
          const result = await promise;
          const { paymentUrl } = result;
          if (!paymentUrl) {
            throw new Error(t('PricingChoosePage.NoPaymentUrlProvided'));
          }
          if (typeof window === 'object') {
            window.location.href = paymentUrl;
          }
        } catch (error) {
          const message = t('PricingChoosePage.PaymentCreatingError');
          const details = getErrorText(error);
          const comboMsg = [message, details].filter(Boolean).join(': ');
          // eslint-disable-next-line no-console
          console.error('[PricingChoosePage:handlePayment]', comboMsg, {
            error,
          });
          debugger; // eslint-disable-line no-debugger
          // TODO: Use error in the toast.promise, without details
          toast.error(comboMsg);
        }
      });
    },
    [ensureValidConditions, t],
  );

  const handleRussianCard = React.useCallback(() => {
    handlePayment(startYookassaPayment);
  }, [handlePayment, startYookassaPayment]);

  const handleInternationalCard = React.useCallback(() => {
    handlePayment(runStartStripeCheckout);
  }, [handlePayment, runStartStripeCheckout]);

  const isReady = isYookassaPaymentReady && isStripePaymentReady && !isWorking;

  // Determine the appropriate message based on comparison result
  const subscriptionMessage = React.useMemo(() => {
    if (isGuest) {
      return t('PricingChoosePage.GuestNotAllowed');
    } else if (isDowngrade) {
      return t.rich('PricingChoosePage.ContactSupportForDowngrade', richProps);
    } else if (isUpgrade) {
      return t.rich('PricingChoosePage.UpgradeMessage', richProps);
    } else if (isSame) {
      return null;
      /* // NOTE: This message already displayed in the title
       * return t('PricingChoosePage.SameGradeMessage', {
       *   currentGrade: comparisonResult?.currentGrade,
       * });
       */
    } else {
      return t.rich('PricingChoosePage.CompleteSubscription', {
        ...richProps,
        planName: grade,
        period,
      });
    }
  }, [richProps, grade, period, isDowngrade, isGuest, isSame, isUpgrade, t]);

  /* // Determine the appropriate payment message based on comparison result
   * const paymentMessage = React.useMemo(() => {
   *   if (isDowngrade) {
   *     return t.rich('PricingChoosePage.ContactSupportForDowngrade', richProps);
   *   } else {
   *     return t('PricingChoosePage.YoureToPay');
   *   }
   * }, [isDowngrade, richProps, t]);
   */

  const PriceTextForCurrency = React.useCallback(
    ({ localeCurrency, className }: { localeCurrency: TCurrencyType; className?: string }) => (
      <PriceText
        className={cn(
          isDev && '__PricingChoosePage_PriceTextForCurrency', // DEBUG
          className,
        )}
        comparisonResult={comparisonResult}
        prices={prices}
        localeCurrency={localeCurrency}
      />
    ),
    [comparisonResult, prices],
  );

  const buttonTextClass =
    'leading-5 flex flex-wrap gap-x-1 justify-center content-truncate text-center';

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
            'text-2xl md:text-4xl lg:text-5xl',
            'text-balance leading-tight tracking-tight',
            'text-gradient-brand content-truncate font-semibold',
            'mb-6 mt-12 p-4',
          )}
        >
          {isSame
            ? t('PricingChoosePage.SameGradeMessage', {
                currentGrade: comparisonResult?.currentGrade,
              })
            : t('PricingChoosePage.ChoosePaymentMethod')}
        </h1>
        <p
          className={cn(
            isDev && '__PricingChoosePage_subscriptionMessage', // DEBUG
            'content-text content-truncate',
          )}
        >
          {subscriptionMessage}
        </p>
        {isSame && (
          <div className="mt-4">
            <Button variant="theme">
              <Link href={pricingAliasRoute} className="inline-flex items-center gap-2">
                <span className="truncate">
                  {t('PricingChoosePage.CheckAvailableSubscriptionPlans')}
                </span>
              </Link>
            </Button>
          </div>
        )}
        {!isSame && !isDowngrade && (
          <div
            className={cn(
              isDev && '__PricingChoosePage_PriceInfo', // DEBUG
              'content-truncate mt-4 flex flex-col items-center',
            )}
          >
            {/*
            // DEMO
            <PriceTextForCurrency localeCurrency="RUB" />
            <PriceTextForCurrency localeCurrency="USD" />
            <PriceTextForCurrency localeCurrency="TGSTAR" />
            // OLD WAY: Displaying single price for all methods (may be confused due to varios multipliers from `src/constants/prices.ts`
            <div className="content-truncate flex flex-wrap items-baseline gap-2">
              <span
                className={cn(
                  isDev && '__PricingChoosePage_paymentMessage', // DEBUG
                  'content-text content-truncate h-9',
                )}
              >
                {paymentMessage}:
              </span>
              {isDowngrade ? (
                <span className="text-muted-foreground">
                  {t('PricingChoosePage.DowngradeRequiresSupport')}
                </span>
              ) : (
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
                  {!isUpgrade && (
                    <span className="h-9 text-sm">
                      /
                      {period === 'YEAR' ? t('Pricing.billedAnnually') : t('Pricing.billedMonthly')}
                    </span>
                  )}
                </>
              )}
            </div>
            */}
            {isUpgrade && (
              <div className="content-truncate mt-2 w-full text-sm text-muted-foreground">
                {t('PricingChoosePage.UpgradePriceInfo')}
              </div>
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
              <span className={buttonTextClass}>
                {isDowngrade
                  ? t('PricingChoosePage.ContactSupport')
                  : t.rich('PricingChoosePage.PayWithRussianCard', {
                      PriceText: () => <PriceTextForCurrency localeCurrency="RUB" />,
                      span: (chunks) => <span className="xxx">{chunks}</span>,
                    })}
              </span>
            }
            onClick={handleRussianCard}
            // disabled={isDowngrade}
          />

          {/* International Card */}
          <PricingChoosePaymentMethodCard
            title={t('PricingChoosePage.InternationalCard')}
            icon={Icons.Globe}
            description={t('PricingChoosePage.InternationalCardDescription')}
            buttonText={
              <span className={buttonTextClass}>
                {isDowngrade
                  ? t('PricingChoosePage.ContactSupport')
                  : t.rich('PricingChoosePage.PayWithInternationalCard', {
                      PriceText: () => <PriceTextForCurrency localeCurrency="USD" />,
                      EURPriceText: () => <PriceTextForCurrency localeCurrency="EUR" />,
                      // span: (chunks) => <span className="xxx">{chunks}</span>,
                      nobr: (chunks) => (
                        <span className="flex truncate whitespace-nowrap">{chunks}</span>
                      ),
                    })}
              </span>
            }
            onClick={handleInternationalCard}
            // disabled={isDowngrade}
          />

          {/* Telegram Stars */}
          <PricingChoosePaymentMethodCard
            disabled
            className="md:col-span-2 2xl:md:col-span-1"
            title={t('PricingChoosePage.TelegramStars')}
            icon={Icons.Telegram}
            description={
              <>
                <p className="content-truncate">
                  {t('PricingChoosePage.TelegramStarsOptionAvailable')}
                </p>
                <p className="content-truncate text-sm opacity-50">
                  {t('PricingChoosePage.TelegramStarsCompletePayment')}
                </p>
              </>
            }
            buttonText={
              <span className={buttonTextClass}>
                {isDowngrade
                  ? t('PricingChoosePage.ContactSupport')
                  : t.rich('PricingChoosePage.OpenTelegramBot', {
                      botUsername: BOT_USERNAME,
                      PriceText: () => <PriceTextForCurrency localeCurrency="TGSTAR" />,
                      // span: (chunks) => <span className="xxx">{chunks}</span>,
                    })}
              </span>
            }
            link={isDowngrade ? '#' : telegramUrl}
            isLink={!isDowngrade}
            // disabled={isDowngrade}
          />
        </div>
      )}

      <div className="mt-12 flex flex-col items-center text-center">
        <p className="content-text content-truncate w-full">
          {t.rich('PricingChoosePage.OtherOptionsText', richProps)}
        </p>
      </div>
    </main>
  );
}
