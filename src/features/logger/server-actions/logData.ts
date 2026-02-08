'use server';

import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';
import { headers } from 'next/headers';

import { debugObj } from '@/lib/debug';
import { formatDateTag, getErrorText, unixEOLs } from '@/lib/helpers';
import { getCurrentUser } from '@/lib/session';
import { versionInfo } from '@/config';
import { isDev } from '@/constants';
import { sendLoggingMessage, TLoggingMessageOptions } from '@/features/bot/actions';

export interface TLogDataOptions extends TLoggingMessageOptions {
  level?: boolean | 'error';
}

export async function logData(idMsg: string, data?: object, opts: TLogDataOptions = {}) {
  const headersObj: ReadonlyHeaders = await headers();
  // DEBUG: Use reduce to convert headers to a plain object
  const allHeaders = Array.from(headersObj.entries()).reduce(
    (acc, [key, value]) => {
      acc[key] = value;
      return acc;
    },
    {} as Record<string, string>,
  );
  const clientIp = allHeaders['x-forwarded-for'] || allHeaders['x-real-ip'];
  const referer = allHeaders.referer;
  const host = allHeaders.host;
  const matchedPath = allHeaders['x-matched-path'];
  const rewrittenPath = allHeaders['x-nextjs-rewritten-path'];
  // const link = allHeaders.link;
  const userAgent = allHeaders['user-agent']?.replace(/\s+/gm, ' ');
  const ipTimezone = allHeaders['x-vercel-ip-timezone'];
  const ipContinent = allHeaders['x-vercel-ip-continent'];
  const ipCountry = allHeaders['x-vercel-ip-country'];
  const ipLatitude = allHeaders['x-vercel-ip-latitude']; // "55.6784"
  const ipLongitude = allHeaders['x-vercel-ip-longitude']; // "37.2652"
  const ipCity = allHeaders['x-vercel-ip-city']?.replace(/%20/g, ' ');
  const intlLocale = allHeaders['x-next-intl-locale'];
  const now = new Date();
  const dateTag = formatDateTag(now); // -> 2026-02-06,16:29:56:731
  // const dateISO = now.toISOString(); // -> 026-02-06T13:32:27.050Z
  const user = await getCurrentUser();
  const dataToSend: Record<string, unknown> = {
    versionInfo,
    dateTag,
    // dateISO,
    isProd: !isDev,
    // PUBLIC_URL,
    host,
    matchedPath,
    rewrittenPath,
    intlLocale,
    clientIp,
    userAgent,
    referer,
    ipTimezone,
    ipContinent,
    ipCountry,
    ipCity,
    ipLatLon:
      [ipLatitude, ipLongitude].filter(Boolean).join(' ').replace(/"/g, '').trim() || undefined, // 55.6784 37.2652
    // allHeaders,
    user,
  };
  if (opts.level) {
    dataToSend.level = opts.level;
  }
  const infoStr = debugObj(dataToSend);
  let dataStr = '';
  if (data) {
    try {
      dataStr = debugObj(data);
    } catch (error) {
      const message = 'Error parsing log data';
      const details = getErrorText(error);
      const comboMsg = [message, details].filter(Boolean).join(': ');
      // eslint-disable-next-line no-console
      console.error('[logData]', comboMsg, {
        error,
        data,
        infoStr,
      });
      debugger; // eslint-disable-line no-debugger
      dataStr = comboMsg;
    }
  }
  const detailsStr =
    // '```\n' +
    [infoStr, dataStr]
      .filter(Boolean)
      .map((s) => s.trim())
      .join('\n');
  // + '\n```'; // .replace(/^/gm, '  ');
  // Show a message in console if the flag specified
  if (opts.level) {
    if (opts.level === 'error') {
      // eslint-disable-next-line no-console
      console.error(infoStr, detailsStr);
    } else {
      // eslint-disable-next-line no-console
      console.log(infoStr, detailsStr);
    }
  }
  return await sendLoggingMessage(idMsg, unixEOLs(detailsStr), { ...opts });
}
