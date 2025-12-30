import { CurrencyTypeSchema, CurrencyTypeType } from '@/generated/prisma';

export type TCurrencyType = CurrencyTypeType;
export type TCurrencyRatios = Record<TCurrencyType, number>;

export const allCurrencies: TCurrencyType[] = CurrencyTypeSchema._def.values;
export const [_defaultCurrency, ...derivedCurrencies] = allCurrencies;

/** Default currency = USD */
export const defaultCurrencyType: TCurrencyType = allCurrencies[0];

/** [>* Derived currency types (all except the first/default currency) <]
 * export type TDerivedCurrencyType = Exclude<TCurrencyType, typeof defaultCurrencyType>;
 */
