import ms from 'ms';
import { useFormatter } from 'next-intl';

import { dayMs, halfYearMs, hourMs, minuteMs } from '@/constants';
import { defaultLocale, TLocale, useT } from '@/i18n';

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
export function ensureDate(date?: Date | string): Date {
  if (!date) {
    return new Date();
  }
  if (typeof date === 'string') {
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

  /*
   * // DEBUG
   * console.log('[dates:getFormattedRelativeDate]', {
   *   format,
   *   date,
   *   now,
   * });
   * if (typeof date.getTime !== 'function') {
   *   debugger;
   * }
   */
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
    numPad(date.getMonth()),
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

// Utils from precedent.dev
export function timeAgo(timestamp: Date | string, timeOnly?: boolean): string {
  // Workaround for cases when date has been passed as an ISO string
  const now = Date.now();
  const ticks = timestamp ? ensureDate(timestamp).getTime() : now;
  return `${ms(now - ticks)}${timeOnly ? '' : ' ago'}`;
}

/** Create a JavaScript Date object that is N days ago from an existing date */
export function createDateWithDaysDiff(days: number, timestamp?: Date | string) {
  const date = new Date(ensureDate(timestamp));
  date.setDate(date.getDate() + days);
  return date;
}

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

export function useFormattedDuration(seconds: number) {
  const t = useT('duration');
  return formatSecondsDuration(seconds, (key) => t(key.split('.')[1]));
}
