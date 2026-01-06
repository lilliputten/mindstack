import React from 'react';
import { redirect } from 'next/navigation';

import { contactsAliasRoute, pricingAliasRoute } from '@/config/routesConfig';
import { constructMetadata } from '@/lib/constructMetadata';
import { getRandomHashString } from '@/lib/helpers';
import { getCurrentUser, isLoggedUser } from '@/lib/session';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageError } from '@/components/shared';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';
import { proSubscirptionMonthlyBasePrice } from '@/constants';
import { gradeComparison } from '@/features/payments/helpers';
import {
  ensurePaidableSubscriptionType,
  parsePaidableSubscriptionType,
  TPaidableSubscriptionType,
} from '@/features/subscriptions';
import {
  calculatePriceDifferencies,
  getAllPricesForSubscriptionTypeAndBasePrice,
  getAllSubscriptionPrices,
} from '@/features/subscriptions/actions/getAllSubscriptionPrices';
import { getT, Link, TAwaitedLocaleProps } from '@/i18n';

import { PricingChoosePage } from './PricingChoosePage';

type TAwaitedProps = TAwaitedLocaleProps<{ subscriptionType: TPaidableSubscriptionType }>;

export async function generateMetadata({ params }: TAwaitedProps) {
  const { locale } = await params;
  const t = await getT({ locale });
  return constructMetadata({
    locale,
    title: t(`Pages.PricingChoose`),
  });
}

const saveScrollHash = getRandomHashString();

export async function PricingChooseRoute({ params: awaitedParams }: TAwaitedProps) {
  const params = await awaitedParams;
  const { locale, subscriptionType: rawSubscriptionType } = params;

  // Check if logged user
  const isLogged = await isLoggedUser();
  if (!isLogged) {
    // TODO: Or display a login popup?
    redirect(pricingAliasRoute);
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect(pricingAliasRoute);
  }

  const t = await getT({ locale });
  const subscriptionType: TPaidableSubscriptionType = ensurePaidableSubscriptionType(
    rawSubscriptionType,
    t,
  );

  // Parse grade and period with Zod schemas
  const { grade: requestedGrade, period: requestedPeriod } = parsePaidableSubscriptionType(
    subscriptionType,
    t,
  );

  // Const get user paid period from database
  const { grade: currentGrade, subscriptionPeriod: currentPeriod } = user;

  // Compare grades using helper
  const comparisonResult = gradeComparison(currentGrade, requestedGrade);

  let prices = await getAllSubscriptionPrices(subscriptionType);

  if (!prices) {
    throw new Error(`Can't calculate prices for a "${subscriptionType}" subscription type.`);
  }

  // Calculate price difference for upgrades
  if (comparisonResult.type === 'upgrade') {
    if (requestedPeriod !== currentPeriod) {
      const message = 'Cannot upgrade to another subscription period';
      const details = `You're triyng to upgrade from the "${currentPeriod}" to the "${requestedPeriod}" subscription types. It's not possible. Please contact or report to technical support.`;
      const comboMsg = [message, details].filter(Boolean).join(': ');
      // eslint-disable-next-line no-console
      console.error('[PricingChooseSuccessRoute]', comboMsg, {
        prices,
        subscriptionType,
      });
      // debugger; // eslint-disable-line no-debugger
      return (
        <PageError
          title={message}
          explanation={details}
          extraActions={
            <>
              <Button variant="theme">
                <Link href={contactsAliasRoute} className={'flex items-center gap-2'}>
                  <Icons.ArrowRight className="size-4" />
                  <span>Contact the technical support</span>
                </Link>
              </Button>
              <Button variant="theme">
                <Link href={pricingAliasRoute} className={'flex items-center gap-2'}>
                  <Icons.ArrowRight className="size-4" />
                  <span>Select another subsription type</span>
                </Link>
              </Button>
            </>
          }
        />
      );
    }

    const currentSubscriptionType: TPaidableSubscriptionType = ensurePaidableSubscriptionType(
      `${currentGrade}-${currentPeriod}`,
    );
    const basePrice = proSubscirptionMonthlyBasePrice;
    const currentPrices = await getAllPricesForSubscriptionTypeAndBasePrice(
      currentSubscriptionType,
      basePrice,
    );
    if (!currentPrices) {
      throw new Error(
        `Can't calculate prices for a "${currentSubscriptionType}" sbscription type and a ${basePrice} base price`,
      );
    }
    const _targetPrices = { ...prices };
    prices = calculatePriceDifferencies(prices, currentPrices);
    // prettier-ignore
    console.log('[PricingChooseRoute] calculatePriceDifferencies', currentSubscriptionType, '->', subscriptionType, {
      prices,
      _targetPrices,
      currentPrices,
    });
  }

  console.log('[PricingChooseRoute] DEBUG', {
    prices,
  });

  return (
    <PageWrapper
      className={cn(
        isDev && '__PricingChooseRoute', // DEBUG
      )}
      innerClassName={cn(
        isDev && '__PricingChooseRoute_Inner', // DEBUG
        'w-full h-full',
      )}
    >
      <ScrollArea
        saveScrollKey="PricingChooseRoute"
        saveScrollHash={saveScrollHash}
        className={cn(
          isDev && '__PricingChooseRoute_Scroll', // DEBUG
          'flex flex-1 flex-col overflow-hidden',
          'bg-theme-500/5',
        )}
        viewportClassName={cn(
          isDev && '__PricingChooseRoute_ScrollViewport', // DEBUG
          'flex flex-1 flex-col',
          'bg-decorative-gradient',
          '[&>div]:flex-col [&>div]:flex-1 [&>div]:justify-center [&>div]:items-center',
        )}
      >
        <PricingChoosePage
          subscriptionType={subscriptionType}
          comparisonResult={comparisonResult}
          locale={locale}
          prices={prices}
          // currentPeriod={currentPeriod}
          // grade={grade}
          // period={period}
        />
      </ScrollArea>
    </PageWrapper>
  );
}
