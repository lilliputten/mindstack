'use client';

import React from 'react';

import { CategoryStatusSchema } from '@/generated/prisma';

import { useAvailableCategories } from '@/features/categories/query-hooks/useAvailableCategories';

export function useAllPublicCategories() {
  const categoriesQuery = useAvailableCategories({
    status: CategoryStatusSchema.enum.PUBLIC,
    includeTranslations: true,
  });

  return React.useMemo(
    () => ({
      ...categoriesQuery,
      publicCategories: categoriesQuery.allCategories,
    }),
    [categoriesQuery],
  );
}
