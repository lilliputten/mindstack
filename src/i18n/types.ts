import { z } from 'zod';

export const strictLocalesList = ['en', 'es', 'ru'] as const;
// export const localesList = strictLocalesList;
export const localesList = process.env.NEXT_PUBLIC_DEBUG_LOCALE
  ? ([...strictLocalesList, process.env.NEXT_PUBLIC_DEBUG_LOCALE] as const)
  : strictLocalesList;
export type TLocale = (typeof strictLocalesList)[number];
export type TBroadLocale = (typeof localesList)[number];
export const defaultLocale: TLocale = strictLocalesList[0];
export type TLocaleParams = { locale: TLocale };
export type TLocaleProps = { params: TLocaleParams };

export const LocaleSchema = z.enum(strictLocalesList);
export type TLocaleSchema = z.infer<typeof LocaleSchema>;
// TODO: Define extendable params type (allowing to receive other properties
export type TAwaitedLocaleParams<T = void> = Promise<TLocaleParams & T>;
export type TAwaitedLocaleProps<T = void> = { params: TAwaitedLocaleParams<T> };

export const localesRegStr = '(' + localesList.join('|') + ')';
export const localesRegExp = new RegExp(localesRegStr);
export const localesPathPrefixRegExp = new RegExp('^/' + localesRegStr + '\\b');
