import { isDev } from '@/config';

export const maxAnswersToGeneration = isDev ? 10 : 10;
export const maxQuestionsToGeneration = isDev ? 10 : 10;
