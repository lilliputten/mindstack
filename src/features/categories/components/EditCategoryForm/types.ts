import * as z from 'zod';

import { CategoryStatusSchema, CategoryStatusType } from '@/generated/prisma';

import { TLocale } from '@/i18n';

export interface TFormData {
  status: CategoryStatusType;
  imageUrl?: string;
  // NOTE: Use translated values, according to `strictLocalesList`
  translations: {
    [K in TLocale]?: {
      name: string;
      description: string;
      keywords: string;
    };
  };
}

const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_KEYWORDS_LENGTH = 200;

export const formSchema = z.object({
  status: CategoryStatusSchema,
  imageUrl: z.string().optional(),
  translations: z.record(
    z.string(),
    z.object({
      name: z.preprocess(
        (val) => (val === '' ? undefined : val),
        z.string().min(MIN_NAME_LENGTH).max(MAX_NAME_LENGTH).optional(),
      ),
      description: z.string().max(MAX_DESCRIPTION_LENGTH).optional(),
      keywords: z.string().max(MAX_KEYWORDS_LENGTH).optional(),
    }),
  ),
});
