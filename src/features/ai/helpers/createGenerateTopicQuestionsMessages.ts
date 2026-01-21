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
    // topicKeywords,
    existedQuestions,
    langName,
    langCode,
  } = params;

  // const hasExistedQuestions = !!existedQuestions?.length;
  const existedQuestionsText = existedQuestions?.length
    ? existedQuestions.map(({ text }) => '- ' + truncateMarkdown(text, 200)).join('\n')
    : undefined;

  // const descriptionText = topicDescription ? `\nDescription: ${topicDescription}` : '';
  // const extraInstructions = extraText ? `\n\nAdditional instructions: ${extraText}` : '';

  const generationTypeInstructions = {
    BASIC: 'Generate straightforward, clear questions that test basic understanding.',
    DETAILED: 'Generate comprehensive questions that require detailed knowledge and analysis.',
    MIXED: 'Generate a mix of basic and detailed questions with varying complexity.',
  };

  const answerFieldsText = [
    `- "text" with the answer text in plain text or strict markdown markup (in the same language as the question),`,
    `- "explanation" the reason why this answer is correct or incorrect,`,
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
      ? `All texts (except code examples) must be generated in ${langText} language.`
      : `The language of the questions and answers must be derived from the language of the topic.`,
    generationTypeInstructions[questionsGenerationType],
    `Questions should be clear, educational, and relevant to the topic.`,
    `Return ONLY a valid JSON object with a "questions" field containing a list of question objects and "questionsCount" with a number of totally generated questions.`,
    `Each question should be a complete, well-formed question.`,
    `For each question, generate answers in an "answers" field, as a well-formed JSON object with an "answers" field containing a list of answer objects and "answersCount" with a number generated answers.`,
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
      "text": "What is the main concept of...?",
      "answersCount": 1,
      "answers": ["text": "Answer text...", "explanation": "Explanation text", "isCorrect": false]
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
    `Generate ${questionsCountText} for this topic, with ${answersCountText} per each question.`,
    extraText && `Additional instructions: ${extraText}`,
    existedQuestionsText && `Avoid duplicating existing questions:`,
    existedQuestionsText,
  ]
    .filter(Boolean)
    .join('\n\n');

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
