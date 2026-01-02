import React from 'react';
import { redirect } from 'next/navigation';

import { pricingAliasRoute } from '@/config/routesConfig';
import { constructMetadata } from '@/lib/constructMetadata';
import { getRandomHashString } from '@/lib/helpers';
import { isLoggedUser } from '@/lib/session';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { isDev } from '@/config';
import { TPaidableSubscriptionType } from '@/constants/subscriptions';
import {
  ensurePaidableSubscriptionType,
  parsePaidableSubscriptionType,
} from '@/features/subscriptions';
import { getT, TAwaitedLocaleProps } from '@/i18n';

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
    title: t(`Pages.PricingChoose`),
  });
}

const saveScrollHash = getRandomHashString();

export async function PricingChooseSuccessPageRoute({ params: awaitedParams }: TAwaitedProps) {
  const params = await awaitedParams;
  const { subscriptionType: rawSubscriptionType, successKey } = params;

  // Check if logged user
  const isLogged = await isLoggedUser();
  if (!isLogged) {
    // TODO: Or display a login popup?
    redirect(pricingAliasRoute);
  }

  const subscriptionType: TPaidableSubscriptionType =
    ensurePaidableSubscriptionType(rawSubscriptionType);

  // Parse grade and period with Zod schemas
  const { grade, period } = parsePaidableSubscriptionType(subscriptionType);

  console.log('[PricingChooseSuccessPageRoute] DEBUG', {
    successKey,
    grade,
    period,
    subscriptionType,
    params,
  });
  debugger;

  return (
    <PageWrapper
      className={cn(
        isDev && '__PricingChooseSuccessPageRoute', // DEBUG
      )}
      innerClassName={cn(
        isDev && '__PricingChooseSuccessPageRoute_Inner', // DEBUG
        'w-full h-full',
      )}
    >
      <ScrollArea
        saveScrollKey="PricingChooseSuccessPageRoute"
        saveScrollHash={saveScrollHash}
        className={cn(
          isDev && '__PricingChooseSuccessPageRoute_Scroll', // DEBUG
          'flex flex-1 flex-col overflow-hidden',
          'bg-theme-500/5',
        )}
        viewportClassName={cn(
          isDev && '__PricingChooseSuccessPageRoute_ScrollViewport', // DEBUG
          'flex flex-1 flex-col',
          'bg-decorative-gradient',
          '[&>div]:flex-col [&>div]:flex-1 [&>div]:justify-center [&>div]:items-center',
        )}
      >
        <p>Debug info:</p>
        <pre>
          subscriptionType: {subscriptionType}
          successKey: {successKey}
        </pre>
        {/*
        <PricingChooseSuccessContent subscriptionType={subscriptionType} successKey={successKey />
        */}
      </ScrollArea>
    </PageWrapper>
  );
}
