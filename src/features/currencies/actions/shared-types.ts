import { CurrencyTypeSchema, CurrencyTypeType } from '@/generated/prisma';

export type TCurrencyType = CurrencyTypeType;
export type TCurrencyRatios = Record<TCurrencyType, number>;

export const allCurrencies: TCurrencyType[] = CurrencyTypeSchema._def.values;
export const [_defaultCurrency, ...derivedCurrencies] = allCurrencies;

/** Default currency = USD */
export const defaultCurrencyType: TCurrencyType = allCurrencies[0];
