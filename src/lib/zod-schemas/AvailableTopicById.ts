import { z } from 'zod';

export const TopicIncludeParamsSchema = z.object({
  /** Include (limited) workout data */
  includeWorkout: z.coerce.boolean().optional(),
  /** Include stats data */
  includeStats: z.coerce.boolean().optional(),
  /** Include compact user info data (name, email) in the `user` property of result object */
  includeUser: z.coerce.boolean().optional(),
  /** Include related questions */
  includeQuestions: z.coerce.boolean().optional(),
  /** Include related questions count, in `_count: { questions }` */
  includeQuestionsCount: z.coerce.boolean().optional(),
});

export type TTopicIncludeParams = z.infer<typeof TopicIncludeParamsSchema>;

export const GetAvailableTopicByIdParamsSchema = TopicIncludeParamsSchema.extend({
  id: z.coerce.string(), // TTopicId
});

export type TGetAvailableTopicByIdParams = z.infer<typeof GetAvailableTopicByIdParamsSchema>;
