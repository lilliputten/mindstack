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

export const formSchema = z
  .object({
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
  })
  .superRefine((data, ctx) => {
    // Check if at least one translation has a valid name
    const translations = data.translations;
    if (translations) {
      const hasValidName = Object.values(translations).some(
        (translation) => translation?.name && translation.name.trim() !== '',
      );

      if (!hasValidName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'At least one name field must be filled across all translations',
          path: ['translations'], // Error will appear at the translations level
        });
      }

      // Validate keywords format for each translation
      for (const [locale, translation] of Object.entries(translations)) {
        if (translation?.keywords && translation.keywords.trim() !== '') {
          const keywordList = translation.keywords.split(',').map((k) => k.trim());
          const validKeywords = keywordList.filter(Boolean);
          if (validKeywords.length === 0 || keywordList.length !== validKeywords.length) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Keywords must be comma-separated words without empty values',
              path: ['translations', locale, 'keywords'],
            });
          }
        }
      }
    }
  });
