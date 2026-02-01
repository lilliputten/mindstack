'use server';

import { LOGGING_CHANNEL_ID } from '@/config/envServer';
import { getErrorText } from '@/lib/helpers';
import { getBot } from '@/features/bot/core/getBot';

const limit = 4000; // Keep slightly below 4096 for safety

export async function sendLoggingMessage(text: string) {
  try {
    const bot = getBot();
    // Send large messages splitted
    for (let i = 0; i < text.length; i += limit) {
      const part = text.substring(i, i + limit);
      await bot.api.sendMessage(LOGGING_CHANNEL_ID, part);
    }
  } catch (error) {
    const errMsg = getErrorText(error);
    // eslint-disable-next-line no-console
    console.error('[sendUserAIRequest]', errMsg, {
      error,
      text,
    });
    debugger; // eslint-disable-line no-debugger
    // NOTE: Don't re-throw errors as it's a non-critical code
    // throw error;
  }
}
