import { Prisma } from '@prisma/client';

import { TAvailableTopic } from '@/features/topics/types';

import { TTopicUpdateInput, UpdateTopicSchema } from '../types/TUpdateTopicData';

export function getUpdateTopicFromBroaderData(topic: TAvailableTopic) {
  // Prepare the data...
  const parsedTopic = UpdateTopicSchema.parse(topic);
  const data: TTopicUpdateInput = parsedTopic;
  return data;
}
