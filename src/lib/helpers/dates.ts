import ms from 'ms';
import { useFormatter } from 'next-intl';

import { defaultLocale, TLocale, useT } from '@/i18n';
import { dayMs, halfYearMs, hourMs, minuteMs } from '@/constants';

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

type TIntlTranslator = (key: string) => string;

/** Use relative date format if lesser time passed */
const relativeDateLimit = dayMs;
// export const halfMonthLimit = dayMs * 15;

/** Workaround for cases when date has been passed as an ISO string or en empty value (now) */
export function ensureDate(date?: Date | string | number): Date {
  if (!date) {
    return new Date();
  }
  if (typeof date === 'string' || typeof date === 'number') {
    return new Date(date);
  }
  return date;
}

/** Return numeric date epochs difference. The returned value is positive if 'b' is the later than 'a'. Returns zero if the dates are equal. */
export function compareDates(a: Date | string, b: Date | string) {
  // Workaround for cases when date has been passed as an ISO string
  a = ensureDate(a);
  b = ensureDate(b);

  return b.getTime() - a.getTime();
}

export function getFormattedRelativeDate(
  format: ReturnType<typeof useFormatter>,
  date?: Date | string,
  now?: Date | string,
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

export function useFormattedRelativeDate(date?: Date | string, now?: Date | string) {
  // Workaround for cases when date has been passed as an ISO string
  date = ensureDate(date);
  now = ensureDate(now);

  const format = useFormatter();
  return getFormattedRelativeDate(format, date, now);
}

export function getNativeFormattedRelativeDate(
  date: Date | string = new Date(),
  now: Date | string = new Date(),
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

export function formatDateTag(input?: string | number | Date, omitTime: boolean = false): string {
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

export function formatDate(input: string | number | Date, locale: TLocale = defaultLocale): string {
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
export function timeAgo(timestamp: Date | string | number | undefined, timeOnly?: boolean): string {
  const now = Date.now();
  const ticks = !timestamp
    ? now
    : typeof timestamp === 'number'
      ? timestamp
      : ensureDate(timestamp).getTime();
  return `${ms(now - ticks)}${timeOnly ? '' : ' ago'}`;
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
export function stringifyPeriod(timestamp?: Date | string | number): string {
  if (!timestamp) {
    return '';
  }
  const ticks =
    typeof timestamp === 'number' ? timestamp : Date.now() - ensureDate(timestamp).getTime();
  if (!ticks) {
    return '';
  }
  return ms(ticks);
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
 *     'duration.seconds': ' segundos',
 *     'duration.minutes': ' minutos',
 *     'duration.hours': ' horas',
 *     'duration.days': ' días',
 *     'duration.milliseconds': ' milisegundos',
 *   };
 *   return translations[key] || key;
 * };
 * translatedPeriod(Date.now() - 30 * 1000, mockT); // Returns "30 segundos"
 *
 * @example
 * // Translating compound times
 * translatedPeriod(Date.now() - (2 * 60 + 30) * 1000, mockT); // Returns "3 minutos" (rounded up)
 */
export function translatedPeriod(timestamp?: Date | string | number, t?: TIntlTranslator): string {
  const str = stringifyPeriod(timestamp);

  // Define postfix translations mapping
  const postfixTranslations: Record<string, string> = {
    ms: t?.('duration.milliseconds') || 'ms',
    s: t?.('duration.seconds') || 's',
    m: t?.('duration.minutes') || 'm',
    h: t?.('duration.hours') || 'h',
    d: t?.('duration.days') || 'd',
  };

  // Parse the time string and translate postfixes
  // The format is like "3h 30m" or "2d" or "45s"
  const parts = str.split(' ');

  const translatedParts = parts.map((part) => {
    // Extract the numeric value and the postfix
    const match = part.match(/^(\d+\.?\d*)([a-zA-Z]+)$/);
    if (match) {
      const value = match[1];
      const postfix = match[2];
      const translatedPostfix = postfixTranslations[postfix] || postfix;
      return `${value}${translatedPostfix}`;
    }
    return part; // Return unchanged if no match
  });

  return translatedParts.join(' ');
}

/** Create a JavaScript Date object that is N days ago from an existing date */
export function createDateWithDaysDiff(days: number, timestamp?: Date | string) {
  const date = new Date(ensureDate(timestamp));
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Formats a duration in seconds into a human-readable string with time units.
 *
 * Unlike timeAgo which compares a timestamp to the current time, this function
 * takes a raw number of seconds and formats it into the largest applicable units.
 *
 * @param seconds - The duration in seconds to format. Can be:
 *   - A positive number: Formatted into the largest applicable time units
 *   - Zero: Returns "0s"
 *   - Negative: Treated as zero (returns "0s")
 *
 * @param t - Optional translation function that receives keys like 'duration.seconds',
 *   'duration.minutes', 'duration.hours', 'duration.days'
 *   and should return the translated string.
 *   If not provided, returns the default abbreviations (d, h, m, s).
 *
 * @returns A human-readable duration string.
 *   - Only includes units with non-zero values (except always includes seconds if total is < 1 minute)
 *   - Example output: "1d 2h 30m 45s", "5m 30s", "45s", "0s"
 *
 * @example
 * // Basic usage without translation
 * formatSecondsDuration(90061); // Returns "1d 1h 1m 1s"
 * formatSecondsDuration(125); // Returns "2m 5s"
 * formatSecondsDuration(45); // Returns "45s"
 *
 * @example
 * // With translation function
 * const mockT = (key: string) => {
 *   const translations = {
 *     'duration.seconds': ' segundos',
 *     'duration.minutes': ' minutos',
 *     'duration.hours': ' horas',
 *     'duration.days': ' días',
 *   };
 *   return translations[key] || key;
 * };
 * formatSecondsDuration(3725, mockT); // Returns "1 horas 2 minutos 5 segundos"
 *
 * @example
 * // Edge cases
 * formatSecondsDuration(0); // Returns "0s"
 * formatSecondsDuration(86400); // Returns "1d" (exactly 24 hours shows only days)
 * formatSecondsDuration(60); // Returns "1m" (exactly 1 minute shows only minutes)
 */
export function formatSecondsDuration(seconds: number = 0, t?: TIntlTranslator): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}${t?.('duration.days') || 'd'}`);
  if (hours > 0) parts.push(`${hours}${t?.('duration.hours') || 'h'}`);
  if (minutes > 0) parts.push(`${minutes}${t?.('duration.minutes') || 'm'}`);
  if (remainingSeconds > 0 || parts.length === 0)
    parts.push(`${remainingSeconds}${t?.('duration.seconds') || 's'}`);

  return parts.join(' ');
}

/** A hook wrapper for `formatSecondsDuration` date helper */
export function useFormattedDuration(seconds: number) {
  const t = useT('duration');
  return formatSecondsDuration(seconds, (key) => t(key.split('.')[1]));
}
