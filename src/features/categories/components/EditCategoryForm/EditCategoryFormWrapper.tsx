'use client';

import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';

import { getErrorText } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { DialogDescription, DialogTitle } from '@/components/ui/Dialog';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { manageCategoriesRoute } from '@/config';
import { isDev } from '@/constants';
import { EditCategoryForm, TFormData, useAvailableCategoryById } from '@/features/categories';
import { updateCategory } from '@/features/categories/actions';
import { useAvailableCategories } from '@/features/categories/query-hooks/useAvailableCategories';
import { TAvailableCategory, TCategoryId } from '@/features/categories/types';
import { useGoBack, useMediaQuery, useModalTitle, useUpdateModalVisibility } from '@/hooks';

// const urlPostfix = '/edit';

interface TProps {
  categoryId?: TCategoryId;
  /** Is it a suggestion? Then offer a limited editing mode */
  suggestionMode?: boolean;
  // setAvailableCategoryQuery?: (
  //   availableCategoryQuery?: ReturnType<typeof useAvailableCategoryById>,
  // ) => void;
  setForm?: (form?: UseFormReturn<TFormData>) => void;
  setHandleSubmit?: (handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>) => void;
  setHandleSubmitForm?: (handleSubmitForm: (formData: TFormData) => Promise<unknown>) => void;
}

export function EditCategoryFormWrapper(props: TProps) {
  const {
    categoryId,
    /** Is it a suggestion? Then offer a limited editing mode */
    suggestionMode = true,
    // setAvailableCategoryQuery,
    setForm,
    setHandleSubmit,
    setHandleSubmitForm,
  } = props;

  const routePath = manageCategoriesRoute; // `/categories/manage`;
  // const [isVisible, setVisible] = React.useState(false);
  // const { isMobile } = useMediaQuery();

  const availableCategoryQuery = useAvailableCategoryById({ id: categoryId });
  const { data: initialCategory } = availableCategoryQuery;

  // // AvailableCategoryQuery setter
  // React.useEffect(() => {
  //   if (setAvailableCategoryQuery) {
  //     setAvailableCategoryQuery(availableCategoryQuery);
  //   }
  // }, [availableCategoryQuery, setAvailableCategoryQuery]);

  /** We're using the `ManageCategories.Edit` as a default namespace, and the
   * `ManageCategories.EditNew` as another for category creating
   */
  const t = useT('ManageCategories.Edit');

  const availableCategoriesQuery = useAvailableCategories({ traceId: 'EditCategoryFormWrapper' });

  /* // Check if we're still on the add route
   * const pathname = usePathname();
   * [>* Should the modal be visible? <]
   */
  /** Should the modal be visible? */
  const shouldBeVisible = true; // pathname?.endsWith(urlPostfix);

  // useModalTitle(t('ModalTitle'), shouldBeVisible);
  // useUpdateModalVisibility(setVisible, shouldBeVisible);

  // const goToTheRoute = useGoToTheRoute();
  const goBack = useGoBack(routePath);

  const handleClose = React.useCallback(() => {
    console.log('[EditCategoryFormWrapper:handleClose]');
    debugger;
    goBack();
  }, [goBack]);

  const mutationFn = updateCategory;

  // const saveCategoryMutation = useMutation<TAvailableCategory, Error, TCreateCategoryParams>({
  const saveCategoryMutation = useMutation({
    mutationFn,
    onMutate: async (updatedCategory) => {
      console.error('[EditCategoryFormWrapper:saveCategoryMutation] onMutate', {
        updatedCategory,
      });
    },
    onSuccess: (updatedCategory) => {
      const { id: categoryId } = updatedCategory;
      console.error('[EditCategoryFormWrapper:saveCategoryMutation] onSuccess', {
        categoryId,
        updatedCategory,
      });
      debugger;
      // Update the item to the cached react-query data
      availableCategoriesQuery.updateCategory(updatedCategory);
      // Invalidate all other keys...
      availableCategoriesQuery.invalidateAllKeysExcept([availableCategoriesQuery.queryKey]);
      // TODO: Update/invalidate queries for this category
      // ['available-category', categoryId
    },
    onError: (error, updatedCategory) => {
      const message = t('ToastError');
      const details = getErrorText(error);
      const comboMsg = [message, details].filter(Boolean).join(': ');
      // eslint-disable-next-line no-console
      console.error('[EditCategoryFormWrapper:saveCategoryMutation]', comboMsg, {
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
    <ScrollArea>
      <EditCategoryForm
        handleSaveCategory={handleSaveCategory}
        // className="p-6"
        handleClose={handleClose}
        isPending={saveCategoryMutation.isPending}
        initialCategory={initialCategory}
        suggestionMode={suggestionMode}
        setForm={setForm}
        setHandleSubmit={setHandleSubmit}
        setHandleSubmitForm={setHandleSubmitForm}
      />
    </ScrollArea>
  );
}
