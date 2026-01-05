import React from 'react';
import { redirect } from 'next/navigation';

import { pricingAliasRoute } from '@/config/routesConfig';
import { constructMetadata } from '@/lib/constructMetadata';
import { getRandomHashString } from '@/lib/helpers';
import { getCurrentUser, isLoggedUser } from '@/lib/session';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { isDev } from '@/config';
import { getAllCurrencyRatios } from '@/features/currencies/actions';
import { calculatePriceDifference, compareGrades } from '@/features/payments/helpers';
import {
  ensurePaidableSubscriptionType,
  parsePaidableSubscriptionType,
  TPaidableSubscriptionType,
} from '@/features/subscriptions';
import { getT, TAwaitedLocaleProps } from '@/i18n';

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
  const currentGrade = user.grade;
  // For now, assume current period is the same as requested period for price calculation
  // In a real scenario, you might want to get the user's current subscription period from their profile
  const currentPeriod = requestedPeriod; // Default to requested period

  // Compare grades using helper
  const comparisonResult = compareGrades(currentGrade, requestedGrade);

  // Calculate price difference for upgrades
  let upgradePriceDifference: number | undefined;
  if (comparisonResult.type === 'upgrade') {
    const currencyRatios = await getAllCurrencyRatios();
    upgradePriceDifference = calculatePriceDifference(
      currentGrade,
      requestedGrade,
      currentPeriod,
      requestedPeriod,
      currencyRatios,
    );
  }

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
          upgradePriceDifference={upgradePriceDifference}
          // currentPeriod={currentPeriod}
          // grade={grade}
          // period={period}
        />
      </ScrollArea>
    </PageWrapper>
  );
}
