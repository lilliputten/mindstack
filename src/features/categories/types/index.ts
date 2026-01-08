import z from 'zod';

import { Category, UserSchema } from '@/generated/prisma';

import { ExtendNullWithUndefined, ReplaceNullWithUndefined } from '@/lib/ts';

export type TCategory = ExtendNullWithUndefined<Category>;
export type TCategoryReal = ReplaceNullWithUndefined<TCategory>;

export type TCategoryId = TCategory['id'];

/** User fields to include with a flag */
export const IncludedUserSelect = {
  id: true as const,
  name: true as const,
  email: true as const,
};
const _IncludedUserSchema = UserSchema.pick(IncludedUserSelect);
export type TIncludedUser = z.infer<typeof _IncludedUserSchema>;

// Add other category-related types here as needed
