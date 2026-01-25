'use client';

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';

import { getErrorText, invalidateKeysByPrefixes, makeQueryKeyPrefix } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { TLocale, useT } from '@/i18n';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { PageError } from '@/components/shared';
import { SuccessSplash } from '@/components/shared/SuccessSplash';
import { isDev, manageCategoriesRoute } from '@/config';
import { deleteCategory } from '@/features/categories/actions/deleteCategory';
import { TAvailableCategory, TCategory, TCategoryId } from '@/features/categories/types';
import { useGoBack, useModalTitle, useUpdateModalVisibility } from '@/hooks';

import { getCategoryName } from '../helpers';
import { useAvailableCategoryById } from '../query-hooks';

interface TDeleteCategoryModalProps {
  categoryId?: TCategoryId;
  from?: string;
}

const autoCloseTimeout = 2000;
const invalidateTimeout = 500;

export function DeleteCategoryModal(props: TDeleteCategoryModalProps) {
  const { categoryId } = props;
  const routePath = manageCategoriesRoute; // `/categories/manage`;
  const t = useT();

  const locale = useLocale() as TLocale;

  const shouldBeVisible = true; // pathname.endsWith(urlPostfix);

  const [isVisible, setVisible] = React.useState(true);
  const [hasDeleted, setDeleted] = React.useState(false);

  const queryClient = useQueryClient();

  const availableCategoryQuery = useAvailableCategoryById({
    enabled: !hasDeleted && !!categoryId && shouldBeVisible,
    traceId: 'DeleteCategoryModal',
    id: categoryId,
  });
  const {
    data: deletingCategory,
    isFetched,
    isRefetching,
    isLoading,
    error,
  } = availableCategoryQuery;

  const categoryName = deletingCategory
    ? getCategoryName(deletingCategory, locale, t)
    : 'Unknown category';

  const isCategoryReady = isFetched && !isLoading && !isRefetching;

  const goBack = useGoBack(routePath);

  const hideModal = React.useCallback(() => {
    setVisible(false);
    goBack();
  }, [goBack]);

  if (!categoryId) {
    throw new Error('No category id passed for deletion');
  }

  const dialogTitle = t('DeleteCategoryModal.DialogTitle');
  useModalTitle(dialogTitle);
  useUpdateModalVisibility(setVisible, shouldBeVisible);

  const deleteCategoryMutation = useMutation<TAvailableCategory, Error, TCategory>({
    mutationFn: deleteCategory,
    onSuccess: () => {
      setDeleted(true);
      // Useing delayed invalidation combined with auto close
      setTimeout(() => {
        const invalidatePrefixes = [
          // Keys to invalidate...
          ['available-category', categoryId],
          ['available-categories'],
          // Invalidate the most recent suggested category queries when in suggestion mode
          ['most-recent-suggested-category'],
        ].map(makeQueryKeyPrefix);
        invalidateKeysByPrefixes(queryClient, invalidatePrefixes);
      }, invalidateTimeout);
      setTimeout(() => {
        // Hide modal (go back)
        hideModal();
      }, autoCloseTimeout);
    },
    onError: (error, deletingCategory) => {
      const message = t('DeleteCategoryModal.CannotDeleteCategory');
      const details = getErrorText(error);
      const comboMsg = [message, details].filter(Boolean).join(': ');
      // eslint-disable-next-line no-console
      console.error('[DeleteCategoryModal:deleteCategoryMutation]', comboMsg, {
        error,
        details,
        deletingCategory,
      });
      debugger; // eslint-disable-line no-debugger
    },
  });

  const confirmDeleteCategory = React.useCallback(() => {
    if (!deletingCategory) {
      return Promise.reject(new Error('No category to delete provided'));
    }
    const promise = deleteCategoryMutation.mutateAsync(deletingCategory);
    toast.promise(promise, {
      loading: t('DeleteCategoryModal.DeletingCategory', { categoryName }),
      success: t('DeleteCategoryModal.CategoryDeleted', { categoryName }),
      error: t('DeleteCategoryModal.ErrorDeletingCategory', { categoryName }),
    });
    return promise;
  }, [categoryName, deleteCategoryMutation, deletingCategory, t]);

  if (!categoryName) {
    return null;
  }

  const isPending = deleteCategoryMutation.isPending || !isCategoryReady;

  // TODO: Add this component to storybook as a template for ConfirmModal usage

  return (
    <ConfirmModal
      className={cn(
        isDev && '__DeleteCategoryModal', // DEBUG
      )}
      dialogTitle={dialogTitle}
      confirmButtonVariant="destructive"
      confirmButtonText={t('Delete')}
      confirmButtonBusyText={t('Deleting')}
      cancelButtonText={t('Close')}
      cancelButtonVariant={hasDeleted ? 'theme' : 'ghost'}
      handleConfirm={confirmDeleteCategory}
      handleClose={hideModal}
      isPending={isPending}
      isDone={hasDeleted}
      isVisible={isVisible}
      actionsClassName="justify-center"
    >
      {hasDeleted ? (
        <SuccessSplash title={t('DeleteCategoryModal.CategoryDeletedTitle')}>
          {t('DeleteCategoryModal.CategoryDeletedContent')}
        </SuccessSplash>
      ) : error ? (
        <PageError
          className={cn(
            isDev && '__AuthErrorPage', // DEBUG
          )}
          title={t('DeleteCategoryModal.NotFoundCategoryTitle')}
          error={error}
          noActions
        />
      ) : (
        <div
          className={cn(
            isDev && '__DeleteCategoryModal_Content', // DEBUG
            'content-truncate text-center',
          )}
        >
          {isCategoryReady ? (
            <>{t('DeleteCategoryModal.ConfirmDeleteContent', { categoryName })}</>
          ) : (
            <Skeleton className="mx-auto h-7 w-3/4" />
          )}
        </div>
      )}
    </ConfirmModal>
  );
}
