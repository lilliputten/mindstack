import * as z from 'zod';

import { AllowedUserSchema } from '@/generated/prisma';

import { ExtendNullWithUndefined, ReplaceNullWithUndefined } from '@/lib/ts';

import { coercedAllosedUserTypeZType } from './AllowedUserType';

export const allowedUserIdZType = AllowedUserSchema.shape.id;

export const coercedAllowedUserSchema = AllowedUserSchema.extend({
  type: coercedAllosedUserTypeZType,
});
export const coercedNewOrExistedAllowedUserSchema = coercedAllowedUserSchema.extend({
  id: allowedUserIdZType.optional(),
});

// type CoercedAllowedUser1 = Omit<AllowedUser, 'type'> & { type: TAllowedUserType };
type CoercedAllowedUser = z.infer<typeof coercedAllowedUserSchema>;

export type TAllowedUserId = z.infer<typeof allowedUserIdZType>; // TAllowedUser['id'];

// export type TAllowedUserId = AllowedUser['id'];
export type TAllowedUser = ExtendNullWithUndefined<CoercedAllowedUser>;
export type TAllowedUserReal = ReplaceNullWithUndefined<CoercedAllowedUser>;
// export type TAllowedUserData = Omit<TAllowedUserReal, 'createdAt' | 'updatedAt'>;
export type TNewAllowedUser = Omit<TAllowedUser, 'id'>;
// export type TNewOrExistedAllowedUser1 = { id?: TAllowedUserId } & Omit<TAllowedUser, 'id'>;
export type TNewOrExistedAllowedUser = z.infer<typeof coercedNewOrExistedAllowedUserSchema>;
