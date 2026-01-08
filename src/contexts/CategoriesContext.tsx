'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import type { TCategory } from '@/features/categories/types';

interface ICategoriesContext {
  /** Selected category IDs for bulk operations */
  selectedCategoryIds: string[];
  /** Toggle category selection */
  toggleCategorySelection: (categoryId: string) => void;
  /** Select all categories */
  selectAllCategories: (categoryIds: string[]) => void;
  /** Clear all selections */
  clearSelection: () => void;
  /** Check if a category is selected */
  isCategorySelected: (categoryId: string) => boolean;
  /** Check if all provided categories are selected */
  areAllCategoriesSelected: (categoryIds: string[]) => boolean;
  /** Get selected categories data */
  getSelectedCategories: (categories: TCategory[]) => TCategory[];
}

const CategoriesContext = createContext<ICategoriesContext | undefined>(undefined);

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const toggleCategorySelection = useCallback((categoryId: string) => {
    setSelectedCategoryIds((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      }
      return [...prev, categoryId];
    });
  }, []);

  const selectAllCategories = useCallback((categoryIds: string[]) => {
    setSelectedCategoryIds(categoryIds);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCategoryIds([]);
  }, []);

  const isCategorySelected = useCallback(
    (categoryId: string) => selectedCategoryIds.includes(categoryId),
    [selectedCategoryIds],
  );

  const areAllCategoriesSelected = useCallback(
    (categoryIds: string[]) =>
      categoryIds.length > 0 && categoryIds.every((id) => selectedCategoryIds.includes(id)),
    [selectedCategoryIds],
  );

  const getSelectedCategories = useCallback(
    (categories: TCategory[]) => categories.filter((c) => selectedCategoryIds.includes(c.id)),
    [selectedCategoryIds],
  );

  const value = useMemo(
    () => ({
      selectedCategoryIds,
      toggleCategorySelection,
      selectAllCategories,
      clearSelection,
      isCategorySelected,
      areAllCategoriesSelected,
      getSelectedCategories,
    }),
    [
      selectedCategoryIds,
      toggleCategorySelection,
      selectAllCategories,
      clearSelection,
      isCategorySelected,
      areAllCategoriesSelected,
      getSelectedCategories,
    ],
  );

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
}

export function useCategoriesContext() {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategoriesContext must be used within a CategoriesProvider');
  }
  return context;
}
