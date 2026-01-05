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
import {
  ensurePaidableSubscriptionType,
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

  const t = await getT({ locale });
  const subscriptionType: TPaidableSubscriptionType = ensurePaidableSubscriptionType(
    rawSubscriptionType,
    t,
  );

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
          // grade={grade}
          // period={period}
        />
      </ScrollArea>
    </PageWrapper>
  );
}
