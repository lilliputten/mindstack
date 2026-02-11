import { MessageContent } from '@langchain/core/messages';

import { getErrorText, parseDangerousJson } from '@/lib/helpers';
import { logJsonData } from '@/features/logger/server-actions';

import { generatedAnswersSchema, TGeneratedAnswers } from '../types/GenerateAnswersTypes';
import { TAITextQueryData } from '../types/TAITextQueryData';

function dropEmptyAnswers(data?: TGeneratedAnswers) {
  if (!data) {
    return undefined;
  }
  const { answers } = data;
  return {
    ...data,
    answers: answers
      ?.map((a) => {
        return a && Object.keys(a).length ? a : undefined;
      })
      .filter(Boolean),
  };
}

export function parseGeneratedQuestionAnswers(queryData: TAITextQueryData) {
  /** Plain json string from the queryData filed `content` */
  let rawContent: MessageContent | undefined;
  /** Parsed json data */
  let rawData: unknown;
  try {
    const { content } = queryData;
    rawContent = content;
    // DEBUG: Temporarily monitoring AI generation
    // eslint-disable-next-line no-console
    console.log('[parseGeneratedQuestionAnswers] Step 1: Got raw content', {
      rawContent,
      queryData,
    });
    if (typeof rawContent !== 'string') {
      throw new Error(
        `Received unexpected result type instead of json string: ${typeof rawContent}`,
      );
    }
    rawData = parseDangerousJson(rawContent);
    // DEBUG: Temporarily monitoring AI generation
    // eslint-disable-next-line no-console
    console.log('[parseGeneratedQuestionAnswers] Step 2: Got parsed raw data', {
      rawData,
      rawContent,
      queryData,
    });
    if (!rawData) {
      throw new Error('Got an invalid (empty) json object');
    }
    // Remove empty questions/answers data
    const cleanedData = dropEmptyAnswers(rawData as TGeneratedAnswers);
    // DEBUG: Temporarily monitoring AI generation
    // eslint-disable-next-line no-console
    console.log('[parseGeneratedQuestionAnswers] Step 3: Got cleaned up data', {
      cleanedData,
    });
    const validatedData: TGeneratedAnswers = generatedAnswersSchema.parse(rawData);
    // DEBUG: Show parsed data
    // eslint-disable-next-line no-console
    console.log('[parseGeneratedQuestionAnswers] Step 4 (final): Got validated data', {
      validatedData,
    });
    return validatedData.answers;
  } catch (error) {
    const message = '❌ Can not parse generated answers';
    const details = getErrorText(error);
    const comboMsg = [message, details].filter(Boolean).join(': ');
    const __debugData = {
      details,
      rawContent,
      rawData,
      error, // NOTE: Error object might be not serializable
      queryData,
    };
    const __idMsg = '[parseGeneratedTopicQuestions] ' + message;
    // eslint-disable-next-line no-console
    console.error(__idMsg, { ...__debugData, error });
    debugger; // eslint-disable-line no-debugger
    // Send log message to the telegram logging channel
    logJsonData(
      __idMsg,
      {
        __LOG_EXPLANATIONS__: [
          // Reminders for those who will read the log records later
          'queryData: The data returned by the AI query (sendAiTextQuery);',
          'rawContent: The raw json string returned from the AI query (queryData.content);',
          'rawData: The data that returned from parseDangerousJson;',
          'cleanedData: Cleaned up data (by dropEmptyAnswers), passed to generatedAnswersSchema.parse;',
        ],
      },
      __debugData,
    );
    throw new Error(comboMsg);
  }
}
