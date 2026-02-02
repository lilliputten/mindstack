'use server';

import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';
import { headers } from 'next/headers';

import { debugObj } from '@/lib/debug';
import { formatDateTag, getErrorText, unixEOLs } from '@/lib/helpers';
import { getCurrentUser } from '@/lib/session';
import { versionInfo } from '@/config';
import { isDev } from '@/constants';
import { sendLoggingMessage } from '@/features/bot/actions';

export async function logData(
  idMsg: string,
  data?: object,
  showLog?: boolean | 'error',
): Promise<unknown> {
  const headersObj: ReadonlyHeaders = await headers();
  // DEBUG: Use reduce to convert headers to a plain object
  const allHeaders = Array.from(headersObj.entries()).reduce(
    (acc, [key, value]) => {
      acc[key] = value;
      return acc;
    },
    {} as Record<string, string>,
  );
  const referer = allHeaders.referer;
  const timesamp = formatDateTag();
  const user = await getCurrentUser();
  const infoStr = debugObj({
    versionInfo,
    timesamp,
    isDev,
    referer,
    user,
  });
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
  if (showLog) {
    if (showLog === 'error') {
      // eslint-disable-next-line no-console
      console.error(logStr);
    } else {
      // eslint-disable-next-line no-console
      console.log(logStr);
    }
  }
  return await sendLoggingMessage(logStr);
}
