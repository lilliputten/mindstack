import React from 'react';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { UserPaymentProviderSchema, UserPaymentProviderType } from '@/generated/prisma';

import { contactsAliasRoute, pricingAliasRoute } from '@/config/routesConfig';
import { constructMetadata } from '@/lib/constructMetadata';
import { ErrorLike } from '@/lib/errors';
import { getErrorText, getRandomHashString } from '@/lib/helpers';
import { getCurrentUser } from '@/lib/session';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageError } from '@/components/shared';
import { isDev } from '@/config';
import { cleanStaleUserPayments, findUserPayment, updateUserPayment } from '@/features/payments';
import {
  ensurePaidableSubscriptionType,
  TPaidableSubscriptionType,
} from '@/features/subscriptions';
import { getT, Link, TAwaitedLocaleProps } from '@/i18n';

import { PricingChooseCancelContent } from './PricingChooseCancelContent';

type TAwaitedProps = TAwaitedLocaleProps<{
  subscriptionType: TPaidableSubscriptionType;
  cancelKey: string;
}>;

export async function generateMetadata({ params }: TAwaitedProps) {
  const { locale } = await params;
  const t = await getT({ locale });
  return constructMetadata({
    locale,
    title: t(`Pages.PricingChooseCancel`),
  });
}

interface TAwaitedSearchParams {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const saveScrollHash = getRandomHashString();

export async function PricingChooseCancelRoute({
  params: awaitedParams,
  // searchParams: awaitedSearchParams,
}: TAwaitedProps & TAwaitedSearchParams) {
  // Cancel: set user state and update the grade in a transaction
  const user = await getCurrentUser();
  const userId = user?.id;
  if (!userId) {
    redirect(pricingAliasRoute);
    // throw new Error('Authentication required');
  }

  const params = await awaitedParams;
  const { locale, subscriptionType: rawSubscriptionType, cancelKey } = params;
  // const searchParams = await awaitedSearchParams;

  setRequestLocale(locale);
  const t = await getT({ locale });

  const [rawProvider, uniqueKey] = cancelKey.split('-');

  const providerParseResult = UserPaymentProviderSchema.safeParse(rawProvider.toUpperCase());
  if (!providerParseResult.success) {
    const message = t('PricingChooseCancelRoute.InvalidPaymentProvider', {
      provider: rawProvider,
    });
    const error = new Error(message);
    // eslint-disable-next-line no-console
    console.error('[PricingChooseCancelRoute]', message, providerParseResult.error);
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
  const provider: UserPaymentProviderType = providerParseResult.data;

  const subscriptionType: TPaidableSubscriptionType = ensurePaidableSubscriptionType(
    rawSubscriptionType,
    t,
  );

  const userPayment = await findUserPayment({ provider, uniqueKey });
  if (!userPayment) {
    const message = t('PricingChooseCancelRoute.PaymentNotFound', { key: cancelKey });
    const error = new Error(message);
    // eslint-disable-next-line no-console
    console.error('[PricingChooseCancelRoute]', message, {
      provider,
      uniqueKey,
      cancelKey,
    });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }

  const { paymentId, status } = userPayment;

  if (status !== 'PENDING') {
    const message = t('PricingChooseCancelRoute.CannotCancelNotPendingPayment');
    // eslint-disable-next-line no-console
    console.error('[PricingChooseCancelRoute]', message, {
      userPayment,
      user,
    });
    // debugger; // eslint-disable-line no-debugger
    return (
      <PageError
        title={message}
        explanation={t.rich('PricingChooseCancelRoute.FailedPaymentExplanation', {
          p: (chunks) => <>{chunks}</>,
          Link: (chunks) => <Link href={contactsAliasRoute}>{chunks}</Link>,
        })}
        explanationClassName="text-content"
      />
    );
  }
  if (subscriptionType !== userPayment.subscriptionType) {
    const message = t('PricingChooseCancelRoute.SubscriptionTypesMismatch');
    // eslint-disable-next-line no-console
    console.error('[PricingChooseCancelRoute]', message, {
      userPayment,
      subscriptionType,
      user,
    });
    // debugger; // eslint-disable-line no-debugger
    return (
      <PageError
        title={message}
        explanation={t.rich('PricingChooseCancelRoute.SubscriptionTypesMismatchExplanation', {
          expected: userPayment.subscriptionType,
          received: subscriptionType,
          strong: (chunks) => <strong>{chunks}</strong>,
        })}
        explanationClassName="text-content"
      />
    );
  }

  // Mark PENING payment as FAILED
  if (status === 'PENDING') {
    try {
      await updateUserPayment({
        provider,
        paymentId,
        uniqueKey,
        updates: { status: 'CANCELED' },
      });
      // Clean up payments
      await cleanStaleUserPayments();
    } catch (error) {
      const message = t('PricingChooseCancelRoute.ErrorCancelingPayment');
      const details = getErrorText(error);
      const comboMsg = [message, details].filter(Boolean).join(': ');
      // eslint-disable-next-line no-console
      console.error('[PricingChooseCancelRoute]', comboMsg, {
        error,
        provider,
        paymentId,
        uniqueKey,
        user,
        userPayment,
        subscriptionType,
      });
      debugger; // eslint-disable-line no-debugger
      return (
        <PageError
          title={message}
          error={error as ErrorLike}
          explanation={t.rich('PricingChooseCancelRoute.CannotUpdateUserDataExplanation', {
            Link: (chunks) => <Link href={contactsAliasRoute}>{chunks}</Link>,
          })}
        />
      );
    }
  }

  return (
    <PageWrapper
      className={cn(
        isDev && '__PricingChooseCancelRoute', // DEBUG
      )}
      innerClassName={cn(
        isDev && '__PricingChooseCancelRoute_Inner', // DEBUG
        'size-full',
      )}
    >
      <ScrollArea
        saveScrollKey="PricingChooseCancelRoute"
        saveScrollHash={saveScrollHash}
        className={cn(
          isDev && '__PricingChooseCancelRoute_Scroll', // DEBUG
          'flex flex-1 flex-col overflow-hidden',
          'bg-theme-500/5',
        )}
        viewportClassName={cn(
          isDev && '__PricingChooseCancelRoute_ScrollViewport', // DEBUG
          'flex flex-1 flex-col',
          'bg-decorative-gradient',
          '[&>div]:flex-col [&>div]:flex-1 [&>div]:justify-center [&>div]:items-center',
        )}
      >
        <PricingChooseCancelContent />
      </ScrollArea>
    </PageWrapper>
  );
}
