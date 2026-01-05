import { TBroadLocale } from '@/i18n';

import { TCurrencyType } from '../types';

/** Currencies suiteable for each locale */
export const localeCurrencies: Record<TBroadLocale, TCurrencyType> = {
  en: 'USD',
  ru: 'RUB',
  es: 'EUR',
  xx: 'USD', // DEBUG
};
