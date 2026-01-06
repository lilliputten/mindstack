'use client';

import React from 'react';
import { toast } from 'sonner';

import { getErrorText } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { CurrencySigns } from '@/components/currencies';
import * as Icons from '@/components/shared/Icons';
import { contactsAliasRoute, isDev, pricingAliasRoute, tgUrlPrefix } from '@/config';
import { useEnvConext } from '@/contexts/EnvContext';
import { localeCurrencies, stringifyPrice, TCurrencyPrices } from '@/features/currencies';
import { TGradeComparisonResult } from '@/features/payments/helpers';
import { useYookassaPayment } from '@/features/payments/hooks';
import { parsePaidableSubscriptionType, TPaidableSubscriptionType } from '@/features/subscriptions';
import { Link, TLocale, useT } from '@/i18n';

import { PricingChoosePaymentMethodCard } from './PricingChoosePaymentMethodCard';

interface PricingChoosePageProps {
  subscriptionType: TPaidableSubscriptionType;
  comparisonResult?: TGradeComparisonResult;
  locale: TLocale;
  prices: TCurrencyPrices;
}

export function PricingChoosePage({
  subscriptionType,
  comparisonResult,
  locale,
  prices,
}: PricingChoosePageProps) {
  const t = useT();
  const { grade, period } = parsePaidableSubscriptionType(subscriptionType, t);
  const localeCurrency = localeCurrencies[locale];

  const CurrencySign = CurrencySigns[localeCurrency];
  const TgStarSign = CurrencySigns.TGSTAR;
  const { BOT_USERNAME } = useEnvConext();

  const [isWorking, startWorking] = React.useTransition();

  const localePrice = prices?.[localeCurrency];
  const tgPrice = prices?.TGSTAR;

  const telegramUrl = `${tgUrlPrefix}/${BOT_USERNAME}`;

  const yookassaPayment = useYookassaPayment({ subscriptionType });
  const { isReady: isYoukassaPaymentReady, startYoukassaPayment } = yookassaPayment;

  // Handle different comparison scenarios
  const isSame = comparisonResult?.type === 'same';
  const isGuest = comparisonResult?.type === 'guest';
  const isDowngrade = comparisonResult?.type === 'downgrade';
  const isUpgrade = comparisonResult?.type === 'upgrade';

  /* // DEBUG: Effect:comparisonResult
   * React.useEffect(() => {
   *   console.log('[PricingChoosePage] Effect:comparisonResult', {
   *     isGuest,
   *     isDowngrade,
   *     isUpgrade,
   *     comparisonResult,
   *     prices,
   *   });
   * }, [
   *   ///
   *   comparisonResult,
   *   isDowngrade,
   *   isGuest,
   *   isUpgrade,
   *   prices,
   * ]);
   */

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

  const handleRussianCard = React.useCallback(() => {
    startWorking(async () => {
      ensureValidConditions();
      try {
        const promise = startYoukassaPayment();
        toast.promise(promise, {
          loading: t('PricingChoosePage.PaymentIsCreating'),
          success: t('PricingChoosePage.PaymentCreated'),
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
          throw new Error(t('PricingChoosePage.NoPaymentUrlProvided'));
        }
        if (typeof window === 'object') {
          window.location.href = paymentUrl;
        }
      } catch (error) {
        const message = t('UseYookassaPayment.PaymentCreatingError');
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
  }, [ensureValidConditions, startYoukassaPayment, t]);

  const handleInternationalCard = React.useCallback(() => {
    ensureValidConditions();
    // TODO
    // eslint-disable-next-line no-console
    console.log('[PricingChoosePage:handleInternationalCard]', subscriptionType);
    // eslint-disable-next-line no-debugger
    debugger;
  }, [ensureValidConditions, subscriptionType]);

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
            'text-gradient-brand text-truncate font-semibold',
            'mb-6 mt-12 p-4',
          )}
        >
          {t('PricingChoosePage.ChoosePaymentMethod')}
        </h1>
        <p
          className={cn(
            isDev && '__PricingChoosePage_subscriptionMessage', // DEBUG
            'text-content text-truncate',
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
              'text-truncate mt-4 flex flex-col items-center',
            )}
          >
            <div className="text-truncate flex flex-wrap items-baseline gap-1">
              <span
                className={cn(
                  isDev && '__PricingChoosePage_paymentMessage', // DEBUG
                  'text-content text-truncate h-9',
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
            {isUpgrade && (
              <div className="text-truncate mt-2 w-full text-sm text-muted-foreground">
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
                <p className="text-truncate">
                  {t('PricingChoosePage.TelegramStarsOptionAvailable')}
                </p>
                <p className="text-truncate text-sm opacity-50">
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
        <p className="text-content text-truncate w-full">
          {t.rich('PricingChoosePage.OtherOptionsText', {
            PricingLink: (chunks) => <Link href={pricingAliasRoute}>{chunks}</Link>,
            ContactsLink: (chunks) => <Link href={contactsAliasRoute}>{chunks}</Link>,
          })}
        </p>
      </div>
    </main>
  );
}
