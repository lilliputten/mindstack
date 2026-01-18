'use client';

import React from 'react';

import { CategoryStatusSchema } from '@/generated/prisma';

import { useAvailableCategories } from '@/features/categories/query-hooks/useAvailableCategories';

export function useAllPublicCategories({ traceId }: { traceId?: string } = {}) {
  const categoriesQuery = useAvailableCategories({
    traceId,
    status: CategoryStatusSchema.enum.PUBLIC,
    includeTranslations: true,
    all: true,
  });

  return React.useMemo(
    () => ({
      ...categoriesQuery,
      publicCategories: categoriesQuery.allCategories,
    }),
    [categoriesQuery],
  );
}
