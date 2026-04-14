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
  const parseMode = opts.parseMode || 'Markdown';
  // Take care of those often case with '[...]' log titles for markdown parse mode (it can be eaten)
  if (title.startsWith('[') && parseMode.toLowerCase().startsWith('markdown')) {
    title = '\\' + title;
  }
  try {
    const bot = opts.bot || getBot();
    // Send large messages by chunks
    const limit = tgMessageLimit - title.length - 20; // Keep slightly below the limit for safety
    const partsCount = Math.ceil(text.length / limit);
    let firstMsg: Message.TextMessage | undefined;
    let len = 0;
    let count = 1;
    do {
      const part = text.substring(len, len + limit);
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
        parse_mode: parseMode,
      });
      if (!firstMsg) {
        firstMsg = msg;
      }
      count++;
      len += limit;
    } while (len < text.length);
    return firstMsg;
  } catch (error) {
    const errMsg = getErrorText(error);
    // eslint-disable-next-line no-console
    console.warn('[sendLoggingMessage]', errMsg, {
      error,
      text,
    });
    // debugger; // eslint-disable-line no-debugger
    // NOTE: Don't re-throw errors as it's a non-critical code
    // throw error;
  }
}
