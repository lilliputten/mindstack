'use server';

import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';
import { headers } from 'next/headers';

import { PUBLIC_URL } from '@/config/envServer';
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
  const link = allHeaders.link;
  const dateTag = formatDateTag();
  const user = await getCurrentUser();
  const dataToSend: Record<string, unknown> = {
    versionInfo,
    isProd: !isDev,
    PUBLIC_URL,
    dateTag,
    referer,
    link,
    clientIp,
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
  // Add extra indents
  const detailsStr = (infoStr + '\n' + dataStr).replace(/^/gm, '  ');
  const logStr = unixEOLs(`${idMsg}\n${detailsStr}`);
  // Show a message in console if the flag specified
  if (opts.level) {
    if (opts.level === 'error') {
      // eslint-disable-next-line no-console
      console.error(logStr);
    } else {
      // eslint-disable-next-line no-console
      console.log(logStr);
    }
  }
  return await sendLoggingMessage(logStr, { ...opts });
}
