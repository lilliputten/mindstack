import z from 'zod';

import { makeNullableFieldsUndefined } from '@/lib/helpers/zod';
import { TopicSchema } from '@/generated/prisma';

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
});
export const topicFormDataSchema = makeNullableFieldsUndefined(topicFormDataSchemaBase);
export type TTopicFormData = z.infer<typeof topicFormDataSchema>;
