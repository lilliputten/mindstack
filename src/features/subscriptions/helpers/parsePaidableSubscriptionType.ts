import { UserGradeSchema } from '@/generated/prisma';

import { periodTypesSchema, TPaidableSubscriptionType } from '@/features/subscriptions';

/** Parse correct grade and period values from combined raw subscription type, usually in form '{grade}-{period}` */
export function parsePaidableSubscriptionType(subscriptionType: TPaidableSubscriptionType) {
  // Parse grade and period with Zod schemas
  const [gradeRaw, periodRaw] = subscriptionType.split('-');

  const gradeParseResult = UserGradeSchema.safeParse(gradeRaw);
  const grade = gradeParseResult.data;
  if (!gradeParseResult.success || !grade) {
    const message = 'Invalid subscription grade';
    const error = new Error(`${message}: ${gradeRaw}. Error: ${gradeParseResult.error.message}`);
    // eslint-disable-next-line no-console
    console.error('[parsePaidableSubscriptionType]', message, {
      error,
      gradeParseResult,
      gradeRaw,
      subscriptionType,
    });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }

  const periodParseResult = periodTypesSchema.safeParse(periodRaw);
  const period = periodParseResult.data;
  if (!periodParseResult.success || !period) {
    const message = 'Invalid subscription period';
    const error = new Error(`${message}: ${periodRaw}. Error: ${periodParseResult.error.message}`);
    // eslint-disable-next-line no-console
    console.error('[parsePaidableSubscriptionType]', message, {
      error,
      periodParseResult,
      periodRaw,
      subscriptionType,
    });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }

  // Return result
  return { grade, period };
}
