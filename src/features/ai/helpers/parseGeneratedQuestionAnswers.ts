import { MessageContent } from '@langchain/core/messages';

import { getErrorText } from '@/lib/helpers';

import { generatedAnswersSchema, TGeneratedAnswers } from '../types/GenerateAnswersTypes';
import { TAITextQueryData } from '../types/TAITextQueryData';

export function parseGeneratedQuestionAnswers(queryData: TAITextQueryData) {
  let rawJson: MessageContent | undefined;
  let rawData: unknown;
  try {
    const { content } = queryData;
    rawJson = content;
    /* console.log('[parseGeneratedQuestionAnswers] Got raw text', {
     *   rawJson,
     *   queryData,
     * });
     */
    if (typeof rawJson !== 'string') {
      throw new Error(`Received unexpected result type instead of json string: ${typeof rawJson}`);
    }
    rawJson = rawJson.trim();
    // NOTE: Cloudflare might return this: ```json\n{...}\n```
    // rawJson = '```json\n' + rawJson + '\n```';
    const mdStart = '```json';
    const mdEnd = '```';
    if (rawJson.startsWith(mdStart) && rawJson.endsWith(mdEnd)) {
      rawJson = rawJson.substring(mdStart.length, rawJson.length - mdEnd.length).trim();
    }
    rawData = JSON.parse(rawJson);
    // eslint-disable-next-line no-console
    console.log('[parseGeneratedQuestionAnswers] Parsed raw data', {
      rawData,
      rawJson,
      queryData,
    });
    if (!rawData) {
      throw new Error('Got an invalid (empty) json object');
    }
    const validatedData: TGeneratedAnswers = generatedAnswersSchema.parse(rawData);
    // DEBUG
    // eslint-disable-next-line no-console
    console.log('[parseGeneratedQuestionAnswers] Parsed validated data', {
      validatedData,
      rawData,
      rawJson,
      queryData,
    });
    return validatedData.answers;
  } catch (error) {
    const humanMsg = 'Can not parse generated question answers';
    const errDetails = getErrorText(error);
    // const errMsg = [humanMsg, errDetails].filter(Boolean).join(': ');
    // eslint-disable-next-line no-console
    console.error('[parseGeneratedQuestionAnswers] ❌', humanMsg, {
      errDetails,
      error,
      rawJson,
      rawData,
      queryData,
    });
    debugger; // eslint-disable-line no-debugger
    throw new Error(humanMsg);
  }
}
