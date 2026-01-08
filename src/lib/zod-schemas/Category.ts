import { z } from 'zod';

import {
  CategoryOrderByWithRelationInputSchema,
  CategoryStatusSchema,
  CategoryTranslationSchema as PrismaCategoryTranslationSchema,
} from '@/generated/prisma';
// Import the actual types
import type { Category, CategoryTranslation } from '@/generated/prisma';

export const CategoryTranslationSchema = PrismaCategoryTranslationSchema;
export type TCategoryTranslation = CategoryTranslation;

// TODO: Derive the schema from the prisma generated ones
export const CreateCategoryParamsSchema = z.object({
  status: CategoryStatusSchema.optional(),
  translations: z.array(CategoryTranslationSchema),
  imageUrl: z.string().nullable().optional(),
});

export type TCreateCategoryParams = z.infer<typeof CreateCategoryParamsSchema>;

export const CreateCategoriesParamsSchema = z.object({
  categories: z.array(CreateCategoryParamsSchema),
});

export type TCreateCategoriesParams = z.infer<typeof CreateCategoriesParamsSchema>;

// TODO: Derive the schema from the prisma generated ones
export const UpdateCategoryParamsSchema = z.object({
  id: z.string().cuid(), // Using cuid() to match Prisma schema
  status: CategoryStatusSchema.optional(),
  translations: z.array(CategoryTranslationSchema).optional(),
  imageUrl: z.string().nullable().optional(),
});

export type TUpdateCategoryParams = z.infer<typeof UpdateCategoryParamsSchema>;

export const UpdateCategoriesParamsSchema = z.object({
  updates: z.array(UpdateCategoryParamsSchema),
});

export type TUpdateCategoriesParams = z.infer<typeof UpdateCategoriesParamsSchema>;

export const GetCategoryByIdParamsSchema = z.object({
  id: z.string(),
  includeUser: z.boolean().optional(),
});

export type TGetCategoryByIdParams = z.infer<typeof GetCategoryByIdParamsSchema>;

export const CategoryIncludeParamsSchema = z.object({
  includeUser: z.boolean().optional(),
});

export type TCategoryIncludeParams = z.infer<typeof CategoryIncludeParamsSchema>;

export const GetAvailableCategoriesParamsSchema = CategoryIncludeParamsSchema.extend({
  categoryIds: z.array(z.string()).optional(),
  skip: z.coerce.number().int().nonnegative().optional(),
  take: z.coerce.number().int().positive().optional(),
  orderBy: z
    .union([CategoryOrderByWithRelationInputSchema.array(), CategoryOrderByWithRelationInputSchema])
    .optional(),
  includeUser: z.boolean().optional(),
  searchText: z.string().optional(),
  status: CategoryStatusSchema.optional(),
  minCreatedAt: z.coerce.date().optional(),
  maxCreatedAt: z.coerce.date().optional(),
  minUpdatedAt: z.coerce.date().optional(),
  maxUpdatedAt: z.coerce.date().optional(),
});

export type TGetAvailableCategoriesParams = z.infer<typeof GetAvailableCategoriesParamsSchema>;

// Delete schemas
export const DeleteCategoryParamsSchema = z.object({
  id: z.string().cuid(),
});

export type TDeleteCategoryParams = z.infer<typeof DeleteCategoryParamsSchema>;

export const DeleteCategoriesParamsSchema = z.object({
  ids: z.array(z.string().cuid()),
});

export type TDeleteCategoriesParams = z.infer<typeof DeleteCategoriesParamsSchema>;

// Results types
export type TGetAvailableCategoriesResults = {
  items: (Category & {
    translations: CategoryTranslation[];
  })[];
  totalCount: number;
};
