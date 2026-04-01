import z from 'zod';

import { AnswerSchema } from '@/generated/prisma';

import { makeNullableFieldsUndefined } from '@/lib/helpers/zod';

export const answerFormDataSchemaBase = AnswerSchema.pick({
  text: true,
  explanation: true,
  isCorrect: true,
  isGenerated: true,
});
export const answerFormDataSchema = makeNullableFieldsUndefined(answerFormDataSchemaBase);
export type TFormData = z.infer<typeof answerFormDataSchema>;
