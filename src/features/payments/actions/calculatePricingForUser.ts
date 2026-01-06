'use server';

import { getLocale } from 'next-intl/server';

import { UserGradeType, UserSubscriptionPeriodType } from '@/generated/prisma';

import { getCurrentUser } from '@/lib/session';
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
import { getT } from '@/i18n';

export interface TPricingCalculationResult {
  prices: Awaited<ReturnType<typeof getAllSubscriptionPrices>>;
  comparisonResult: ReturnType<typeof gradeComparison>;
  requestedGrade: UserGradeType;
  requestedPeriod: UserSubscriptionPeriodType;
  currentGrade: UserGradeType;
  currentPeriod?: UserSubscriptionPeriodType | null;
  subscriptionType: TPaidableSubscriptionType;
}

export async function calculatePricingForUser(
  rawSubscriptionType: string,
): Promise<TPricingCalculationResult> {
  const locale = await getLocale();
  const t = await getT({ locale });

  const user = await getCurrentUser();
  if (!user) {
    throw new Error(t('UserNotLoggedIn'));
  }

  const subscriptionType: TPaidableSubscriptionType = ensurePaidableSubscriptionType(
    rawSubscriptionType,
    t,
  );

  // Parse grade and period with Zod schemas
  const { grade: requestedGrade, period: requestedPeriod } = parsePaidableSubscriptionType(
    subscriptionType,
    t,
  );

  // Get user's current grade and period from database
  const { grade: currentGrade, subscriptionPeriod: currentPeriod } = user;

  // Compare grades using helper
  const comparisonResult = gradeComparison(currentGrade, requestedGrade);

  let prices = await getAllSubscriptionPrices(subscriptionType);

  if (!prices) {
    const error = new Error(t('PricingChooseRoute.CannotCalculatePrices', { subscriptionType }));
    // eslint-disable-next-line no-console
    console.error('[calculatePricingForUser]', 'Cannot calculate prices', {
      subscriptionType,
      user,
    });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }

  // Calculate price difference for upgrades
  if (comparisonResult.type === 'upgrade') {
    if (!currentPeriod) {
      const error = new Error(`Current subscription period is missing for user ${user.id}`);
      // eslint-disable-next-line no-console
      console.error('[calculatePricingForUser]', 'Current subscription period is missing', {
        prices,
        subscriptionType,
        user,
      });
      debugger; // eslint-disable-line no-debugger
      throw error;
    }

    if (requestedPeriod !== currentPeriod) {
      const message = 'Cannot upgrade to another subscription period';
      const details = `You're trying to upgrade from the "${currentPeriod}" to the "${requestedPeriod}" subscription types. It's not possible. Please contact or report to technical support.`;
      const comboMsg = [message, details].filter(Boolean).join(': ');
      // eslint-disable-next-line no-console
      console.error('[calculatePricingForUser]', comboMsg, {
        prices,
        subscriptionType,
      });
      debugger; // eslint-disable-line no-debugger
      throw new Error(comboMsg);
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
        t('PricingChooseRoute.CannotCalculatePricesWithBasePrice', {
          currentSubscriptionType,
          basePrice,
        }),
      );
    }
    const _targetPrices = { ...prices };
    prices = calculatePriceDifferencies(prices, currentPrices);

    // prettier-ignore
    console.log('[calculatePricingForUser] calculatePriceDifferencies', currentSubscriptionType, '->', subscriptionType, {
      prices,
      _targetPrices,
      currentPrices,
    });
  }

  return {
    prices,
    comparisonResult,
    requestedGrade,
    requestedPeriod,
    currentGrade,
    currentPeriod,
    subscriptionType,
  };
}
