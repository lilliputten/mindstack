import { UserGradeSchema, UserGradeType } from '@/generated/prisma';

import {
  premiumSubscriptionMultiplier,
  proSubscirptionMonthlyBasePrice,
  yearlyFromMonthlyRatio,
} from '@/constants/prices';
import {
  calcPriceForCurrency,
  defaultCurrencyType,
  prettifyPrice,
  TCurrencyType,
} from '@/features/currencies';
import { parsePaidableSubscriptionType } from '@/features/subscriptions/helpers/parsePaidableSubscriptionType';
import {
  TPaidableSubscriptionType,
  TPeriodType,
} from '@/features/subscriptions/types/subscriptions';

export interface GradeComparisonResult {
  type: 'same' | 'upgrade' | 'downgrade' | 'guest';
  currentGrade: UserGradeType;
  requestedGrade: UserGradeType;
  currentGradeIndex: number;
  requestedGradeIndex: number;
  priceDifference?: number;
}

export function compareGrades(
  currentGrade: UserGradeType,
  requestedGrade: UserGradeType,
): GradeComparisonResult {
  const gradeHierarchy = UserGradeSchema.options;
  const currentGradeIndex = gradeHierarchy.indexOf(currentGrade);
  const requestedGradeIndex = gradeHierarchy.indexOf(requestedGrade);

  let type: GradeComparisonResult['type'] = 'same';

  if (currentGrade === 'GUEST') {
    type = 'guest';
  } else if (currentGradeIndex > requestedGradeIndex) {
    type = 'downgrade';
  } else if (currentGradeIndex < requestedGradeIndex) {
    type = 'upgrade';
  }

  return {
    type,
    currentGrade,
    requestedGrade,
    currentGradeIndex,
    requestedGradeIndex,
  };
}

/** Calculate the price difference between current and requested subscription grades */
export function calculatePriceDifference(
  currentGrade: UserGradeType,
  requestedGrade: UserGradeType,
  currentPeriod: TPeriodType,
  requestedPeriod: TPeriodType,
  currencyRatios: Record<TCurrencyType, number> | null,
  currency: TCurrencyType = defaultCurrencyType,
): number | undefined {
  // Only calculate for upgrades
  const gradeHierarchy = UserGradeSchema.options;
  const currentGradeIndex = gradeHierarchy.indexOf(currentGrade);
  const requestedGradeIndex = gradeHierarchy.indexOf(requestedGrade);

  if (currentGradeIndex >= requestedGradeIndex) {
    return undefined; // Not an upgrade
  }

  // Calculate prices for both subscriptions
  const currentPrice = calculateSubscriptionPrice(
    `${currentGrade}-${currentPeriod}` as TPaidableSubscriptionType,
    currencyRatios,
    currency,
  );
  const requestedPrice = calculateSubscriptionPrice(
    `${requestedGrade}-${requestedPeriod}` as TPaidableSubscriptionType,
    currencyRatios,
    currency,
  );

  return requestedPrice - currentPrice;
}

/** Calculate the price for a specific subscription type */
export function calculateSubscriptionPrice(
  subscriptionType: TPaidableSubscriptionType,
  currencyRatios: Record<TCurrencyType, number> | null,
  currency: TCurrencyType = defaultCurrencyType,
) {
  const { grade, period } = parsePaidableSubscriptionType(subscriptionType);
  const basePrice = proSubscirptionMonthlyBasePrice;
  if (basePrice == undefined) {
    return 0;
  }

  const ratio = currencyRatios?.[currency] ?? 1; // Use 1 as fallback if ratio not available
  let price = calcPriceForCurrency(basePrice, ratio, currency);

  if (period === 'YEAR') {
    price = price * yearlyFromMonthlyRatio;
  }
  price = prettifyPrice(price) || 0;

  if (grade === 'PREMIUM') {
    // Don't prettify here -- we consider that `premiumSubscriptionMultiplier` will produce nice numbers
    price = price * premiumSubscriptionMultiplier;
  }

  return price;
}
