import React from 'react';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import {
  UserGradeType,
  UserPaymentProviderSchema,
  UserPaymentProviderType,
  UserSubscriptionPeriodType,
} from '@/generated/prisma';

import { contactsAliasRoute, pricingAliasRoute } from '@/config/routesConfig';
import { constructMetadata } from '@/lib/constructMetadata';
import { prisma } from '@/lib/db';
import { ErrorLike } from '@/lib/errors';
import { getErrorText, getRandomHashString } from '@/lib/helpers';
import { getCurrentUser } from '@/lib/session';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageError } from '@/components/shared';
import { isDev } from '@/config';
import { checkPayment, cleanStaleUserPayments, findUserPayment } from '@/features/payments';
import {
  ensurePaidableSubscriptionType,
  parsePaidableSubscriptionType,
  TPaidableSubscriptionType,
} from '@/features/subscriptions';
import { getT, Link, TAwaitedLocaleProps } from '@/i18n';

import { PricingChooseSuccessContent } from './PricingChooseSuccessContent';

type TAwaitedProps = TAwaitedLocaleProps<{
  subscriptionType: TPaidableSubscriptionType;
  successKey: string;
}>;

export async function generateMetadata({ params }: TAwaitedProps) {
  const { locale } = await params;
  const t = await getT({ locale });
  return constructMetadata({
    locale,
    title: t(`Pages.PricingChooseSuccess`),
  });
}

