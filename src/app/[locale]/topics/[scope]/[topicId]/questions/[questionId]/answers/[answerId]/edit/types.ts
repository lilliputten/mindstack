import z from 'zod';

import { makeNullableFieldsUndefined } from '@/lib/helpers/zod';
import { AnswerSchema } from '@/generated/prisma';

export const answerFormDataSchemaBase = AnswerSchema.pick({
  text: true, // string
  explanation: true, // string
  isCorrect: true, // Boolean @default(false) @map("is_correct")
  isGenerated: true, // Boolean @default(false) @map("is_generated")
});
export const answerFormDataSchema = makeNullableFieldsUndefined(answerFormDataSchemaBase);
export type TFormData = z.infer<typeof answerFormDataSchema>;

/*
export type TFormData = Pick<
  TAnswerReal,
  | 'text' // string
  | 'explanation' // string
  | 'isCorrect' // Boolean @default(false) @map("is_correct")
  | 'isGenerated' // Boolean @default(false) @map("is_generated")
>;
*/
