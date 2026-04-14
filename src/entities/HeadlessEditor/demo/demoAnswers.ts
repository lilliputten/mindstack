import { hourMs } from '@/constants';

import { newItemIdPrefix } from '../constants';
import { T } from './typesAnswer';

const topicId = 'test-topic';
export const demoTopicId = topicId;

const questionId = 'test-question';
export const demoQuestionId = questionId;

const now = Date.now();

export const demoAnswers: T[] = [
  {
    id: 'ans-spec-1',
    questionId,
    text: 'First persisted answer (-1hr)',
    isCorrect: true,
    createdAt: new Date(now - hourMs),
  },
  {
    id: 'ans-spec-2',
    questionId,
    text: 'Second persisted answer (-2hrs)',
    isCorrect: false,
    createdAt: new Date(now - 2 * hourMs),
  },
  {
    id: `${newItemIdPrefix}a1`,
    order: 1,
    isNew: true,
    questionId,
    text: 'New draft answer (ordered)',
    isCorrect: false,
    createdAt: new Date(now),
  },
  {
    id: `${newItemIdPrefix}a2`,
    order: 2,
    isNew: true,
    questionId,
    text: 'Another new answer for comparisons',
    isCorrect: true,
  },
  {
    id: 'ans-old-rich',
    questionId,
    text: 'Answer with **markdown** and explanation field',
    explanation: 'Supporting details for the item.',
    isCorrect: true,
    isGenerated: false,
  },
];
