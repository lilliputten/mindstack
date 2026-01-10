import { TTranslator } from '@/i18n';
import {
  paidableSubscriptionTypes,
  paidableSubscriptionTypesSchema,
  TPaidableSubscriptionType,
} from '@/features/subscriptions';

/** Make sure the subscription type is expected and correct */
export function ensurePaidableSubscriptionType(rawValue: string, t?: TTranslator) {
  // Validate subscription type
  const parseResult = paidableSubscriptionTypesSchema.safeParse(rawValue?.toUpperCase());

  const subscriptionType: TPaidableSubscriptionType | undefined = parseResult.data;
  if (!parseResult.success || !subscriptionType) {
    const message = t
      ? t('EnsurePaidableSubscriptionType.InvalidSubscriptionTypeValue', { value: rawValue })
      : `Invalid subscription type value: "${rawValue}"`;
    const error = new Error(message);
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
    const message = t
      ? t('EnsurePaidableSubscriptionType.SubscriptionTypeNotSubjectToPayment', {
          subscriptionType,
        })
      : `The subscription type "${subscriptionType}" is not subject to payment`;
    const error = new Error(message);
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
