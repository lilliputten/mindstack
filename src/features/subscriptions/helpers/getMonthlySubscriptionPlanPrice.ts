import { UserGradeType } from '@/generated/prisma';

import {
  PREMIUM_MONTHLY_USD_PRICE,
  PRO_MONTHLY_USD_PRICE,
  yearlyFromMonthlyRatio,
} from '@/constants/prices';

import { TPeriodType } from '../types';

export function getMonthlySubscriptionPlanPrice(grade: UserGradeType) {
  switch (grade) {
    case 'PRO':
      return PRO_MONTHLY_USD_PRICE;
    case 'PREMIUM':
      return PREMIUM_MONTHLY_USD_PRICE;
    default:
      return 0;
  }
}

export function getBaseSubscriptionPlanPrice(grade: UserGradeType, period: TPeriodType) {
  const monthlyPrice = getMonthlySubscriptionPlanPrice(grade);
  const isYearly = period === 'YEAR';
  return isYearly ? monthlyPrice * yearlyFromMonthlyRatio : monthlyPrice;
}
