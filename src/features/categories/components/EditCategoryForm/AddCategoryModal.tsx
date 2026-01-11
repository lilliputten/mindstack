'use client';

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getErrorText, invalidateKeysByPrefixes, makeQueryKeyPrefix } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { DialogDescription, DialogTitle } from '@/components/ui/Dialog';
import { Modal } from '@/components/ui/Modal';
import { manageCategoriesRoute } from '@/config';
import { isDev } from '@/constants';
import { createCategory, updateCategory } from '@/features/categories/actions';
import { useAvailableCategories } from '@/features/categories/query-hooks/useAvailableCategories';
import {
  TAvailableCategory,
  TCategoryId,
  TCreateCategoryParams,
} from '@/features/categories/types';
import { useGoBack, useMediaQuery, useModalTitle, useUpdateModalVisibility } from '@/hooks';

import { useAvailableCategoryById } from '../../query-hooks';
import { EditCategoryForm, useTranslations } from './EditCategoryForm';

// const urlPostfix = '/add';

interface TProps {
  // // urlPostfix: string;
  // categoryId?: TCategoryId;
  // [>* Is the dialog in edit or add mode? <]
  // newMode?: boolean;
  /** Is it a suggestion? Then offer a limited editing mode */
  suggestionMode?: boolean;
}

export function AddCategoryModal(props: TProps) {
  const {
    // // urlPostfix, // = '/add',
    // categoryId,
    // DEBUG DATA...
    // [>* Is the dialog in edit or add mode? <]
    // newMode = true,
    /** Is it a suggestion? Then offer a limited editing mode */
    suggestionMode = false,
  } = props;

  const queryClient = useQueryClient();

  const routePath = manageCategoriesRoute; // `/categories/manage`;
  const [isVisible, setVisible] = React.useState(false);
  const { isMobile } = useMediaQuery();

  // const initialCategoryQuery = useAvailableCategoryById({ traceId: 'AddCategoryModal', id: categoryId });
  // const { data: initialCategory } = initialCategoryQuery;

  /** We're using the `ManageCategories.Edit` as a default namespace, and the
   * `ManageCategories.EditNew` as another for category creating
   */
  const t = useT('ManageCategories.Add');

  const availableCategoriesQuery = useAvailableCategories({ traceId: 'AddCategoryModal' });

  /* // Check if we're still on the add route
   * const pathname = usePathname();
   * [>* Should the modal be visible? <]
   */
  /** Should the modal be visible? */
  const shouldBeVisible = true; // pathname?.endsWith(urlPostfix);

  useModalTitle(t('ModalTitle'), shouldBeVisible);
  useUpdateModalVisibility(setVisible, shouldBeVisible);

  // const goToTheRoute = useGoToTheRoute();
  const goBack = useGoBack(routePath);

  const hideModal = React.useCallback(() => {
    setVisible(false);
    goBack();
  }, [goBack]);

  const mutationFn = createCategory;

  const saveCategoryMutation = useMutation<TAvailableCategory, Error, TCreateCategoryParams>({
    mutationFn,
    onMutate: async (newCategory) => {
      console.log('[AddCategoryModal:saveCategoryMutation] onMutate', {
        newCategory,
      });
    },
    onSuccess: (updatedCategory) => {
      const { id: categoryId } = updatedCategory;
      console.log('[AddCategoryModal:saveCategoryMutation] onSuccess', {
        categoryId,
        updatedCategory,
      });
      // Add the created item to the cached react-query data
      availableCategoriesQuery.addNewCategory(updatedCategory, true);
      // Invalidate all other keys...
      availableCategoriesQuery.invalidateAllKeysExcept([availableCategoriesQuery.queryKey]);
      // TODO: Update/invalidate queries for this category
      // ['available-category', categoryId
      const invalidatePrefixes = [
        // Keys to invalidate...
        ['available-category', categoryId],
        ['available-categories'],
      ].map(makeQueryKeyPrefix);
      invalidateKeysByPrefixes(queryClient, invalidatePrefixes, [
        availableCategoriesQuery.queryKey,
      ]);
    },
    onError: (error, newCategory) => {
      const message = t('CantSaveCategory');
      const details = getErrorText(error);
      const comboMsg = [message, details].filter(Boolean).join(': ');
      // eslint-disable-next-line no-console
      console.error('[AddCategoryModal:saveCategoryMutation]', comboMsg, {
        error,
        details,
        newCategory,
      });
      debugger; // eslint-disable-line no-debugger
      toast.error(comboMsg);
    },
  });

  const handleSaveCategory = React.useCallback(
    (updatedCategory: TCreateCategoryParams) => {
      const promise = saveCategoryMutation.mutateAsync(updatedCategory);
      toast.promise(promise, {
        loading: t('ToastLoading'),
        success: (category) => t('ToastSuccess', { name: category.translations?.[0]?.name }),
        error: t('ToastError'),
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
        isDev && '__AddCategoryModal', // DEBUG
        'flex flex-col gap-0 text-theme-foreground',
        saveCategoryMutation.isPending && '[&>*]:pointer-events-none [&>*]:opacity-50',
      )}
    >
      <div
        className={cn(
          isDev && '__AddCategoryModal_Header', // DEBUG
          !isMobile && 'max-h-[90vh]',
          'flex flex-col border-b bg-theme px-8 py-4 text-theme-foreground',
        )}
      >
        <DialogTitle className="DialogTitle">{t('DialogTitle')}</DialogTitle>
        <DialogDescription aria-hidden="true" hidden>
          {t('DialogDescription')}
        </DialogDescription>
      </div>
      <EditCategoryForm
        handleSaveCategory={handleSaveCategory}
        className="p-8 text-foreground"
        handleClose={hideModal}
        isPending={saveCategoryMutation.isPending}
        // initialCategory={initialCategory}
        suggestionMode={suggestionMode}
        newMode
      />
    </Modal>
  );
}
