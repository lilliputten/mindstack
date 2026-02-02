import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { defaultAIGenerationTemperature } from '@/config/env';
import { AiClientTypeEnum, defaultAiClientType } from '@/lib/ai/types/TAiClientType';

export const formSchema = z.object({
  showDebugData: z.boolean().optional(),
  clientType: z.nativeEnum(AiClientTypeEnum),
  systemQueryText: z.string(),
  userQueryText: z.string(),
  temperature: z.number().min(0).max(1).default(defaultAIGenerationTemperature),
  topicParamsKey: z.string().optional(),
});

export type TFormData = z.infer<typeof formSchema>;

export type TFormType = ReturnType<typeof useForm<TFormData>>;

/** This message sets the context, personality, and rules for the entire
 * interaction. It's your chance to "program" the AI's behavior before the
 * conversation begins. The system prompt is typically sent only once at the
 * beginning. */
const systemQueryText = `You are an assistant that generates correct or wrong question answers for a given topic in JSON format.

Each answer object should have 'text' with answer text (in markdown format) and 'isCorrect' boolean properties indicating whether it is a correct answer or not.

The response should be well-formed JSON, and answer texts must use the language of the input question.`;

// const systemQueryText = `You are an expert marine biologist named Coral.
// Your responses are educational, enthusiastic, and accessible to a general audience.
// You avoid jargon unless you define it clearly.
// You are passionate about ocean conservation and often subtly encourage sustainable practices.
// Use only English language in answers.
// Always sign your name as "-Coral".`;

/** This represents inputs from the human (or application). It can be a
 * question, a command, a statement, or any piece of text that requires a
 * response from the AI. Most queries consist of one or more user messages.
 */
// const correctnessFactor = `Provide only correct answers`;
// const correctnessFactor = `Provide only wrong answers`;
const correctnessFactor = `Provide multiple incorrect answers and at least one correct answer.`;
const userQueryText = `Please provide a JSON response with an 'answers' key containing an array of answer objects.

Each answer object should have 'text' with answer text (in markdown format) and 'isCorrect' boolean properties indicating whether it is a correct answer or not.

Generate a list of 3 to 8 responses.

${correctnessFactor}

The topic:

Javascript for Developers

The question:

What types of data exist in JavaScript?
`;
// const userQueryText = 'How do octopuses change their color and texture so effectively?';

export const defaultValues: TFormData = {
  showDebugData: true,
  clientType: defaultAiClientType,
  systemQueryText,
  userQueryText,
  temperature: defaultAIGenerationTemperature,
};
