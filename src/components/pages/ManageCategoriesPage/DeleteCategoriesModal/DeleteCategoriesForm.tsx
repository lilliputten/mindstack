'use client';

import React from 'react';
import { useLocale } from 'next-intl';

import { Button } from '@/components/ui/Button';
import { useCategoriesContext } from '@/contexts/CategoriesContext';
import { useAvailableCategories } from '@/features/categories/query-hooks/useAvailableCategories';
import { TAvailableCategory } from '@/features/categories/types';

export interface IDeleteCategoriesFormProps {
  onClose: () => void;
}

export function DeleteCategoriesForm({ onClose }: IDeleteCategoriesFormProps) {
  const locale = useLocale();

  const { selectedCategoryIds, getSelectedCategories, clearSelection } = useCategoriesContext();
  const { allCategories, deleteCategory } = useAvailableCategories({
    // adminMode: true,
  });

  const selected = React.useMemo(
    () => getSelectedCategories(allCategories),
    [getSelectedCategories, allCategories],
  );

  // Helper to get category name from translations or top-level fallback
  const getCategoryName = React.useCallback(
    (category: TAvailableCategory) => {
      const translation = category.translations?.find((t) => t.locale === locale);
      return translation?.name || category.name || 'Unnamed';
    },
    [locale],
  );

  const handleDelete = React.useCallback(async () => {
    try {
      const { deleteCategories } = await import('@/features/categories/actions/deleteCategories');
      const result = await deleteCategories({ ids: selectedCategoryIds });

      if (result?.count) {
        // Delete each category from cache
        for (const id of selectedCategoryIds) {
          deleteCategory(id);
        }
        clearSelection();
        onClose();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[DeleteCategoriesForm] Error deleting categories:', error);
    }
  }, [selectedCategoryIds, deleteCategory, clearSelection, onClose]);

  const handleCancel = React.useCallback(
    (ev: React.MouseEvent) => {
      clearSelection();
      onClose();
      ev.preventDefault();
    },
    [clearSelection, onClose],
  );

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        Are you sure you want to delete {selected.length} categories?
      </p>

      {selected.length > 0 && (
        <div className="max-h-60 overflow-y-auto rounded-lg border p-4">
          <ul className="space-y-2">
            {selected.slice(0, 10).map((category) => (
              <li key={category.id} className="text-sm font-medium">
                {getCategoryName(category)}
              </li>
            ))}
            {selected.length > 10 && (
              <li className="text-sm text-muted-foreground">and {selected.length - 10} more</li>
            )}
          </ul>
        </div>
      )}

      <div className="flex justify-end gap-4">
        <Button variant="destructive" onClick={handleDelete}>
          Delete
        </Button>
        <Button variant="ghost" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
