'use server';

import { Message } from 'grammy/types';

import { LOGGING_CHANNEL_ID } from '@/config/envServer';
import { getErrorText } from '@/lib/helpers';
import { getBot } from '@/features/bot/core/getBot';

import { tgMessageLimit } from '../constants';
import { TBot } from '../core/botTypes';

const limit = tgMessageLimit; // Keep slightly below 4096 for safety

export interface TLoggingMessageOptions {
  bot?: TBot;
  enablePreviews?: boolean;
}

export async function sendLoggingMessage(text: string, opts: TLoggingMessageOptions = {}) {
  try {
    const bot = opts.bot || getBot();
    let firstMsg: Message.TextMessage | undefined;
    // Send large messages splitted
    for (let i = 0; i < text.length; i += limit) {
      const part = text.substring(i, i + limit);
      const msg = await bot.api.sendMessage(LOGGING_CHANNEL_ID, part, {
        link_preview_options: {
          is_disabled: !opts.enablePreviews,
        },
      });
      if (!firstMsg) {
        firstMsg = msg;
      }
    }
    return firstMsg;
  } catch (error) {
    const errMsg = getErrorText(error);
    // eslint-disable-next-line no-console
    console.error('[sendLoggingMessage]', errMsg, {
      error,
      text,
    });
    debugger; // eslint-disable-line no-debugger
    // NOTE: Don't re-throw errors as it's a non-critical code
    // throw error;
  }
}
