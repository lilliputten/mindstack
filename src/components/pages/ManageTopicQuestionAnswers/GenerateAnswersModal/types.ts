import z from 'zod';

import { defaultAIGenerationTemperature } from '@/config/env';
import { AiClientTypeSchema, defaultAiClientType } from '@/lib/ai/types/TAiClientType';
import { generateQuestionAnswersParamsSchema } from '@/features/ai/types/GenerateAnswersTypes';

export const formSchema = generateQuestionAnswersParamsSchema
  .pick({
    debugData: true,
    answersGenerationType: true,
    answersCountMin: true,
    answersCountMax: true,
    extraText: true,
  })
  .extend({
    clientType: AiClientTypeSchema.default(defaultAiClientType),
    temperature: z.number().min(0).max(1).default(defaultAIGenerationTemperature),
  });

export type TFormData = z.infer<typeof formSchema>;
