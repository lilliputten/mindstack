import React from 'react';
import { redirect } from 'next/navigation';

import {
  UserGradeType,
  UserPaymentProviderSchema,
  UserPaymentProviderType,
} from '@/generated/prisma';

import { contactsAliasRoute, pricingAliasRoute } from '@/config/routesConfig';
import { constructMetadata } from '@/lib/constructMetadata';
import { prisma } from '@/lib/db';
import { ErrorLike } from '@/lib/errors';
import { getErrorText, getRandomHashString } from '@/lib/helpers';
import { getCurrentUser, isLoggedUser } from '@/lib/session';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageError } from '@/components/shared';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';
import { findUserPayment } from '@/features/payments';
import {
  ensurePaidableSubscriptionType,
  parsePaidableSubscriptionType,
  TPaidableSubscriptionType,
} from '@/features/subscriptions';
import { getT, Link, TAwaitedLocaleProps } from '@/i18n';

// // TODO: Create page content (or use redirect)
// import { PricingChooseSuccessContent } from './PricingChooseSuccessContent';

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
  userId: string;
  provider: UserPaymentProviderType;
  paymentId: string;
  uniqueKey: string;
}
async function finishPaymentAndUpdateUserGrade(params: TUpdateUserGradeParams) {
  const { grade, userId, provider, paymentId, uniqueKey } = params;
  // throw new Error('Test error');
  return await prisma.$transaction(async (tx) => {
    // Update user payment status
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
    // Update user grade
    await tx.user.update({
      where: { id: userId },
      data: { grade },
    });
  });
}

export async function PricingChooseSuccessRoute({
  params: awaitedParams,
  searchParams: awaitedSearchParams,
}: TAwaitedProps & TAwaitedSearchParams) {
  // Success: set user state and update the grade in a transaction
  const user = await getCurrentUser();
  const userId = user?.id;
  if (!userId) {
    redirect(pricingAliasRoute);
    // throw new Error('Authentication required');
  }

  const params = await awaitedParams;
  const { subscriptionType: rawSubscriptionType, successKey } = params;
  const searchParams = await awaitedSearchParams;

  const [rawProvider, uniqueKey] = successKey.split('-');

  const providerParseResult = UserPaymentProviderSchema.safeParse(rawProvider.toUpperCase());
  if (!providerParseResult.success) {
    const message = `Invalid payment provider: ${rawProvider}`;
    const error = new Error(message);
    // eslint-disable-next-line no-console
    console.error('[PricingChooseSuccessRoute]', message, providerParseResult.error);
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
  const provider: UserPaymentProviderType = providerParseResult.data;

  const subscriptionType: TPaidableSubscriptionType =
    ensurePaidableSubscriptionType(rawSubscriptionType);

  const userPayment = await findUserPayment({ provider, uniqueKey });
  if (!userPayment) {
    const message = `Not found user payment for the key: ${successKey}`;
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

  // Check payment parameters...
  /* // SUCCEED: Do nothing, payment already processed
   * if (status === 'SUCCEED') {
   *   const message = 'This payment has been already processed';
   *   // eslint-disable-next-line no-console
   *   console.warn('[PricingChooseSuccessRoute]', message, {
   *     userPayment,
   *     user,
   *   });
   *   // debugger; // eslint-disable-line no-debugger
   *   return (
   *     <PageError
   *       title={message}
   *       icon="ShieldQuestion"
   *       iconClassName="bg-info-stripes"
   *       explanation={
   *         <>
   *           Contact <Link href={contactsAliasRoute}>technical support</Link> if you have any
   *           problems.
   *         </>
   *       }
   *       explanationClassName="text-content"
   *     />
   *   );
   * }
   */
  if (status === 'FAILED') {
    const message = 'It looks like the payment failed';
    // eslint-disable-next-line no-console
    console.error('[PricingChooseSuccessRoute]', message, {
      userPayment,
      user,
    });
    // debugger; // eslint-disable-line no-debugger
    return (
      <PageError
        title={message}
        explanation={
          <>
            Please try again or contact <Link href={contactsAliasRoute}>technical support</Link> if
            you have any problems.
          </>
        }
        explanationClassName="text-content"
      />
    );
  }
  if (subscriptionType !== userPayment.subscriptionType) {
    const message = 'Subscription types mismatch';
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
        explanation={
          <>
            Expected <strong>{userPayment.subscriptionType}</strong>, but received{' '}
            <strong>{subscriptionType}</strong>.
          </>
        }
        explanationClassName="text-content"
      />
    );
  }

  // Parse grade and period with Zod schemas
  const { grade, period } = parsePaidableSubscriptionType(subscriptionType);

  // Parse all query parameters
  console.log('[PricingChooseSuccessRoute] all ok', {
    userPayment,
    successKey,
    grade,
    period,
    subscriptionType,
    params,
    searchParams,
  });
  debugger;

  // Update data if that hasn't been done yet
  if (status !== 'SUCCEED' || user.grade !== grade) {
    try {
      await finishPaymentAndUpdateUserGrade({ grade, userId, provider, paymentId, uniqueKey });
    } catch (error) {
      const message = `Cannot update the user's data`;
      const details = getErrorText(error);
      const comboMsg = [message, details].filter(Boolean).join(': ');
      // eslint-disable-next-line no-console
      console.error('[PricingChooseSuccessRoute]', comboMsg, {
        error,
        user,
        userPayment,
        subscriptionType,
      });
      debugger; // eslint-disable-line no-debugger
      return (
        <PageError
          title={message}
          error={error as ErrorLike}
          // reset={async () => {
          //   debugger;
          //   await finishPaymentAndUpdateUserGrade({ grade, userId, provider, paymentId, uniqueKey });
          // }}
        />
      );
    }
  }

  // Parse all query parameters
  console.log('[PricingChooseSuccessRoute] done', {
    userPayment,
    successKey,
    grade,
    period,
    subscriptionType,
    params,
    searchParams,
  });
  debugger;

  return (
    <PageWrapper
      className={cn(
        isDev && '__PricingChooseSuccessRoute', // DEBUG
      )}
      innerClassName={cn(
        isDev && '__PricingChooseSuccessRoute_Inner', // DEBUG
        'w-full h-full',
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
        <p>Debug info:</p>
        <pre>
          {JSON.stringify(
            {
              subscriptionType,
              successKey,
              searchParams: searchParams,
            },
            null,
            2,
          )}
        </pre>
        {/*
        <PricingChooseSuccessContent subscriptionType={subscriptionType} successKey={successKey} />
        */}
      </ScrollArea>
    </PageWrapper>
  );
}
