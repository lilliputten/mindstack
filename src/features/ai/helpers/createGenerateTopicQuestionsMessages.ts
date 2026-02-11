import { truncateMarkdown } from '@/lib/helpers';

import { TGenerateTopicQuestionsParams } from '../types/GenerateQuestionsTypes';
import { TPlainMessage } from '../types/messages';
import { getAnswersGenerationQuery } from './createGenerateQuestionAnswersMessages';

export function createGenerateTopicQuestionsMessages(
  params: TGenerateTopicQuestionsParams,
): TPlainMessage[] {
  const {
    questionsGenerationType,
    questionsCountMin,
    questionsCountMax,
    answersGenerationType,
    answersCountMin,
    answersCountMax,
    extraText,
    topicText,
    topicDescription,
    topicKeywords,
    existedQuestions,
    langName,
    langCode,
  } = params;

  // const hasExistedQuestions = !!existedQuestions?.length;
  const existedQuestionsText = existedQuestions
    ?.map(({ text }) => '- ' + truncateMarkdown(text, 200))
    .join('\n');

  const generationTypeInstructions = {
    BASIC: 'Generate straightforward, clear questions that test basic understanding.',
    DETAILED: 'Generate comprehensive questions that require detailed knowledge and analysis.',
    MIXED: 'Generate a mix of basic and detailed questions with varying complexity.',
  };

  const answerFieldsText = [
    `- "text" with the answer text in plain text or strict markdown markup (in the same language as the question),`,
    `- "explanation" the reason why this answer is correct or incorrect (markdown allowed),`,
    `- "isCorrect" as a boolean indicating if it is the correct answer.`,
  ].join('\n');

  const langText = [
    // Compose complex language string (`{NAME} ({CODE})` or `{NAME}` or `{CODE}`
    langName,
    langName && langCode ? '(' + langCode.toLocaleUpperCase() + ')' : langCode?.toLocaleUpperCase(),
  ]
    .filter(Boolean)
    .join(' ');

  const requirements = [
    langText
      ? `All texts (except code examples, if any) must be generated in ${langText} language.`
      : `The language of the questions and answers must be derived from the language of the topic.`,
    generationTypeInstructions[questionsGenerationType],
    `Questions should be clear, educational, and relevant to the topic.`,
    `Return ONLY a valid JSON object with a "questions" field containing a list of question objects and a "questionsCount" field with a totally generated questions count.`,
    `For each question, generate answers list (as well-formed JSON objects) in an "answers" field, and an "answersCount" field containing a list of answer objects.`,
    `It's possible to use strict markdown markup in question texts, answer texts and explanations.`,
    `Don't wrap the response in the markdwon code quotes (\`\`\`), return raw json.`,
    `Don't add any content (like notes) outside the JSON object.`,
    getAnswersGenerationQuery(answersGenerationType),
  ].filter(Boolean);
  const requirementsText = requirements.map((s) => '- ' + s).join('\n');

  const systemMessageContent = `You are an expert educational content creator. Generate high-quality questions for a learning topic.

Requirements:

${requirementsText}

Each answer object must have:

${answerFieldsText}

Example format:
{
  "questionsCount": 1,
  "questions": [
    {
      "text": "\${QUESTION_TEXT}",
      "answersCount": 1,
      "answers": ["text": "\${ANSWER_1}", "explanation": "\${EXPLANATION_1}", "isCorrect": \${BOOLEAN_VALUE}]
    }
  ]
}
`;
  const questionsCountText =
    questionsCountMin !== questionsCountMax
      ? `${questionsCountMin}-${questionsCountMax} questions`
      : `${questionsCountMin} question${questionsCountMin !== 1 ? 's' : ''}`;
  const answersCountText =
    answersCountMin !== answersCountMax
      ? `${answersCountMin}-${answersCountMax} answers`
      : `${answersCountMin} answer${answersCountMin !== 1 ? 's' : ''}`;
  const userMessageContent = [
    `Topic: ${topicText}`,
    topicDescription && `Topic description: ${topicDescription}`,
    topicKeywords && `Topic keywords: ${topicKeywords}`,
    `Generate ${questionsCountText} for this topic, with ${answersCountText} per each question.`,
    extraText && `Additional instructions: ${extraText}`,
    existedQuestionsText && `Avoid duplicating existing questions:`,
    existedQuestionsText,
  ]
    .filter(Boolean)
    .join('\n\n');

  // NOTE: Temporarily monitoring AI generation
  // eslint-disable-next-line no-console
  console.log('[createGenerateTopicQuestionsMessages]', {
    systemMessageContent,
    userMessageContent,
  });

  const systemMessage: TPlainMessage = {
    role: 'system',
    content: systemMessageContent,
  };

  const userMessage: TPlainMessage = {
    role: 'user',
    content: userMessageContent,
  };

  return [systemMessage, userMessage];
}
