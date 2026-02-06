'use server';

import { Message, ParseMode } from 'grammy/types';

import { LOGGING_CHANNEL_ID } from '@/config/envServer';
import { getErrorText } from '@/lib/helpers';
import { getBot } from '@/features/bot/core/getBot';

import { tgMessageLimit } from '../constants';
import { TBot } from '../core/botTypes';

export interface TLoggingMessageOptions {
  bot?: TBot;
  enablePreviews?: boolean;
  parseMode?: ParseMode;
}

export async function sendLoggingMessage(
  title: string,
  text: string,
  opts: TLoggingMessageOptions = {},
) {
  try {
    const bot = opts.bot || getBot();
    let firstMsg: Message.TextMessage | undefined;
    // Send large messages splitted
    const limit = tgMessageLimit - title.length - 20; // Keep slightly below the limit for safety
    const partsCount = Math.ceil(text.length / limit);
    for (let i = 0, count = 1; i < text.length; i += limit, count++) {
      const part = text.substring(i, i + limit);
      const titleStr = [
        // Compose title...
        partsCount > 1 && `\`[${count}/${partsCount}]\``,
        title,
      ]
        .filter(Boolean)
        .join(' ');
      const content = [
        // Compose content...
        titleStr,
        '```\n' + part + '\n```',
      ]
        .filter(Boolean)
        .join('\n');
      const msg = await bot.api.sendMessage(LOGGING_CHANNEL_ID, content, {
        link_preview_options: {
          is_disabled: !opts.enablePreviews,
        },
        parse_mode: opts.parseMode || 'Markdown',
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
