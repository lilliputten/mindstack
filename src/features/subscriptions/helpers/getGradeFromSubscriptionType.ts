import { UserGradeSchema, UserGradeType } from '@/generated/prisma';

import { TSubscriptionType } from '../types';

export function getGradeFromSubscriptionType(subscriptionType: TSubscriptionType) {
  let grade = subscriptionType as UserGradeType;
  if (subscriptionType.includes('-')) {
    // Compund subscription type, like 'PREMIUM-YEAR'...
    const [parsedGrade] = subscriptionType.split('-');
    grade = parsedGrade as UserGradeType;
  }

  const gradeParseResult = UserGradeSchema.safeParse(grade);
  if (!gradeParseResult.success) {
    const message = 'Invalid subscription grade';
    const error = new Error(`${message}: ${grade}. Error: ${gradeParseResult.error.message}`);
    // eslint-disable-next-line no-console
    console.error('[getGradeFromSubscriptionType]', message, {
      error,
      gradeParseResult,
      grade,
      subscriptionType,
    });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }

  return grade;
}
