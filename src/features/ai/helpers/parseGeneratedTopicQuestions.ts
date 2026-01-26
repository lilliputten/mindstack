import { MessageContent } from '@langchain/core/messages';

import { getErrorText, parseDangerousJson } from '@/lib/helpers';

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
    // NOTE: Temporarily monitoring AI generation
    console.log('[parseGeneratedTopicQuestions] Got raw text', {
      rawJson,
      queryData,
    });
    if (typeof rawJson !== 'string') {
      throw new Error(`Received unexpected result type instead of json string: ${typeof rawJson}`);
    }
    rawJson = rawJson.trim();
    // NOTE: Cloudflare might return this: ```json\n{...}\n```
    const mdStart = '```json';
    const mdEnd = '```';
    if (rawJson.startsWith(mdStart) && rawJson.endsWith(mdEnd)) {
      rawJson = rawJson.substring(mdStart.length, rawJson.length - mdEnd.length).trim();
    }
    rawData = parseDangerousJson(rawJson);
    // Remove empty questions/answers data
    const withoutEmptyObjects = dropEmptyQuestionsAndAnswers(rawData as TQuestionsAndAnswers);
    // rawData = rawJson && JSON.parse(rawJson);
    // NOTE: Temporarily monitoring AI generation
    console.log('[parseGeneratedTopicQuestions] Parsed raw data', {
      withoutEmptyObjects,
      rawData,
      rawJson,
      queryData,
    });
    if (!withoutEmptyObjects) {
      throw new Error('Got an invalid (empty) json object');
    }
    const validatedData: TGeneratedQuestions = generatedQuestionsSchema.parse(withoutEmptyObjects);
    // DEBUG
    // eslint-disable-next-line no-console
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
    // const errMsg = [humanMsg, errDetails].filter(Boolean).join(': ');
    // eslint-disable-next-line no-console
    console.error('[parseGeneratedTopicQuestions] ❌', humanMsg, {
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
