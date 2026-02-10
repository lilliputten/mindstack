'use server';

import { defaultAiClientType } from '@/lib/ai/types/TAiClientType';
import { AIGenerationError } from '@/lib/errors/AIGenerationError';
import { getErrorText } from '@/lib/helpers';
import { getCurrentUser } from '@/lib/session';
import { checkAllowedAIGenerations, saveAIGeneration } from '@/features/ai-generations/actions';
import { logJsonData } from '@/features/logger/server-actions';

import { TAIQueryOptions } from '../types';
import { TPlainMessage } from '../types/messages';
import { TAITextQueryData } from '../types/TAITextQueryData';
import { sendAiTextQuery } from './sendAiTextQuery';

export interface TAIRequestOptions extends TAIQueryOptions {
  topicId?: string;
}

/** Send AI query
 * @param {TPlainMessage[]} messages - Query messages list (user or system)
 * @param {TAIRequestOptions} [opts] - Options
 * @param {string} [opts.topicId] - Optional topicId, related to the query
 * @param {TAiClientType} [opts.clientType] - Optional model type (eg, GigaChat or Cloudflare)
 * @param {boolean | string} [opts.debugData] - Don't make a real API request, return demo data, default (true) or specified by a string value, a file name, relative to a `src/features/questions/actions/` folder
 */
export async function sendUserAIRequest(
  messages: TPlainMessage[],
  opts: TAIRequestOptions = {},
): Promise<TAITextQueryData> {
  const { topicId, clientType = defaultAiClientType, ...restOpts } = opts;

  // Check if user is allowed to perform generations
  await checkAllowedAIGenerations();

  const user = await getCurrentUser();
  if (!user) {
    throw new AIGenerationError('UNATHORIZED');
  }

  const __debugData = {
    opts,
    messages,
  };
  const __idMsg = '[sendUserAIRequest] ℹ️ AI API request: Sending';
  // eslint-disable-next-line no-console
  console.log(__idMsg, { user, ...__debugData });
  await logJsonData(__idMsg, { opts }, __debugData);

  const startTime = new Date();

  try {
    // Call the AI text query
    const queryData = await sendAiTextQuery(messages, { ...restOpts, clientType });

    const endTime = new Date();
    const spentTimeMs = endTime.getTime() - startTime.getTime();
    const spentTokens = queryData.usage_metadata?.total_tokens || 0;

    // Create AIGeneration record
    const generationRecord = await saveAIGeneration({
      // userId: user.id,
      topicId,
      modelUsed: clientType,
      spentTimeMs,
      spentTokens,
      createdAt: startTime,
      finishedAt: endTime,
    });

    const __debugData = {
      opts,
      queryData,
      generationRecord,
    };
    const __idMsg = '[sendUserAIRequest] 🆗 AI API request: Success';
    // eslint-disable-next-line no-console
    console.log(__idMsg, { ...__debugData, user });
    await logJsonData(__idMsg, { opts, generationRecord }, __debugData);

    return queryData;
  } catch (error) {
    const humanMsg = '❌ AI API request: Error';
    const errDetails = getErrorText(error);
    const __debugData = {
      errDetails,
      messages,
      opts,
    };
    const __idMsg = '[sendUserAIRequest] ' + humanMsg;
    // eslint-disable-next-line no-console
    console.error(__idMsg, { ...__debugData, error, user });
    debugger; // eslint-disable-line no-debugger
    // Send log message to the telegram logging channel
    logJsonData(__idMsg, __debugData);
    // Re-throw errors from checkAllowedAIGenerations or other errors
    throw error;
  }
}
