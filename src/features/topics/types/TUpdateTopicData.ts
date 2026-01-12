import { Prisma } from '@prisma/client';
import z from 'zod';

import { Category, Topic, TopicSchema } from '@/generated/prisma';

export interface TTopicUpdateInput extends Prisma.TopicUpdateInput {
  id: Topic['id'];
}

export interface TUpdateTopicParams extends TTopicUpdateInput {
  categoryIds?: Category['id'][];
}

const OmitAutoFields = {
  // id: true as const, // z.string().cuid(),
  // name: true as const, // z.string(),
  // description: true as const, // z.string().nullable(),
  // isPublic: true as const, // z.boolean().nullable(),
  // keywords: true as const, // z.string().nullable(),
  // langCode: true as const, // z.string().nullable(),
  // langName: true as const, // z.string().nullable(),
  // langCustom: true as const, // z.boolean().nullable(),
  // answersCountRandom: true as const, // z.boolean().nullable(),
  // answersCountMin: true as const, // z.number().int().nullable(),
  // answersCountMax: true as const, // z.number().int().nullable(),

  // Remove automatically updated fields
  createdAt: true as const, // z.coerce.date(),
  updatedAt: true as const, // z.coerce.date(),
  userId: true as const, // z.string(),
};
export const UpdateTopicSchema = TopicSchema.omit(OmitAutoFields)
  .partial()
  .extend({ id: z.string() });
export type TUpdateTopic = z.infer<typeof UpdateTopicSchema>;
