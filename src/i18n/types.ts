import { z } from 'zod';

// Strict locales list (only real ones)...
export const strictLocalesList = ['en', 'es', 'ru'] as const;
// export const localesList = strictLocalesList;
// Broad locales list (possibly with a fake debug one)...
export const localesList = process.env.NEXT_PUBLIC_DEBUG_LOCALE
  ? ([...strictLocalesList, process.env.NEXT_PUBLIC_DEBUG_LOCALE] as const)
  : strictLocalesList;

// Types...
export type TLocale = (typeof strictLocalesList)[number];
export type TBroadLocale = (typeof localesList)[number];
export const defaultLocale: TLocale = strictLocalesList[0];
export type TLocaleParams = { locale: TLocale };
export type TLocaleProps = { params: TLocaleParams };

// ZOD schemas...
export const LocaleSchema = z.enum(strictLocalesList);
export type TLocaleSchema = z.infer<typeof LocaleSchema>;
// TODO: Define extendable params type (allowing to receive other properties
export type TAwaitedLocaleParams<T = void> = Promise<TLocaleParams & T>;
export type TAwaitedLocaleProps<T = void> = { params: TAwaitedLocaleParams<T> };

// Pregenerate some frequently used helper variables...
export const localesRegStr = '(' + localesList.join('|') + ')';
export const localesRegExp = new RegExp(localesRegStr);
export const localesPathPrefixRegExp = new RegExp('^/' + localesRegStr + '\\b');
