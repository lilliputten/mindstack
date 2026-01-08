'use client';

import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';
import { useCategoriesContext } from '@/contexts/CategoriesContext';
import { deleteCategories } from '@/features/categories/actions/deleteCategories';
import { useAvailableCategories } from '@/features/categories/query-hooks/useAvailableCategories';
import { TAvailableCategory } from '@/features/categories/types';

export function ManageCategoriesTable() {
  const locale = useLocale();
  const router = useRouter();

  const {
    allCategories,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useAvailableCategories({
    // adminMode: true,
  });

  const {
    selectedCategoryIds,
    toggleCategorySelection,
    selectAllCategories,
    clearSelection,
    isCategorySelected,
    areAllCategoriesSelected,
    getSelectedCategories,
  } = useCategoriesContext();

  const hasCategories = !!allCategories.length;

  const [isDeleting, setIsDeleting] = useState(false);

  // Check if all current categories are selected
  const allCurrentSelected =
    allCategories.length > 0 && areAllCategoriesSelected(allCategories.map((c) => c.id));

  const handleSelectAll = useCallback(() => {
    if (allCurrentSelected) {
      clearSelection();
    } else {
      selectAllCategories(allCategories.map((c) => c.id));
    }
  }, [allCurrentSelected, allCategories, selectAllCategories, clearSelection]);

  // Helper to get category name from translations or top-level fallback
  const getCategoryName = useCallback(
    (category: TAvailableCategory) => {
      const translation = category.translations?.find((t) => t.locale === locale);
      return translation?.name || category.name || 'Unnamed';
    },
    [locale],
  );

  const handleDeleteSelected = useCallback(async () => {
    if (selectedCategoryIds.length === 0) return;

    const selected = getSelectedCategories(allCategories);
    const count = selected.length;
    const names = selected.slice(0, 3).map(getCategoryName).join(', ');
    const moreText = count > 3 ? ` and ${count - 3} more` : '';

    if (!confirm(`Are you sure you want to delete ${count} categories: ${names}${moreText}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteCategories({ ids: selectedCategoryIds });
      if (result?.count) {
        toast.success(`${result.count} categories deleted successfully`);
        clearSelection();
        router.refresh();
      }
    } catch (error) {
      toast.error('Error deleting categories');
      // eslint-disable-next-line no-console
      console.error('[ManageCategoriesTable] Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [
    selectedCategoryIds,
    allCategories,
    getSelectedCategories,
    clearSelection,
    router,
    getCategoryName,
  ]);

  const handleAddCategory = useCallback(() => {
    router.push(`/categories/manage/add`);
  }, [router]);

  const handleEditCategory = useCallback(
    (categoryId: string) => {
      router.push(`/categories/manage/${categoryId}/edit`);
    },
    [router],
  );

  const handleDeleteCategory = useCallback(
    async (categoryId: string) => {
      if (!confirm('Are you sure you want to delete this category?')) return;

      setIsDeleting(true);
      try {
        const result = await deleteCategories({ ids: [categoryId] });
        if (result?.count) {
          toast.success(`${result.count} category deleted successfully`);
          router.refresh();
        }
      } catch (error) {
        toast.error('Error deleting category');
        // eslint-disable-next-line no-console
        console.error('[ManageCategoriesTable] Delete single error:', error);
      } finally {
        setIsDeleting(false);
      }
    },
    [router],
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Get translation for a category
  const getCategoryTranslation = useCallback(
    (category: TAvailableCategory) => {
      const translation = category.translations?.find((t) => t.locale === locale);
      return {
        name: translation?.name || category.name,
        description: translation?.description || category.description || '',
        keywords: translation?.keywords || category.keywords || '',
      };
    },
    [locale],
  );

  // Status badge helper
  const getStatusBadge = useCallback((status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      PUBLIC: {
        label: 'Public',
        className: 'bg-green-100 text-green-800',
      },
      SUGGESTED: {
        label: 'Suggested',
        className: 'bg-yellow-100 text-yellow-800',
      },
      HIDDEN: {
        label: 'Hidden',
        className: 'bg-gray-100 text-gray-800',
      },
    };
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100' };
    return (
      <span className={`rounded-full px-2 py-1 text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-10 w-48 animate-pulse rounded bg-muted" />
          <div className="h-10 w-32 animate-pulse rounded bg-muted" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-500">Failed to load categories</p>
        <p className="mt-2 text-sm text-muted-foreground">{String(error)}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        isDev && '__ManageCategoriesTable', // DEBUG
        'space-y-4',
      )}
    >
      {/* Toolbar */}
      {hasCategories && (
        <div
          className={cn(
            isDev && '__ManageCategoriesTable_Toolbar', // DEBUG
            'mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center',
          )}
        >
          <div
            className={cn(
              isDev && '__ManageCategoriesTable_TopSelector', // DEBUG
              'flex items-center gap-4',
            )}
          >
            <Checkbox
              id="select-all"
              checked={allCurrentSelected}
              onCheckedChange={handleSelectAll}
              aria-label="Select all"
            />
            <label htmlFor="select-all" className="cursor-pointer text-sm font-medium">
              {allCurrentSelected ? 'Deselect All' : 'Select All'}
            </label>
            {selectedCategoryIds.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {selectedCategoryIds.length} selected
              </span>
            )}
          </div>

          <div
            className={cn(
              isDev && '__ManageCategoriesTable_TopActions', // DEBUG
              'flex items-center gap-2',
            )}
          >
            {selectedCategoryIds.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                disabled={isDeleting}
              >
                <Icons.Trash className="mr-2 h-4 w-4" />
                Delete Selected
              </Button>
            )}
            <Button size="sm" onClick={handleAddCategory}>
              <Icons.Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      {!hasCategories ? (
        <div className="rounded-lg border-2 border-dashed py-12 text-center">
          <p className="text-muted-foreground">No categories found</p>
          <Button variant="outline" className="mt-4" onClick={handleAddCategory}>
            <Icons.Plus className="mr-2 h-4 w-4" />
            Add First Category
          </Button>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="border-b bg-muted/50">
                  <TableHead id="select" className="w-12 p-4 text-center">
                    {/* Checkbox */}
                  </TableHead>
                  <TableHead id="status" className="w-24 p-4 text-left font-medium">
                    Status
                  </TableHead>
                  <TableHead id="topics" className="w-24 p-4 text-left font-medium">
                    Topics
                  </TableHead>
                  <TableHead id="name" className="p-4 text-left font-medium">
                    Name
                  </TableHead>
                  <TableHead
                    id="description"
                    className="hidden max-w-xs p-4 text-left font-medium lg:table-cell"
                  >
                    Description
                  </TableHead>
                  <TableHead
                    id="keywords"
                    className="hidden p-4 text-left font-medium xl:table-cell"
                  >
                    Keywords
                  </TableHead>
                  <TableHead id="image" className="w-24 p-4 text-center font-medium">
                    Image
                  </TableHead>
                  <TableHead id="created" className="w-40 p-4 text-left font-medium">
                    Created
                  </TableHead>
                  <TableHead id="actions" className="w-16 p-4">
                    {/* Actions */}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allCategories.map((category) => {
                  const translation = getCategoryTranslation(category);
                  const isSelected = isCategorySelected(category.id);

                  return (
                    <TableRow
                      key={category.id}
                      className={`border-b transition-colors hover:bg-muted/50 ${
                        isSelected ? 'bg-muted/30' : ''
                      }`}
                    >
                      <TableCell id={`select-${category.id}`} className="p-4 text-center">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleCategorySelection(category.id)}
                          aria-label={`Select category ${translation.name}`}
                        />
                      </TableCell>
                      <TableCell id={`status-${category.id}`} className="p-4">
                        {getStatusBadge(category.status)}
                      </TableCell>
                      <TableCell id={`topics-${category.id}`} className="p-4">
                        {category._count?.topics || 0}
                      </TableCell>
                      <TableCell id={`name-${category.id}`} className="p-4 font-medium">
                        {translation.name}
                      </TableCell>
                      <TableCell
                        id={`description-${category.id}`}
                        className="hidden max-w-xs truncate p-4 lg:table-cell"
                      >
                        {translation.description || '—'}
                      </TableCell>
                      <TableCell
                        id={`keywords-${category.id}`}
                        className="hidden max-w-xs truncate p-4 xl:table-cell"
                      >
                        {translation.keywords || '—'}
                      </TableCell>
                      <TableCell id={`image-${category.id}`} className="p-4 text-center">
                        {category.imageUrl ? (
                          <Icons.ImageIcon className="mx-auto h-5 w-5 text-green-600" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell
                        id={`created-${category.id}`}
                        className="p-4 text-xs text-muted-foreground"
                      >
                        {category.createdAt
                          ? new Date(category.createdAt).toLocaleDateString(locale)
                          : '—'}
                      </TableCell>
                      <TableCell id={`actions-${category.id}`} className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Icons.MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditCategory(category.id)}>
                              <Icons.Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-red-600"
                            >
                              <Icons.Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Load More */}
          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={handleLoadMore} disabled={isFetchingNextPage}>
                {isFetchingNextPage ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
