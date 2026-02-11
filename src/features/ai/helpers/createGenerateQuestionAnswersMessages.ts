import { truncateMarkdown } from '@/lib/helpers';

import {
  answersGenerationTypeQueries,
  TAnswerGenerationType,
  TGenerateQuestionAnswersParams,
} from '../types/GenerateAnswersTypes';
import { TPlainMessage } from '../types/messages';

export function getAnswersGenerationQuery(answersGenerationType: TAnswerGenerationType) {
  return answersGenerationTypeQueries[answersGenerationType];
}

export function createGenerateQuestionAnswersMessages(params: TGenerateQuestionAnswersParams) {
  const {
    topicDescription,
    questionText,
    topicText,
    topicKeywords,
    extraText,
    existedAnswers,
    answersCountMin,
    answersCountMax,
    // createdAt,
    answersGenerationType,
    langName,
    langCode,
  } = params;

  const existedAnswersText = existedAnswers
    ?.map(({ text }) => '- ' + truncateMarkdown(text, 200))
    .join('\n');

  const answerFieldsText = [
    `- "text" with the answer text,`,
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
      ? `All texts (except code examples, if any) must be generated in ${langText} language.`
      : `The language of the answers must be derived from the language of the question and the topic.`,
    `Answers should be clear, educational, and relevant to the question.`,
    `Return ONLY a valid JSON object with an "answers" field containing a list of answer objects and an "answersCount" field with a totally generated answers count.`,
    `It's possible to use limited markdown (for code, bold, emphasis, links, lists, etc, don't use headings) in answer texts and explanations.`,
    `Don't use any html tags. Use normal newlines instead of <br>.`,
    `Don't wrap the response in the markdwon code quotes (\`\`\`), return raw json.`,
    `Don't add any content (like notes) outside the JSON object.`,
    getAnswersGenerationQuery(answersGenerationType),
  ].filter(Boolean);
  const requirementsText = requirements.map((s) => '- ' + s).join('\n');

  const systemMessageContent = `You are an expert educational content creator. Generate high-quality answers for a given question.

Requirements:

${requirementsText}

Each answer object must have:

${answerFieldsText}

Example format:
{
  "answersCount": 1,
  "answers": [
    "text": "\${ANSWER_1}",
    "explanation": "\${EXPLANATION_1}",
    "isCorrect": \${BOOLEAN_VALUE}
  ]
}
`;

  const answersCountText =
    answersCountMin !== answersCountMax
      ? `${answersCountMin}-${answersCountMax} answers`
      : `${answersCountMin} answer${answersCountMin !== 1 ? 's' : ''}`;

  const userMessageContent = [
    questionText && `Question: ${questionText}`,
    topicText && `General text: ${topicText}`,
    topicDescription && `Topic description: ${topicDescription}`,
    topicKeywords && `Topic keywords: ${topicKeywords}`,
    `Generate ${answersCountText} for this question.`,
    extraText && `Additional instructions: ${extraText}`,

    existedAnswersText && `Avoid duplicating existing answers:`,
    existedAnswersText,
  ]
    .filter(Boolean)
    .join('\n\n');

  // NOTE: Temporarily monitoring AI generation
  // eslint-disable-next-line no-console
  console.log('[createGenerateQuestionAnswersMessages]', {
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
