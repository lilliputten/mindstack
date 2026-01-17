'use client';

import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getErrorText, invalidateKeysByPrefixes, makeQueryKeyPrefix } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { DialogDescription, DialogTitle } from '@/components/ui/Dialog';
import { Modal } from '@/components/ui/Modal';
import { PageError } from '@/components/shared';
import { manageCategoriesRoute } from '@/config';
import { isDev } from '@/constants';
import { updateCategory } from '@/features/categories/actions';
import { useAvailableCategories } from '@/features/categories/query-hooks/useAvailableCategories';
import { TAvailableCategory, TCategoryId } from '@/features/categories/types';
import { useGoBack, useMediaQuery, useModalTitle, useUpdateModalVisibility } from '@/hooks';

import { getCategoryName } from '../../helpers';
import { useAvailableCategoryById } from '../../query-hooks';
import { EditCategoryForm } from './EditCategoryForm';
import { EditCategoryFormSkeleton } from './EditCategoryFormSkeleton';

interface TProps {
  categoryId?: TCategoryId;
  /** Is it a suggestion? Then offer a limited editing mode */
  suggestionMode?: boolean;
  from?: string;
}

export function EditCategoryModal(props: TProps) {
  const {
    categoryId,
    /** Is it a suggestion? Then offer a limited editing mode */
    suggestionMode,
  } = props;

  const routePath = manageCategoriesRoute; // `/categories/manage`;
  const [isVisible, setVisible] = React.useState(false);
  const { isMobile } = useMediaQuery();

  const initialCategoryQuery = useAvailableCategoryById({
    traceId: 'EditCategoryModal',
    id: categoryId,
  });
  const {
    data: initialCategory,
    isFetched: isCategoryFetched,
    isLoading: isCategoryLoading,
    error: categoryError,
    isRefetching: isCategoryRefetching,
    refetch: categoryRefetch,
  } = initialCategoryQuery;

  const isCategoryBusy = isCategoryLoading || isCategoryRefetching;
  const isCategoryReady = isCategoryFetched && !!initialCategory;

  /** We're using the `ManageCategories.Edit` as a default namespace, and the
   * `ManageCategories.EditNew` as another for category creating
   */
  const t = useT();

  const availableCategoriesQuery = useAvailableCategories({ traceId: 'EditCategoryModal' });

  /** Should the modal be visible? */
  const shouldBeVisible = true; // pathname?.endsWith(urlPostfix);

  useModalTitle(t('EditCategoryModal.ModalTitle'), shouldBeVisible);
  useUpdateModalVisibility(setVisible, shouldBeVisible);

  const goBack = useGoBack(routePath);

  const hideModal = React.useCallback(() => {
    setVisible(false);
    goBack();
  }, [goBack]);

  const mutationFn = updateCategory;

  // const saveCategoryMutation = useMutation<TAvailableCategory, Error, TCreateCategoryParams>({
  const saveCategoryMutation = useMutation({
    mutationFn,
    onSuccess: (updatedCategory) => {
      // Update the item to the cached react-query data
      availableCategoriesQuery.updateCategory(updatedCategory);

      // Invalidate the most recent suggested category queries when in suggestion mode
      if (suggestionMode) {
        const invalidatePrefixes = [['most-recent-suggested-category']].map(makeQueryKeyPrefix);
        invalidateKeysByPrefixes(availableCategoriesQuery.queryClient, invalidatePrefixes, [
          availableCategoriesQuery.queryKey,
        ]);
      }

      // Invalidate all other keys...
      availableCategoriesQuery.invalidateAllKeysExcept([availableCategoriesQuery.queryKey]);
      // Update/invalidate queries for this category
      const invalidatePrefixes = [
        // Keys to invalidate...
        ['available-category', categoryId],
        ['available-categories'],
      ].map(makeQueryKeyPrefix);
      invalidateKeysByPrefixes(availableCategoriesQuery.queryClient, invalidatePrefixes, [
        availableCategoriesQuery.queryKey,
      ]);
    },
    onError: (error, updatedCategory) => {
      const message = t('EditCategoryModal.CannotSaveCategory');
      const details = getErrorText(error);
      const comboMsg = [message, details].filter(Boolean).join(': ');
      // eslint-disable-next-line no-console
      console.error('[EditCategoryModal:saveCategoryMutation]', comboMsg, {
        error,
        details,
        updatedCategory,
      });
      debugger; // eslint-disable-line no-debugger
      toast.error(comboMsg);
    },
  });

  const handleSaveCategory = React.useCallback(
    (updatedCategory: TAvailableCategory) => {
      const promise = saveCategoryMutation.mutateAsync(updatedCategory);
      toast.promise(promise, {
        loading: t('EditCategoryModal.SavingData'),
        success: (category) =>
          t('EditCategoryModal.DataSaved', { name: getCategoryName(category) }),
        error: t('EditCategoryModal.DataSaveError'),
      });
      return promise;
    },
    [saveCategoryMutation, t],
  );

  if (!shouldBeVisible) {
    return null;
  }

  return (
    <Modal
      isVisible={isVisible}
      hideModal={hideModal}
      className={cn(
        isDev && '__EditCategoryModal', // DEBUG
        'flex flex-col gap-0 text-theme-foreground',
        !isMobile && 'max-h-[90vh]',
        isCategoryBusy && 'opacity-50',
        saveCategoryMutation.isPending && '[&>*]:pointer-events-none [&>*]:opacity-50',
      )}
    >
      <div
        className={cn(
          isDev && '__EditCategoryModal_Header', // DEBUG
          !isMobile && 'max-h-[90vh]',
          'flex flex-col border-b bg-theme px-8 py-4 text-theme-foreground',
        )}
      >
        <DialogTitle className="DialogTitle">
          {t('EditCategoryModal.ManageCategoriesList.DialogTitle')}
        </DialogTitle>
        <DialogDescription aria-hidden="true" hidden>
          {t('EditCategoryModal.ManageCategoriesList.DialogDescription')}
        </DialogDescription>
      </div>
      {categoryError ? (
        <PageError
          className={cn(
            isDev && '__EditCategoryModal_error', // DEBUG
          )}
          title={t('EditCategoryModal.ManageCategoriesList.ErrorLoadingCategoriesData')}
          error={categoryError}
          reset={categoryRefetch}
        />
      ) : !isCategoryReady ? (
        <div className="relative">
          <EditCategoryFormSkeleton />
        </div>
      ) : (
        <EditCategoryForm
          handleSaveCategory={handleSaveCategory}
          className="text-foreground"
          handleClose={hideModal}
          isPending={saveCategoryMutation.isPending}
          initialCategory={initialCategory}
          suggestionMode={suggestionMode}
        />
      )}
    </Modal>
  );
}
