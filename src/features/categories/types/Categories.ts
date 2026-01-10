import z from 'zod';

import {
  Category,
  CategoryOrderByWithRelationInputSchema,
  CategorySchema,
  CategoryStatusSchema,
  // CategoryStatusType,
  // CategoryTranslation,
  CategoryTranslationSchema,
  UserSchema,
} from '@/generated/prisma';

import { ExtendNullWithUndefined, ReplaceNullWithUndefined } from '@/lib/ts';
import { TGetResultsInfiniteQueryData } from '@/lib/types';

export type TCategory = ExtendNullWithUndefined<Category> & {
  _count?: { topics: number };
};
export type TCategoryReal = ReplaceNullWithUndefined<TCategory>;
// TODO: Extend `TCategory` with `translations` (using zod schema)?

export type TCategoryId = TCategory['id'];

/* // UNUSED
 * [>* User fields to include with a flag <]
 * export const IncludedUserSelect = {
 *   id: true as const,
 *   name: true as const,
 *   email: true as const,
 * } as const;
 * const _IncludedUserSchema = UserSchema.pick(IncludedUserSelect);
 * export type TIncludedUser = z.infer<typeof _IncludedUserSchema>;
 */

// Add other category-related types here as needed

export const defaultCategoryStatus = CategoryStatusSchema.options[0];

export const CreateCategoryTranslationSchema = CategoryTranslationSchema.omit({
  categoryId: true,
}).extend({
  // name: CategoryTranslationSchema.shape.name.optional(), // Name is required for translation creating
  description: CategoryTranslationSchema.shape.description.optional(),
  keywords: CategoryTranslationSchema.shape.keywords.optional(),
});

// TODO: Derive the schema from the prisma generated ones
const CreateCategoryParamsSchemaBase = CategorySchema.omit({
  id: true,
  createdBy: true,
  updatedBy: true,
  createdAt: true,
  updatedAt: true,
});
const CreateCategoryParamsSchema = CreateCategoryParamsSchemaBase.extend({
  status: CategoryStatusSchema.optional(),
  imageUrl: CreateCategoryParamsSchemaBase.shape.imageUrl.optional(),
  translations: z.array(CreateCategoryTranslationSchema).optional(),
});
export type TCreateCategoryTranslation = z.infer<typeof CreateCategoryTranslationSchema>;

// @see CategoryCreateInput, CategoryUpdateInput
export type TCreateCategoryParams = z.infer<typeof CreateCategoryParamsSchema>;

/** A safe category object with mininal data set */
export type TSafeCategory = TCreateCategoryParams;

export const CreateCategoriesParamsSchema = z.object({
  categories: z.array(CreateCategoryParamsSchema),
});

export type TCreateCategoriesParams = z.infer<typeof CreateCategoriesParamsSchema>;

// TODO: Derive the schema from the prisma generated ones
const UpdateCategoryParamsSchemaBase = CategorySchema.omit({
  // id: true, // Id s required for update
  createdBy: true,
  updatedBy: true,
  createdAt: true,
  updatedAt: true,
});
export const UpdateCategoryTranslationSchema = CategoryTranslationSchema.omit({
  categoryId: true,
}).extend({
  name: CategoryTranslationSchema.shape.name.optional(),
  description: CategoryTranslationSchema.shape.description.optional(),
  keywords: CategoryTranslationSchema.shape.keywords.optional(),
});
export type TUpdateCategoryTranslation = z.infer<typeof UpdateCategoryTranslationSchema>;
export const UpdateCategoryParamsSchema = UpdateCategoryParamsSchemaBase.extend({
  status: CategoryStatusSchema.optional(),
  imageUrl: UpdateCategoryParamsSchemaBase.shape.imageUrl.optional(),
  translations: z.array(UpdateCategoryTranslationSchema).optional(),
});

export type TUpdateCategoryParams = z.infer<typeof UpdateCategoryParamsSchema>;

export const UpdateCategoriesParamsSchema = z.object({
  updates: z.array(UpdateCategoryParamsSchema),
});

export type TUpdateCategoriesParams = z.infer<typeof UpdateCategoriesParamsSchema>;

export const GetCategoryByIdParamsSchema = z.object({
  id: z.string().cuid(),
});

export type TGetCategoryByIdParams = z.infer<typeof GetCategoryByIdParamsSchema>;

export const CategoryIncludeParamsSchema = z.object({});

export type TCategoryIncludeParams = z.infer<typeof CategoryIncludeParamsSchema>;

export const GetAvailableCategoriesParamsSchema = CategoryIncludeParamsSchema.extend({
  categoryIds: z.array(z.string()).optional(),
  skip: z.coerce.number().int().nonnegative().optional(),
  take: z.coerce.number().int().positive().optional(),
  orderBy: z
    .union([CategoryOrderByWithRelationInputSchema.array(), CategoryOrderByWithRelationInputSchema])
    .optional(),
  includeTranslations: z.boolean().optional(),
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

/** Extended category, includes some user data, see `getAvailableCategorys` */
export type TAvailableCategory = TCategory & {
  translations?: TCreateCategoryTranslation[];
};

// Results types
export type TGetAvailableCategoriesResults = {
  items: TAvailableCategory[];
  totalCount: number;
};

// Available category queries results data

export type TAvailableCategoriesResultsQueryData = TGetResultsInfiniteQueryData<TCategory>;
