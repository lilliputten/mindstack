import ms from 'ms';
import { useFormatter } from 'next-intl';

import { defaultLocale, TLocale, TTranslator, useT } from '@/i18n';
import { dayMs, epochStartDate, halfYearMs, hourMs, minuteMs } from '@/constants';

export type TDateLike = Date | string | number;

/* // TODO: Translations:
 *
 * See translation approach in ``formatSecondsDuration`.
 *
 * You'll need to add these keys to your messages file (to be able to use `useTranslations('duration')`):
 *
 * ```
 * {
 *   "duration": {
 *     "days": "d",
 *     "hours": "h",
 *     "minutes": "m",
 *     "seconds": "s"
 *   }
 * }
 * ```
 */

// type TTranslator = (key: string) => string;

/** Use relative date format if lesser time passed */
const relativeDateLimit = dayMs;
// export const halfMonthLimit = dayMs * 15;

/** Workaround for cases when date has been passed as an ISO string or en empty value (now) */
export function ensureDate(date?: TDateLike): Date {
  if (!date) {
    return new Date();
  }
  if (typeof date === 'string' || typeof date === 'number') {
    return new Date(date);
  }
  return date;
}

/** Return numeric date epochs difference. The returned value is positive if 'b' is the later than 'a'. Returns zero if the dates are equal. */
export function compareDates(a: TDateLike = epochStartDate, b: TDateLike = epochStartDate) {
  // Workaround for cases when date has been passed as an ISO string
  a = ensureDate(a);
  b = ensureDate(b);
  return b.getTime() - a.getTime();
}

export function getFormattedRelativeDate(
  format: ReturnType<typeof useFormatter>,
  date?: TDateLike,
  now?: TDateLike,
) {
  // Workaround for cases when date has been passed as an ISO string
  date = ensureDate(date);
  now = ensureDate(now);
  const diff = now.getTime() - date.getTime();
  if (diff < relativeDateLimit) {
    // Return relative date
    return format.relativeTime(date, now);
  }
  // Return full date
  return format.dateTime(date, {
    // Show a year only if half a year passed
    year: diff >= halfYearMs ? 'numeric' : undefined,
    month: 'short',
    day: 'numeric',
  });
}

export function useFormattedRelativeDate(date?: TDateLike, now?: TDateLike) {
  // Workaround for cases when date has been passed as an ISO string
  date = ensureDate(date);
  now = ensureDate(now);

  const format = useFormatter();
  return getFormattedRelativeDate(format, date, now);
}

export function getNativeFormattedRelativeDate(
  date: TDateLike = new Date(),
  now: TDateLike = new Date(),
  locale: TLocale = defaultLocale,
) {
  // Workaround for cases when date has been passed as an ISO string
  date = ensureDate(date);
  now = ensureDate(now);

  const rtf = new Intl.RelativeTimeFormat(locale, { style: 'short' });
  const diff = now.getTime() - date.getTime();
  const absDiff = Math.abs(diff);

  // Handle past dates (positive diff means past - now is later than date)
  if (diff >= 0 && absDiff < relativeDateLimit) {
    // Past date within a day
    if (absDiff < 1000 * 60) {
      // Less than 1 minute ago
      return rtf.format(-Math.round(absDiff / 1000), 'seconds');
    } else if (absDiff < hourMs) {
      // Less than 1 hour ago
      return rtf.format(-Math.round(absDiff / minuteMs), 'minutes');
    } else {
      // Less than 1 day ago
      return rtf.format(-Math.round(absDiff / hourMs), 'hours');
    }
  }

  // Handle future dates (negative diff means future - now is earlier than date)
  if (diff < 0 && absDiff < relativeDateLimit) {
    // Future date within a day
    if (absDiff < 1000 * 60) {
      // Less than 1 minute in future
      return rtf.format(Math.round(absDiff / 1000), 'seconds');
    } else if (absDiff < hourMs) {
      // Less than 1 hour in future
      return rtf.format(Math.round(absDiff / minuteMs), 'minutes');
    } else {
      // Less than 1 day in future
      return rtf.format(Math.round(absDiff / hourMs), 'hours');
    }
  }

  // Return full date for dates older than a day (both past and future)
  const formatter = new Intl.DateTimeFormat(locale, {
    year: absDiff >= halfYearMs ? 'numeric' : undefined,
    month: 'short',
    day: 'numeric',
  });
  return formatter.format(date);
}

export function formatDateTag(input?: TDateLike, omitTime: boolean = false): string {
  const date = !input ? new Date() : input instanceof Date ? input : new Date(input);
  // const pad = (n: number) => (n < 10 ? '0' + n : n);
  const numPad = (n: number, pad: number = 2) => String(n).padStart(pad, '0');
  const formattedDate = [
    // date...
    date.getFullYear(),
    numPad(date.getMonth() + 1), // Adding 1 because getMonth() returns 0-11, but we want 1-12
    numPad(date.getDate()),
  ]
    .filter(Boolean)
    .join('-');
  const formattedTime =
    !omitTime &&
    [
      numPad(date.getHours()),
      numPad(date.getMinutes()),
      numPad(date.getSeconds()),
      numPad(date.getMilliseconds(), 3),
    ]
      .filter(Boolean)
      .join(':');
  return [formattedDate, formattedTime].filter(Boolean).join(',');
}

