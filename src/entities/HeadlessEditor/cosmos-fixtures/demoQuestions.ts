import { T } from './types';

const topicId = 'test-topic';

export const demoQuestions: T[] = [
  {
    id: 'spec1',
    topicId,
    text: 'Specific question',
  },
  {
    id: 'spec2',
    topicId,
    text: 'following accurately describes the flow',
  },
  {
    id: '__new1',
    order: 1,
    isNew: true,
    topicId,
    text: 'Following accurately describes',
  },
  {
    id: '__new2',
    order: 2,
    isNew: true,
    topicId,
    text: 'Which of the following accurately describes the flow of tasks in the JavaScript event loop',
  },
  {
    id: 'old1',
    topicId,
    text: 'Which of the following accurately describes the flow of tasks in the JavaScript event loop, considering both microtasks and macrotasks?',
    answers: [
      {
        text: 'Microtasks are executed before macrotasks.',
        explanation:
          'This statement is true because microtasks, such as those from Promises and setImmediate, are processed first within each cycle of the event loop before macrotasks, such as setTimeout and I/O operations.',
        isCorrect: true,
      },
      {
        text: 'Macrotasks are always executed before microtasks.',
        explanation:
          'This statement is false because microtasks are processed before macrotasks in each event loop cycle.',
        isCorrect: false,
      },
    ],
  },
  {
    id: 'old2',
    topicId,
    text: 'Second comparison cluster',
  },
  {
    id: '__new3',
    topicId,
    text: 'Another comparison cluster',
  },
];
