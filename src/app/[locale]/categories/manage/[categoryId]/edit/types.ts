import z from 'zod';

import { CategorySchema } from '@/generated/prisma';

import { makeNullableFieldsUndefined } from '@/lib/helpers/zod';

const categoryFormDataSchemaBase = CategorySchema.pick({
  status: true,
  imageUrl: true,
});
export const categoryFormDataSchema = makeNullableFieldsUndefined(categoryFormDataSchemaBase);
export type TCategoryFormData = z.infer<typeof categoryFormDataSchema>;
