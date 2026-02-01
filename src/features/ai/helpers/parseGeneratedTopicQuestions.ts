'use client';

import { MessageContent } from '@langchain/core/messages';

import { getErrorText, parseDangerousJson } from '@/lib/helpers';
import { logData } from '@/features/logger/server-actions';

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
  let rawJson: MessageContent | undefined;
  let rawData: unknown;

  try {
    rawJson = queryData.content;
    // DEBUG: Temporarily monitoring AI generation
    console.log('[parseGeneratedTopicQuestions] Got raw text', {
      rawJson,
      queryData,
    });
    if (typeof rawJson !== 'string') {
      throw new Error(`Received unexpected result type instead of json string: ${typeof rawJson}`);
    }
    rawData = parseDangerousJson(rawJson);
    // Remove empty questions/answers data
    const withoutEmptyObjects = dropEmptyQuestionsAndAnswers(rawData as TQuestionsAndAnswers);
    // TODO: Drop invalid questions ande answers?
    if (!withoutEmptyObjects) {
      throw new Error('Got an invalid (empty) json object');
    }
    const validatedData: TGeneratedQuestions = generatedQuestionsSchema.parse(withoutEmptyObjects);
    // DEBUG: Show parsed data
    console.log('[parseGeneratedTopicQuestions] Parsed validated data', {
      validatedData,
      rawData,
      rawJson,
      queryData,
    });
    return validatedData.questions;
  } catch (error) {
    const humanMsg = 'Can not parse generated topic questions';
    const errDetails = getErrorText(error);
    const __debugData = {
      __LOG_EXPLANATIONS: [
        // Reminders for those who will read the log records later
        'queryData -- The data returned by the AI query (sendAiTextQuery);',
        'rawJson -- The raw json string returned from the AI query (queryData.content);',
        'rawData -- The data that returned from parseDangerousJson;',
        'withoutEmptyObjects -- Cleaned up data (by dropEmptyQuestionsAndAnswers), passed to generatedQuestionsSchema.parse;',
      ],
      errDetails,
      rawJson,
      rawData,
      // error, // NOTE: Error object might be not serializable
      queryData,
    };
    const __idMsg = '[parseGeneratedTopicQuestions] ❌ ' + humanMsg;
    // eslint-disable-next-line no-console
    console.error(__idMsg, { ...__debugData, error });
    debugger; // eslint-disable-line no-debugger
    // Send log message to the telegram logging channel
    logData(__idMsg, __debugData);
    throw new Error(humanMsg);
  }
}
