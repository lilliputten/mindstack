'use client';

import { MessageContent } from '@langchain/core/messages';

import { getErrorText, parseDangerousJson } from '@/lib/helpers';
import { logJsonData } from '@/features/logger/server-actions';

import {
  generatedQuestionsSchema,
  TGeneratedQuestion,
  TGeneratedQuestions,
} from '../types/GenerateQuestionsTypes';
import { TAITextQueryData } from '../types/TAITextQueryData';

type TQuestionsAndAnswers = {
  questions?: (undefined | { answers?: (undefined | Record<string, unknown>)[] })[];
};

/** Remove empty questions/answers data */
function dropEmptyQuestionsAndAnswers(data?: TQuestionsAndAnswers) {
  if (!data) {
    return undefined;
  }
  const { questions } = data;
  return {
    ...data,
    questions: questions
      ?.map((q) => {
        if (!q || !Object.keys(q).length) {
          return undefined;
        }
        if (q?.answers) {
          q = {
            ...q,
            answers: q.answers
              ?.map((a) => {
                return a && Object.keys(a).length ? a : undefined;
              })
              .filter(Boolean),
          };
        }
        return q;
      })
      .filter(Boolean),
  };
}

export function parseGeneratedTopicQuestions(queryData: TAITextQueryData): TGeneratedQuestion[] {
  let rawContent: MessageContent | undefined;
  let rawData: unknown;

  try {
    rawContent = queryData.content;
    // DEBUG: Temporarily monitoring AI generation
    console.log('[parseGeneratedTopicQuestions] Step 1: Got raw content', {
      rawContent,
      queryData,
    });
    debugger;
    if (typeof rawContent !== 'string') {
      throw new Error(
        `Received unexpected result type instead of json string: ${typeof rawContent}`,
      );
    }
    rawData = parseDangerousJson(rawContent);
    // DEBUG: Temporarily monitoring AI generation
    console.log('[parseGeneratedTopicQuestions] Step 2: Got parsed raw json data', {
      rawData,
    });
    debugger;
    // Remove empty questions/answers data
    const cleanedData = dropEmptyQuestionsAndAnswers(rawData as TQuestionsAndAnswers);
    // DEBUG: Temporarily monitoring AI generation
    console.log('[parseGeneratedTopicQuestions] Step 3: Got cleaned up data', {
      cleanedData,
    });
    debugger;
    // TODO: Drop invalid questions ande answers?
    if (!cleanedData) {
      throw new Error('Got an invalid (empty) json object');
    }
    const validatedData: TGeneratedQuestions = generatedQuestionsSchema.parse(cleanedData);
    // DEBUG: Show parsed data
    console.log('[parseGeneratedTopicQuestions] Step 4 (final): Got validated data', {
      validatedData,
      // rawData,
      // rawContent,
      // queryData,
    });
    return validatedData.questions;
  } catch (error) {
    const message = '❌ Can not parse generated topic questions';
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
          'cleanedData: Cleaned up data (by dropEmptyQuestionsAndAnswers), passed to generatedQuestionsSchema.parse;',
        ],
      },
      __debugData,
    );
    throw new Error(comboMsg);
  }
}
