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

export const subscriptionsRequireUser: TSubscriptionType[] = [
  'BASIC', // UserGradeType: BASIC
  'PRO-MONTH', // UserGradeType: PRO
  'PRO-YEAR', // UserGradeType: PRO
  'PREMIUM-MONTH', // UserGradeType: PREMIUM
  'PREMIUM-YEAR', // UserGradeType: PREMIUM
  // 'UNLIMITED', // UserGradeType: UNLIMITED
];