interface TAwaitedSearchParams {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const saveScrollHash = getRandomHashString();

interface TUpdateUserGradeParams {
  grade: UserGradeType;
  period: UserSubscriptionPeriodType;
  userId: string;
  provider: UserPaymentProviderType;
  paymentId: string;
  uniqueKey: string;
  subscriptionStartedAt?: Date;
}

async function finishPaymentAndUpdateUserGrade(params: TUpdateUserGradeParams) {
  const {
    grade,
    period,
    subscriptionStartedAt = new Date(),
    userId,
    provider,
    paymentId,
    uniqueKey,
  } = params;
  return await prisma.$transaction(async (tx) => {
    // Update user payment status (analog of updateUserPayment)
    await tx.userPayment.update({
      where: {
        userId_provider_paymentId_uniqueKey: {
          userId,
          provider,
          paymentId,
          uniqueKey,
        },
      },
      data: { status: 'SUCCEED' },
    });
    // Update user grade (analog of updateCurrentUser)
    await tx.user.update({
      where: { id: userId },
      data: {
        grade,
        subscriptionPeriod: period,
        // TODO: Add checking of the valid subscription period to the grade check
        subscriptionStartedAt,
      },
    });
  });
}

export async function PricingChooseSuccessRoute({
  params: awaitedParams,
  // searchParams: awaitedSearchParams,
}: TAwaitedProps & TAwaitedSearchParams) {
  // Success: set user state and update the grade in a transaction
  const user = await getCurrentUser();
  const userId = user?.id;
  if (!userId) {
    redirect(pricingAliasRoute);
    // throw new Error('Authentication required');
  }

  const params = await awaitedParams;
  const { locale, subscriptionType: rawSubscriptionType, successKey } = params;
  // const searchParams = await awaitedSearchParams;

  setRequestLocale(locale);
  const t = await getT({ locale });

  const [rawProvider, uniqueKey] = successKey.split('-');

  const providerParseResult = UserPaymentProviderSchema.safeParse(rawProvider.toUpperCase());
  if (!providerParseResult.success) {
    const message = t('PricingChooseSuccessRoute.InvalidPaymentProvider', {
      provider: rawProvider,
    });
    const error = new Error(message);
    // eslint-disable-next-line no-console
    console.error('[PricingChooseSuccessRoute]', message, providerParseResult.error);
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
    const message = t('PricingChooseSuccessRoute.PaymentNotFound', { key: successKey });
    const error = new Error(message);
    // eslint-disable-next-line no-console
    console.error('[PricingChooseSuccessRoute]', message, {
      provider,
      uniqueKey,
      successKey,
    });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }

  const { paymentId, status } = userPayment;

  if (status === 'FAILED') {
    const message = t('PricingChooseSuccessRoute.PaymentFailedMessage');
    // eslint-disable-next-line no-console
    console.error('[PricingChooseSuccessRoute]', message, {
      userPayment,
      user,
    });
    // debugger; // eslint-disable-line no-debugger
    return (
      <PageError
        title={message}
        explanation={t.rich('PricingChooseSuccessRoute.FailedPaymentExplanation', {
          p: (chunks) => <>{chunks}</>,
          Link: (chunks) => <Link href={contactsAliasRoute}>{chunks}</Link>,
        })}
        explanationClassName="text-content"
      />
    );
  }
  if (status === 'SUCCEED' && !isDev) {
    const message = t('PricingChooseSuccessRoute.PaymentAlreadyProcessed');
    // eslint-disable-next-line no-console
    console.error('[PricingChooseSuccessRoute]', message, {
      userPayment,
      user,
    });
    // debugger; // eslint-disable-line no-debugger
    return (
      <PageError
        title={message}
        explanation={t.rich('PricingChooseSuccessRoute.SucceedPaymentAttemptExplanation', {
          p: (chunks) => <>{chunks}</>,
          Link: (chunks) => <Link href={contactsAliasRoute}>{chunks}</Link>,
        })}
        explanationClassName="text-content"
      />
    );
  }
  if (subscriptionType !== userPayment.subscriptionType) {
    const message = t('PricingChooseSuccessRoute.SubscriptionTypesMismatch');
    // eslint-disable-next-line no-console
    console.error('[PricingChooseSuccessRoute]', message, {
      userPayment,
      subscriptionType,
      user,
    });
    // debugger; // eslint-disable-line no-debugger
    return (
      <PageError
        title={message}
        explanation={t.rich('PricingChooseSuccessRoute.SubscriptionTypesMismatchExplanation', {
          expected: userPayment.subscriptionType,
          received: subscriptionType,
          strong: (chunks) => <strong>{chunks}</strong>,
        })}
        explanationClassName="text-content"
      />
    );
  }

  // Parse grade and period with Zod schemas
  const { grade, period } = parsePaidableSubscriptionType(subscriptionType, t);

  // Update data if that hasn't been done yet
  if (status === 'PENDING' || user.grade !== grade) {
    try {
      const checkResult = await checkPayment({ provider, paymentId, uniqueKey });
      const { isPaid } = checkResult;
      if (!isPaid) {
        throw new Error('The payment was not paid');
      }
      await finishPaymentAndUpdateUserGrade({
        grade,
        period,
        userId,
        provider,
        paymentId,
        uniqueKey,
      });
      // Clean up payments
      await cleanStaleUserPayments();
    } catch (error) {
      const message = t('PricingChooseSuccessRoute.ErrorFinishingPayment');
      const details = getErrorText(error);
      const comboMsg = [message, details].filter(Boolean).join(': ');
      // eslint-disable-next-line no-console
      console.error('[PricingChooseSuccessRoute]', comboMsg, {
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
          explanation={t.rich('PricingChooseSuccessRoute.CannotUpdateUserDataExplanation', {
            Link: (chunks) => <Link href={contactsAliasRoute}>{chunks}</Link>,
          })}
        />
      );
    }
  }

  return (
    <PageWrapper
      className={cn(
        isDev && '__PricingChooseSuccessRoute', // DEBUG
      )}
      innerClassName={cn(
        isDev && '__PricingChooseSuccessRoute_Inner', // DEBUG
        'size-full',
      )}
    >
      <ScrollArea
        saveScrollKey="PricingChooseSuccessRoute"
        saveScrollHash={saveScrollHash}
        className={cn(
          isDev && '__PricingChooseSuccessRoute_Scroll', // DEBUG
          'flex flex-1 flex-col overflow-hidden',
          'bg-theme-500/5',
        )}
        viewportClassName={cn(
          isDev && '__PricingChooseSuccessRoute_ScrollViewport', // DEBUG
          'flex flex-1 flex-col',
          'bg-decorative-gradient',
          '[&>div]:flex-col [&>div]:flex-1 [&>div]:justify-center [&>div]:items-center',
        )}
      >
        <PricingChooseSuccessContent subscriptionType={subscriptionType} />
      </ScrollArea>
    </PageWrapper>
  );
}
