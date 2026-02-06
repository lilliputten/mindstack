'use server';

import { InputFile } from 'grammy';
import type { InputMediaDocument } from 'grammy/types';

import { LOGGING_CHANNEL_ID } from '@/config/envServer';
import { getErrorText } from '@/lib/helpers';
import { getBot } from '@/features/bot/core/getBot';

import { logData, TLogDataOptions } from './logData';

export async function logJsonData(
  text: string,
  bodyData: Record<string, unknown> | undefined | null,
  jsonObjects: Record<string, unknown> = {},
  opts: TLogDataOptions = {},
) {
  try {
    const bot = opts.bot || getBot();
    // Send the main message first
    const sentMessage = await logData(text, bodyData || undefined, { ...opts, bot });

    // Prepare media group for JSON documents (max 10 items per group)
    const mediaItems: InputMediaDocument[] = [];
    const keys = Object.keys(jsonObjects);

    for (const objId of keys) {
      const data = jsonObjects[objId];
      let jsonString: string | undefined;
      try {
        jsonString = data == undefined ? 'null' : JSON.stringify(data, null, 2) || 'null';
        const buffer = Buffer.from(jsonString, 'utf-8');
        const filename = `${objId}.json`;
        mediaItems.push({
          type: 'document',
          media: new InputFile(buffer, filename),
          // caption: filename,
          // parse_mode: undefined,
        } satisfies InputMediaDocument);
      } catch (error) {
        const message = `${objId}: Error sending the data for the data entry '${objId}' of type '${typeof data}'.`;
        const details = getErrorText(error);
        const comboMsg = [
          message,
          data &&
            typeof data === 'object' &&
            `Object keys: ${Object.keys(data)
              .map((k) => `'${k}'`)
              .join(', ')}.`,
          details,
        ]
          .filter(Boolean)
          .join('\n\n');
        // eslint-disable-next-line no-console
        console.error('[logJsonData]', comboMsg, {
          error,
          data,
        });
        debugger; // eslint-disable-line no-debugger
        mediaItems.push({
          type: 'document',
          media: new InputFile(Buffer.from(comboMsg, 'utf-8'), `${objId}-error.txt`),
          caption: comboMsg,
        } satisfies InputMediaDocument);
      }

      // Telegram limits media groups to 10 items
      if (mediaItems.length >= 10) {
        await bot.api.sendMediaGroup(LOGGING_CHANNEL_ID, mediaItems, {
          reply_to_message_id: sentMessage?.message_id,
        });
        mediaItems.length = 0; // Reset for the next group
      }
    }

    // Send remaining items if any
    if (mediaItems.length > 0) {
      await bot.api.sendMediaGroup(LOGGING_CHANNEL_ID, mediaItems, {
        reply_to_message_id: sentMessage?.message_id,
      });
    }

    return sentMessage;
  } catch (error) {
    const errMsg = getErrorText(error);
    // eslint-disable-next-line no-console
    console.error('[logJsonData]', errMsg, {
      error,
      text,
    });
    debugger; // eslint-disable-line no-debugger
    // NOTE: Don't re-throw errors as it's a non-critical code
    // throw error;
  }
}
