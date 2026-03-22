import z from 'zod';

import { QuestionSchema } from '@/generated/prisma';

import { makeNullableFieldsUndefined } from '@/lib/helpers/zod';

const questionFormDataSchemaBase = QuestionSchema.pick({
  text: true, // string
  extraQuery: true,
  isGenerated: true, // boolean
  answersCountRandom: true, // boolean
  answersCountMin: true, // number
  answersCountMax: true, // number
});
export const questionFormDataSchema = makeNullableFieldsUndefined(questionFormDataSchemaBase);
export type TFormData = z.infer<typeof questionFormDataSchema>;

/*
export type TFormData = Pick<
  TQuestionReal,
  | 'text' // string
  | 'isGenerated' // boolean
  | 'answersCountRandom' // boolean
  | 'answersCountMin' // number
  | 'answersCountMax' // number
>;
*/
