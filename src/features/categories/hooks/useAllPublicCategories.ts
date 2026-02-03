'use client';

import React from 'react';

import { useAvailableCategories } from '@/features/categories/query-hooks/useAvailableCategories';

export function useAllPublicCategories({
  traceId,
  enabled,
}: { traceId?: string; enabled?: boolean } = {}) {
  const categoriesQuery = useAvailableCategories({
    traceId: traceId || 'useAllPublicCategories',
    // status: CategoryStatusSchema.enum.PUBLIC, // To server-side filter for public entries
    // includeTranslations: true, // USELESS: It's a default option
    all: true,
    enabled,
  });
  return React.useMemo(
    () => ({
      ...categoriesQuery,
      // publicCategories: categoriesQuery.allCategories, // If has filtered with `status: CategoryStatusSchema.enum.PUBLIC`
      // NOTE: Using client-side filtering instead of server-side one to minimize requests
      publicCategories: categoriesQuery.allCategories.filter(({ status }) => status === 'PUBLIC'),
    }),
    [categoriesQuery],
  );
}
