'use server';

import { getLocale } from 'next-intl/server';

import { BOT_TOKEN } from '@/config/envServer';
import { fetchJson } from '@/lib/helpers/requests';
import { TLocale } from '@/i18n/types';
import { getBotCommands } from '@/features/bot/helpers/getBotCommands';

import { getErrorText } from '../helpers';

// import { botCommands } from '@/features/bot/constants/botCommands';

type TSetWebHookResponse = {
  ok: boolean;
  result: boolean;
  description: string;
};

export async function sendSetCommandsRequest() {
  const locale = await getLocale();
  const botCommands = await getBotCommands(locale as TLocale);
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/setMyCommands`;
  const bodyData = { commands: botCommands };
  try {
    const res = await fetchJson<TSetWebHookResponse>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyData),
    });
    return res;
  } catch (error) {
    const errMsg = getErrorText(error);
    // eslint-disable-next-line no-console
    console.error('[StartBotPage:sendSetCommandsRequest]', errMsg, { error });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
}