export function formatDate(input: TDateLike, locale: TLocale = defaultLocale): string {
  const date = input instanceof Date ? input : new Date(input);
  return date.toLocaleDateString(locale, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Calculates the time difference between the given timestamp and the current time,
 * returning a human-readable duration string.
 *
 * @param timestamp - The timestamp to compare against the current time. Can be:
 *   - A Date object: Will be converted to milliseconds internally
 *   - An ISO string: Will be parsed into a Date, then converted to milliseconds
 *   - A number (milliseconds): Used directly as the timestamp
 *   - undefined/null: Uses the current time (returns "0ms ago")
 *
 * @param timeOnly - If true, returns only the time duration without the "ago" suffix.
 *   For example, "30s ago" becomes "30s".
 *   Defaults to false.
 *
 * @returns A human-readable duration string.
 *   When timeOnly is false (default): Returns format like "3h 30m ago"
 *   When timeOnly is true: Returns format like "3h 30m"
 *
 * @example
 * // Using Date object
 * const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
 * timeAgo(pastDate); // Returns "2h ago"
 *
 * @example
 * // Using ISO string
 * timeAgo('2023-01-15T10:00:00Z'); // Returns "2d ago" (if current date is Jan 17)
 *
 * @example
 * // Using numeric timestamp (milliseconds)
 * timeAgo(Date.now() - 30 * 1000); // Returns "30s ago"
 *
 * @example
 * // Using timeOnly option
 * timeAgo(new Date(Date.now() - 2 * 60 * 60 * 1000), true); // Returns "2h"
 */
export function timeAgo(timestamp: TDateLike | undefined, timeOnly?: boolean): string {
  const now = Date.now();
  const ticks = !timestamp
    ? now
    : typeof timestamp === 'number'
      ? timestamp
      : ensureDate(timestamp).getTime();
  return `${ms(now - ticks)}${timeOnly ? '' : ' ago'}`;
}

/** Get time diff in milliseconds
 */
export function getPeriodDiff(timestamp?: TDateLike): number {
  if (!timestamp) {
    return 0;
  }
  return typeof timestamp === 'number' ? timestamp : Date.now() - ensureDate(timestamp).getTime();
}

/**
 * Calculates the time difference from the given timestamp to now and returns
 * a formatted duration string without the "ago" suffix.
 *
 * This function is similar to timeAgo(timestamp, true) but handles edge cases
 * differently:
 * - Returns "0ms" for empty/falsy inputs (not "0ms")
 * - Takes the timestamp directly as milliseconds if it's a number
 * - Calculates time difference from now for Date objects and strings
 *
 * @param timestamp - The timestamp to calculate duration from. Can be:
 *   - undefined/null/empty: Returns "0ms"
 *   - A number (milliseconds): Used directly as the duration
 *   - A Date object: Calculates difference from now
 *   - An ISO string: Parsed to Date, then difference from now
 *
 * @returns A human-readable duration string without "ago" suffix.
 *   Examples: "500ms", "30s", "2m", "3h", "1d", ""
 *
 * @example
 * // With empty input
 * stringifyPeriod(); // Returns ""
 *
 * @example
 * // With milliseconds duration
 * stringifyPeriod(500); // Returns "500ms"
 *
 * @example
 * // With past date
 * stringifyPeriod(Date.now() - 30 * 1000); // Returns "30s"
 *
 * @example
 * // With Date object
 * stringifyPeriod(new Date(Date.now() - 2 * 60 * 60 * 1000)); // Returns "2h"
 */
export function stringifyPeriod(timestamp?: TDateLike): string {
  if (!timestamp) {
    return '';
  }
  const ticks = getPeriodDiff(timestamp);
  if (!ticks) {
    return '';
  }
  return ms(ticks);
}

/**
 * Translates a duration string by replacing abbreviated units with translated versions.
 * This function parses strings like "3h 30m" and translates them using the provided translation function.
 *
 * @param periodStr - The duration string to translate (e.g., "3h 30m", "2d", "45s").
 *                   If empty or undefined, returns empty string.
 * @param t - Optional translation function that receives keys like 'duration.days',
 *            'duration.hours', 'duration.minutes', 'duration.seconds', 'duration.milliseconds'
 *            and should return the translated string.
 *            If not provided, uses default abbreviations (d, h, m, s, ms).
 *
 * @returns A human-readable duration string with translated components.
 *          Example: "500milliseconds", "30seconds", "2minutes"
 *
 * @example
 * // Without translation function
 * translateParsedPeriod("3h 30m"); // Returns "3h 30m"
 *
 * @example
 * // With translation function
 * const mockT = (key: string) => {
 *   const translations = {
 *     'duration.hours': 'hours',
 *     'duration.minutes': 'minutes',
 *     'duration.seconds': 'seconds',
 *   };
 *   return translations[key] || key;
 * };
 * translateParsedPeriod("3h 30m", mockT); // Returns "3hours 30minutes"
 */
export function translateParsedPeriod(periodStr?: string, t?: TTranslator): string {
  if (!periodStr) {
    return '';
  }

  // Mapping from abbreviated units to full translation keys
  const unitKeyMap: Record<string, string> = {
    ms: 'milliseconds',
    s: 'seconds',
    m: 'minutes',
    h: 'hours',
    d: 'days',
  };

  // Translation functions for each time unit with proper pluralization support
  const translateDuration = (value: string, unit: string) => {
    const translationKey = `duration.${unitKeyMap[unit] || unit}`;
    const translation = t?.(translationKey, { count: value }) || unit;
    return `${value} ${translation}`;
  };

  // Parse the time string and translate postfixes
  // The format is like "3h 30m" or "2d" or "45s"
  const parts = periodStr.split(' ');

  const translatedParts = parts.map((part) => {
    // Extract the numeric value and the postfix
    const match = part.match(/^(\d+\.?\d*)([a-zA-Z]+)$/);
    if (match) {
      const value = match[1];
      const postfix = match[2];
      return translateDuration(value, postfix);
    }
    return part; // Return unchanged if no match
  });

  return translatedParts.join(' ');
}

/**
 * Translates the postfixes of a time duration string returned by timeAgo(timeOnly=true).
 *
 * This function takes the output of timeAgo(timestamp, true) and replaces the
 * abbreviated time units (ms, s, m, h, d) with their translated equivalents
 * using the provided translation function.
 *
 * @param timestamp - The timestamp to format. Can be:
 *   - A Date object: Will be converted to milliseconds internally
 *   - An ISO string: Will be parsed into a Date, then converted to milliseconds
 *   - A number (milliseconds): Used directly as the timestamp
 *
 * @param t - Optional translation function that receives keys like 'duration.seconds',
 *   'duration.minutes', 'duration.hours', 'duration.days', 'duration.milliseconds'
 *   and should return the translated string.
 *   If not provided, returns the default abbreviations (ms, s, m, h, d).
 *
 * @returns A human-readable duration string with translated postfixes.
 *   Example output: "30 seconds", "2 hours", "1 days"
 *
 * @example
 * // Without translation function
 * translatedPeriod(Date.now() - 30 * 1000); // Returns "30s"
 *
 * @example
 * // With translation function
 * const mockT = (key: string) => {
 *   const translations = {
 *     'duration.seconds': 'segundos',
 *     'duration.minutes': 'minutos',
 *     'duration.hours': 'horas',
 *     'duration.days': 'días',
 *     'duration.milliseconds': 'milisegundos',
 *   };
 *   return translations[key] || key;
 * };
 * translatedPeriod(Date.now() - 30 * 1000, mockT); // Returns "30 segundos"
 *
 * @example
 * // Translating compound times
 * translatedPeriod(Date.now() - (2 * 60 + 30) * 1000, mockT); // Returns "3 minutos" (rounded up)
 */
export function translatedPeriod(timestamp?: TDateLike, t?: TTranslator): string {
  const str = stringifyPeriod(timestamp);
  return translateParsedPeriod(str, t);
}

/** Create a JavaScript Date object that is N days ago from an existing date */
export function createDateWithDaysDiff(days: number, timestamp?: TDateLike) {
  const date = new Date(ensureDate(timestamp));
  date.setDate(date.getDate() + days);
  return date;
}

export function formatSecondsDuration(seconds: number = 0, t?: TTranslator): string {
  /* // Old approach
   * const days = Math.floor(seconds / 86400);
   * const hours = Math.floor((seconds % 86400) / 3600);
   * const minutes = Math.floor((seconds % 3600) / 60);
   * const remainingSeconds = Math.floor(seconds) % 60;
   * // Create a duration string in the format that translateParsedPeriod expects
   * const durationStr = [
   *   days > 0 ? `${days}d` : '',
   *   hours > 0 ? `${hours}h` : '',
   *   minutes > 0 ? `${minutes}m` : '',
   *   remainingSeconds > 0 || (!days && !hours && !minutes) ? `${remainingSeconds}s` : '',
   * ]
   *   .filter(Boolean)
   *   .join(' ');
   */
  return translatedPeriod(seconds * 1000, t);
}

/** A hook wrapper for `formatSecondsDuration` date helper */
export function useFormattedDuration(seconds: number) {
  const t = useT('duration');
  return formatSecondsDuration(seconds, t);
}
