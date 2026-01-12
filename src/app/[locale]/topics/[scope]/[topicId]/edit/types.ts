import { Control } from 'react-hook-form';
import z from 'zod';

import { TopicSchema } from '@/generated/prisma';

import { makeNullableFieldsUndefined } from '@/lib/helpers/zod';

const topicFormDataSchemaBase = TopicSchema.pick({
  name: true, // string
  description: true, // string
  isPublic: true, // boolean
  keywords: true, // string
  langCode: true, // string (TLanguageId)
  langName: true, // string
  langCustom: true, // boolean
  answersCountRandom: true, // boolean
  answersCountMin: true, // number
  answersCountMax: true, // number
}).extend({
  categoryIds: z.array(z.string()), // .optional(),
});
export const topicFormDataSchema = makeNullableFieldsUndefined(topicFormDataSchemaBase);
export type TTopicFormData = z.infer<typeof topicFormDataSchema>;

export type TTopicFormDataForControl = Control<TTopicFormData>;
