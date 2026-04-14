import { useForm } from 'react-hook-form';
import * as z from 'zod';

export const formSchema = z.object({
  showDebugData: z.boolean().optional(),
  // clientType: z.nativeEnum(AiClientTypeEnum),
  // systemQueryText: z.string(),
  // userQueryText: z.string(),
  // temperature: z.number().min(0).max(1).default(defaultAIGenerationTemperature),
  // topicParamsKey: z.string().optional(),
});

export type TFormData = z.infer<typeof formSchema>;

export type TFormType = ReturnType<typeof useForm<TFormData>>;

/** This message sets the context, personality, and rules for the entire
 * interaction. It's your chance to "program" the AI's behavior before the
 * conversation begins. The system prompt is typically sent only once at the
 * beginning. */
export const defaultValues: TFormData = {
  showDebugData: true,
};
