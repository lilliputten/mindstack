'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getErrorText } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { DialogDescription, DialogTitle } from '@/components/ui/Dialog';
import { Modal } from '@/components/ui/Modal';
import { manageCategoriesRoute } from '@/config';
import { isDev } from '@/constants';
import { useSettings } from '@/contexts/SettingsContext';
import { createCategory } from '@/features/categories/actions';
import { useAvailableCategories } from '@/features/categories/query-hooks/useAvailableCategories';
import { TAvailableCategory, TCreateCategoryParams } from '@/features/categories/types';
import {
  useGoBack,
  useGoToTheRoute,
  useMediaQuery,
  useModalTitle,
  useUpdateModalVisibility,
} from '@/hooks';

import { AddCategoryForm, useTranslations } from './AddCategoryForm';

const urlPostfix = '/add';

interface TProps {
  /** Is the dialog in edit or add mode? */
  editMode?: boolean;
  /** Is it a suggestion? Then offer a limited editing mode */
  suggestionMode?: boolean;
}

// Test data
const initialCategory: TCreateCategoryParams = {
  status: 'PUBLIC',
  imageUrl:
    'https://dtd6kgwmdtb71uj7.public.blob.vercel-storage.com/51uXWRfDCkL._AC_SL1000_-EyzCLFJQLBzdX4fCoYSUi6x8qZKsi6.jpg',
  translations: [
    {
      locale: 'en',
      name: '',
    },
    {
      locale: 'es',
      name: 'Texto en español',
    },
  ],
};

export function AddCategoryModal(props: TProps) {
  const {
    // DEBUG DATA...
    /** Is the dialog in edit or add mode? */
    editMode = true,
    /** Is it a suggestion? Then offer a limited editing mode */
    suggestionMode = true,
  } = props;

  const routePath = manageCategoriesRoute; // `/categories/manage`;
  const [isVisible, setVisible] = React.useState(false);
  const { isMobile } = useMediaQuery();

  const { jumpToNewEntities } = useSettings();

  /** We're using the `ManageCategories.Edit` as a default namespace, and the
   * `ManageCategories.EditNew` as another for category creating
   */
  const t = useTranslations('ManageCategories.Edit', editMode);

  const availableCategoriesQuery = useAvailableCategories({ traceId: 'AddCategoryModal' });

  // Check if we're still on the add route
  const pathname = usePathname();
  /** Should the modal be visible? */
  const shouldBeVisible = pathname?.endsWith(urlPostfix);

  const goToTheRoute = useGoToTheRoute();
  const goBack = useGoBack(routePath);

  const hideModal = React.useCallback(() => {
    setVisible(false);
    goBack();
  }, [goBack]);

  useModalTitle(t('ModalTitle'), shouldBeVisible);
  useUpdateModalVisibility(setVisible, shouldBeVisible);

  const addCategoryMutation = useMutation<TAvailableCategory, Error, TCreateCategoryParams>({
    mutationFn: createCategory,
    onMutate: async (newCategory) => {
      console.error('[AddCategoryModal:addCategoryMutation] onMutate', {
        newCategory,
      });
      // debugger;
    },
    onSuccess: (addedCategory) => {
      console.error('[AddCategoryModal:addCategoryMutation] onSuccess', {
        addedCategory,
      });
      debugger;
      // Add the created item to the cached react-query data
      availableCategoriesQuery.addNewCategory(addedCategory, true);
      // Invalidate all other keys...
      availableCategoriesQuery.invalidateAllKeysExcept([availableCategoriesQuery.queryKey]);
      /* // NOTE: Don't close th modal automatically: there will be a message displayed and it'll be closed manually by the user.
       * // Close the modal first
       * setVisible(false);
       * if (jumpToNewEntities) {
       *   // Then navigate to the edit page after a short delay to ensure modal is closed
       *   // setTimeout(() => goToTheRoute(`${routePath}/${addedCategory.id}`, true), 100);
       *   goToTheRoute(`${routePath}/${addedCategory.id}`, true);
       * } else {
       *   goBack();
       * }
       */
    },
    onError: (error, newCategory) => {
      const message = t('ToastError');
      const details = getErrorText(error);
      const comboMsg = [message, details].filter(Boolean).join(': ');
      // eslint-disable-next-line no-console
      console.error('[AddCategoryModal:addCategoryMutation]', comboMsg, {
        error,
        details,
        newCategory,
      });
      debugger; // eslint-disable-line no-debugger
      toast.error(comboMsg);
    },
  });

  const handleAddCategory = React.useCallback(
    (newCategory: TCreateCategoryParams) => {
      const promise = addCategoryMutation.mutateAsync(newCategory);
      toast.promise(promise, {
        loading: t('ToastLoading'),
        success: (category) => t('ToastSuccess', { name: category.translations?.[0]?.name }),
        error: t('ToastError'),
      });
      return promise;
    },
    [addCategoryMutation, t],
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
        addCategoryMutation.isPending && '[&>*]:pointer-events-none [&>*]:opacity-50',
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
      <AddCategoryForm
        handleAddCategory={handleAddCategory}
        className="p-8 text-foreground"
        handleClose={hideModal}
        isPending={addCategoryMutation.isPending}
        suggestionMode={suggestionMode}
        initialCategory={initialCategory}
        editMode
      />
    </Modal>
  );
}
