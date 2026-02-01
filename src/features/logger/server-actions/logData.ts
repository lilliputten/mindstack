'use server';

import { debugObj } from '@/lib/debug';
import { getErrorText, unixEOLs } from '@/lib/helpers';
import { getCurrentUser } from '@/lib/session';
import { versionInfo } from '@/config';
import { isDev } from '@/constants';
import { sendLoggingMessage } from '@/features/bot/actions';

export async function logData(
  idMsg: string,
  data?: object,
  showLog?: boolean | 'error',
): Promise<unknown> {
  const user = await getCurrentUser();
  const infoStr = debugObj({
    versionInfo,
    isDev,
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
