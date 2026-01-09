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
import {
  TAvailableCategory,
  TCreateCategoriesParams,
  TCreateCategoryParams,
} from '@/features/categories/types';
import {
  useGoBack,
  useGoToTheRoute,
  useMediaQuery,
  useModalTitle,
  useUpdateModalVisibility,
} from '@/hooks';
import { useT } from '@/i18n';

// import { useManageCategoriesStore } from '@/stores/ManageCategoriesStoreProvider';

import { AddCategoryForm } from './AddCategoryForm';

// import { AddCategoryForm } from './AddCategoryForm';

const urlPostfix = '/add';

interface TProps {
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
      name: 'Initial data test',
    },
  ],
};

export function AddCategoryModal(props: TProps) {
  const { suggestionMode } = props;

  // const { manageScope } = useManageCategoriesStore();
  // const routePath = `/categories/${manageScope}`;
  const routePath = manageCategoriesRoute; // `/categories/manage`;
  const [isVisible, setVisible] = React.useState(false);
  const { isMobile } = useMediaQuery();

  const { jumpToNewEntities } = useSettings();
  const t = useT();

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

  useModalTitle(t('AddCategoryModal.ModalTitle'), shouldBeVisible);
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
      // Close the modal first
      setVisible(false);
      if (jumpToNewEntities) {
        // Then navigate to the edit page after a short delay to ensure modal is closed
        // setTimeout(() => goToTheRoute(`${routePath}/${addedCategory.id}`, true), 100);
        goToTheRoute(`${routePath}/${addedCategory.id}`, true);
      } else {
        goBack();
      }
    },
    onError: (error, newCategory) => {
      const message = t('AddCategoryModal.ToastError');
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
      console.log('[AddCategoryModal:handleAddCategory] before', {
        newCategory,
      });
      debugger;
      const promise = addCategoryMutation.mutateAsync(newCategory);
      toast.promise(promise, {
        loading: t('AddCategoryModal.ToastLoading'),
        success: (category) =>
          t('AddCategoryModal.ToastSuccess', { name: category.translations?.[0]?.name }),
        error: t('AddCategoryModal.ToastError'),
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
        <DialogTitle className="DialogTitle">{t('AddCategoryModal.DialogTitle')}</DialogTitle>
        <DialogDescription aria-hidden="true" hidden>
          {t('AddCategoryModal.DialogDescription')}
        </DialogDescription>
      </div>
      <AddCategoryForm
        initialCategory={initialCategory}
        suggestionMode={suggestionMode}
        handleAddCategory={handleAddCategory}
        className="p-8 text-foreground"
        handleClose={hideModal}
        isPending={addCategoryMutation.isPending}
      />
    </Modal>
  );
}
