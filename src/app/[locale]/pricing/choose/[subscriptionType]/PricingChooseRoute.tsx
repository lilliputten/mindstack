import React from 'react';
import { redirect } from 'next/navigation';

import { UserGradeSchema, UserGradeType } from '@/generated/prisma';

import { pricingAliasRoute } from '@/config/routesConfig';
import { constructMetadata } from '@/lib/constructMetadata';
import { getRandomHashString } from '@/lib/helpers';
import { getCurrentUser, isLoggedUser } from '@/lib/session';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { isDev } from '@/config';
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
  const { grade: requestedGrade } = parsePaidableSubscriptionType(subscriptionType, t);
  const currentGrade = user.grade;

  // Check if user is GUEST - this is a normal case for upgrading from GUEST
  if (currentGrade === 'GUEST') {
    console.log('[PricingChooseRoute]', 'User is GUEST - normal upgrade scenario', {
      user,
      requestedGrade,
      currentGrade,
    });
  }

  // Check if user already has a higher grade (downgrade scenario)
  if (currentGradeIndex > requestedGradeIndex) {
    // Show warning about downgrade - suggest contacting admin
    // For now, we'll allow the downgrade but in a real scenario,
    // we might want to show a warning message
    console.warn('[PricingChooseRoute]', 'User is attempting to downgrade', {
      user,
      requestedGrade,
      currentGrade,
    });
  }

  // Check if user has a lower grade (upgrade scenario)
  if (currentGradeIndex < requestedGradeIndex) {
    // This is a normal upgrade scenario - proceed with payment
    console.log('[PricingChooseRoute]', 'User is upgrading', {
      user,
      requestedGrade,
      currentGrade,
    });
  }

  // Grade hierarchy for comparison (from lowest to highest)
  const gradeHierarchy: UserGradeType[] = UserGradeSchema.options;
  const currentGradeIndex = gradeHierarchy.indexOf(currentGrade);
  const requestedGradeIndex = gradeHierarchy.indexOf(requestedGrade);

  // If user has the same grade, they might be renewing or changing period
  if (currentGradeIndex === requestedGradeIndex) {
    console.log('[PricingChooseRoute]', 'User has same grade - renewal or period change', {
      user,
      requestedGrade,
      currentGrade,
    });
  }

  // Determine the comparison result
  let comparisonResult: {
    type: 'same' | 'upgrade' | 'downgrade' | 'guest';
    currentGrade: string;
    requestedGrade: string;
    currentGradeIndex: number;
    requestedGradeIndex: number;
    priceDifference?: number; // For upgrade scenarios
  };

  if (currentGrade === 'GUEST') {
    // GUEST users are always upgrading
    comparisonResult = {
      type: 'upgrade',
      currentGrade,
      requestedGrade,
      currentGradeIndex,
      requestedGradeIndex,
    };
  } else if (currentGradeIndex > requestedGradeIndex) {
    // Downgrade scenario
    comparisonResult = {
      type: 'downgrade',
      currentGrade,
      requestedGrade,
      currentGradeIndex,
      requestedGradeIndex,
    };
  } else if (currentGradeIndex < requestedGradeIndex) {
    // Upgrade scenario - calculate price difference if needed
    comparisonResult = {
      type: 'upgrade',
      currentGrade,
      requestedGrade,
      currentGradeIndex,
      requestedGradeIndex,
    };
  } else {
    // Same grade - renewal or period change
    comparisonResult = {
      type: 'same',
      currentGrade,
      requestedGrade,
      currentGradeIndex,
      requestedGradeIndex,
    };
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
          // grade={grade}
          // period={period}
        />
      </ScrollArea>
    </PageWrapper>
  );
}
