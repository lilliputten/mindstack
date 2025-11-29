'use server';

import { Prisma } from '@prisma/client';

import { TUserId } from '../types/TUser';
import { getUser } from './getUser';

export async function getUserById(id: TUserId, include?: Prisma.UserInclude) {
  return await getUser({ where: { id }, include });
}
