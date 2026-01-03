import {
  paidableSubscriptionTypes,
  paidableSubscriptionTypesSchema,
  TPaidableSubscriptionType,
} from '@/features/subscriptions';

/** Make sure the subscription type is expected and correct */
export function ensurePaidableSubscriptionType(rawValue: string) {
  // Validate subscription type
  const parseResult = paidableSubscriptionTypesSchema.safeParse(rawValue?.toUpperCase());

  const subscriptionType: TPaidableSubscriptionType | undefined = parseResult.data;
  if (!parseResult.success || !subscriptionType) {
    const error = new Error(`Invalid subscription type value: "${rawValue}"`);
    // eslint-disable-next-line no-console
    console.error('[ensurePaidableSubscriptionType]', {
      error,
      subscriptionType,
      parseResult,
      rawValue,
    });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }

  if (!paidableSubscriptionTypes.includes(subscriptionType)) {
    const error = new Error(
      `The subscription type "${subscriptionType}" is not subject to payment`,
    );
    // eslint-disable-next-line no-console
    console.error('[ensurePaidableSubscriptionType]', {
      error,
      subscriptionType,
      rawValue,
    });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }

  return subscriptionType;
}
