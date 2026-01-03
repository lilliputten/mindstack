import { z } from 'zod';

import { AllowedUserOrderByWithRelationInputSchema } from '@/generated/prisma';

import { TGetResults } from '@/lib/types/api';
import { TAllowedUser } from '@/features/allowed-users/types';

export const zAllowedUserOrderBy = z
  .union([
    AllowedUserOrderByWithRelationInputSchema.array(),
    AllowedUserOrderByWithRelationInputSchema,
  ])
  .optional();
export type TAllowedUserOrderBy = z.infer<typeof zAllowedUserOrderBy>;

export const GetAllowedUserParamsSchema = z.object({
  type: z.coerce.string().optional(),
  value: z.coerce.string().optional(),
  skip: z.coerce.number().int().nonnegative().optional(),
  take: z.coerce.number().int().positive().optional(),
  /** Sort by parameter, default: `{ updatedAt: 'desc' }`, packed json string */
  // orderBy: AllowedUserFindManyArgsSchema.shape.orderBy, // This approach doesn't work
  orderBy: zAllowedUserOrderBy,
});

export type TGetAllowedUserParams = z.infer<typeof GetAllowedUserParamsSchema>;

export type TGetAllowedUserResults = TGetResults<TAllowedUser>;
