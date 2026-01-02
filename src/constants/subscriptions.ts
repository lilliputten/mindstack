import z from 'zod';

/** Subsription types. See `UserGradeType` */
const subscriptionTypes = [
  // 'GUEST', // UserGradeType: GUEST
  'BASIC', // UserGradeType: BASIC
  'PRO-MONTH', // UserGradeType: PRO
  'PRO-YEAR', // UserGradeType: PRO
  'PREMIUM-MONTH', // UserGradeType: PREMIUM
  'PREMIUM-YEAR', // UserGradeType: PREMIUM
  'UNLIMITED', // UserGradeType: UNLIMITED
] as const;
export const subscriptionTypesSchema = z.enum(subscriptionTypes);
export type TSubscriptionType = z.infer<typeof subscriptionTypesSchema>;

const paidableSubscriptionTypesArray = [
  // 'BASIC', // UserGradeType: BASIC
  'PRO-MONTH', // UserGradeType: PRO
  'PRO-YEAR', // UserGradeType: PRO
  'PREMIUM-MONTH', // UserGradeType: PREMIUM
  'PREMIUM-YEAR', // UserGradeType: PREMIUM
  // 'UNLIMITED', // UserGradeType: UNLIMITED
] as const;
export const paidableSubscriptionTypes: TSubscriptionType[] = [...paidableSubscriptionTypesArray];
export const paidableSubscriptionTypesSchema = z.enum(paidableSubscriptionTypesArray);
export type TPaidableSubscriptionType = z.infer<typeof paidableSubscriptionTypesSchema>;

export const subscriptionsRequireUser: TSubscriptionType[] = [
  'BASIC', // UserGradeType: BASIC
  ...paidableSubscriptionTypes,
];

/** Period types for subscription plans */
const periodTypes = [
  // Subscription plan periods
  'MONTH',
  'YEAR',
] as const;
export const periodTypesSchema = z.enum(periodTypes);
export type TPeriodType = z.infer<typeof periodTypesSchema>;
