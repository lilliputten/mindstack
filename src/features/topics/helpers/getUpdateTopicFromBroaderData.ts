import { TAvailableTopic } from '@/features/topics/types';

import { TUpdateTopicParams, UpdateTopicSchema } from '../types/TUpdateTopicData';

export function getUpdateTopicFromBroaderData(topic: TAvailableTopic) {
  // Prepare the data...
  const parsedTopic = UpdateTopicSchema.parse(topic);
  const data: TUpdateTopicParams = parsedTopic;
  return data;
}
