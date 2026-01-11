'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { useForm, UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

import { getErrorText, removeNullUndefinedValues } from '@/lib/helpers';
import { invalidateKeysByPrefixes, makeQueryKeyPrefix } from '@/lib/helpers/react-query';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { TLocale, useT } from '@/i18n';
import { Card } from '@/components/ui/Card';
import { TActionMenuItem } from '@/components/dashboard/DashboardActions';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import * as Icons from '@/components/shared/Icons';
import { manageCategoriesRoute } from '@/config';
import { isDev } from '@/constants';
import {
  convertCategoryToFormData,
  EditCategoryForm,
  EditCategoryFormWrapper,
  TFormData,
  useAvailableCategories,
  useAvailableCategoryById,
} from '@/features/categories';
import { TAvailableCategory, TCategoryId } from '@/features/categories/types';
import { useGoBack, useGoToTheRoute } from '@/hooks';

interface TEditCategoryPageProps extends TPropsWithClassName {
  categoryId: TCategoryId;
  suggestionMode?: boolean;
}

export function EditCategoryPage(props: TEditCategoryPageProps) {
  const { categoryId, suggestionMode } = props;
  const routePath = manageCategoriesRoute;
  const goBack = useGoBack(routePath);
  const goToTheRoute = useGoToTheRoute();
  // const [isPending, startTransition] = React.useTransition();

  const t = useT();
  const locale = useLocale() as TLocale;

  const [handleSubmit, setHandleSubmit] =
    React.useState<(e?: React.BaseSyntheticEvent) => Promise<void> | undefined>();
  const [handleSubmitForm, setHandleSubmitForm] =
    React.useState<(formData: TFormData) => Promise<unknown> | undefined>();
  const [form, setForm] = React.useState<UseFormReturn<TFormData> | undefined>();

  // const [availableCategoryQuery, setAvailableCategoryQuery] = React.useState<
  //   ReturnType<typeof useAvailableCategoryById> | undefined
  // >();

  const availableCategoryQuery = useAvailableCategoryById({ id: categoryId });
  const availableCategoriesQuery = useAvailableCategories({ traceId: 'EditCategoryPage' });

  // DEBUG: AvailableCategoryQuery checker
  React.useEffect(() => {
    if (handleSubmitForm) {
      console.log('[EditCategoryPage:HandleSubmitForm checker]', {
        handleSubmitForm,
      });
      debugger;
    }
  }, [handleSubmitForm]);
  // DEBUG: AvailableCategoryQuery checker
  React.useEffect(() => {
    if (handleSubmit) {
      console.log('[EditCategoryPage:HandleSubmit checker]', {
        handleSubmit,
      });
      // debugger;
    }
  }, [handleSubmit]);
  // DEBUG: AvailableCategoryQuery checker
  React.useEffect(() => {
    if (form) {
      console.log('[EditCategoryPage:Form checker]', {
        form,
      });
    }
  }, [form]);
  // DEBUG: vailableCategoryQuery checker
  React.useEffect(() => {
    if (availableCategoryQuery) {
      console.log('[EditCategoryPage:AvailableCategoryQuery checker]', {
        availableCategoryQuery,
      });
    }
  }, [availableCategoryQuery]);

  /* // UNUSED: handleCancel
   * const handleCancel = React.useCallback(
   *   (ev: React.MouseEvent) => {
   *     ev.preventDefault();
   *     goBack();
   *   },
   *   [goBack],
   * );
   */

  const isBusy = form?.formState.isSubmitting || form?.formState.isLoading;
  const isSubmitEnabled = !isBusy && form?.formState.isDirty && form?.formState.isValid;

  // const handleSubmit = form?.handleSubmit;

  const handleReload = React.useCallback(() => {
    availableCategoryQuery
      ?.refetch()
      .then((res) => {
        const category: TAvailableCategory | undefined = res.data;
        if (category) {
          // const cleanedCategory = removeNullUndefinedValues(category);
          const convertedCategory = convertCategoryToFormData(category, { locale, suggestionMode });
          form?.reset(convertedCategory);
          // Add the created item to the cached react-query data
          availableCategoriesQuery.updateCategory(category);
          // Invalidate all other keys...
          availableCategoriesQuery.invalidateAllKeysExcept([availableCategoriesQuery.queryKey]);
        }
      })
      .catch((error) => {
        const message = 'Cannot update category data';
        const details = getErrorText(error);
        // eslint-disable-next-line no-console
        console.error('[EditCategoryPage:handleReload]', [message, details].join(': '), {
          message,
          details,
          error,
        });
        debugger; // eslint-disable-line no-debugger
        toast.error(message);
      });
  }, [availableCategoryQuery, locale, suggestionMode, form, availableCategoriesQuery]);

  // Delete Category Modal
  const handleDeleteCategory = React.useCallback(() => {
    const url = `${routePath}/delete?categoryId=${categoryId}&from=EditCategoryPage`;
    goToTheRoute(url);
  }, [goToTheRoute, routePath, categoryId]);

  const actions: TActionMenuItem[] = React.useMemo(
    () => [
      {
        id: 'Back',
        content: 'Back',
        icon: Icons.ArrowLeft,
        visibleFor: 'sm',
        onClick: goBack,
      },
      {
        id: 'Reload',
        content: 'Reload',
        title: 'Reload the data from the server',
        icon: Icons.Refresh,
        visibleFor: 'lg',
        pending: availableCategoryQuery?.isRefetching,
        onClick: handleReload,
      },
      {
        id: 'Reset',
        content: 'Reset',
        title: 'Reset form fields to original values',
        icon: Icons.Close,
        visibleFor: 'lg',
        hidden: !form?.formState.isDirty,
        onClick: form?.reset,
      },
      {
        id: 'Delete',
        content: 'Delete category',
        variant: 'destructive',
        icon: Icons.Trash,
        visibleFor: 'lg',
        onClick: handleDeleteCategory,
      },
      {
        id: 'Save',
        content: 'Save',
        variant: 'success',
        icon: Icons.Save,
        visibleFor: 'sm',
        pending: isBusy,
        disabled: !isSubmitEnabled,
        onClick: handleSubmit,
      },
    ],
    [
      availableCategoryQuery,
      form,
      goBack,
      handleDeleteCategory,
      handleSubmit,
      isBusy,
      isSubmitEnabled,
      handleReload,
    ],
  );

  return (
    <>
      <DashboardHeader
        heading="Edit Category Properties"
        // text="Extra long testing text string for text wrap and layout test"
        className={cn(
          isDev && '__EditCategoryPage_DashboardHeader', // DEBUG
          'mx-6',
        )}
        actions={actions}
      />
      <Card
        className={cn(
          isDev && '__EditCategoryPage_Card', // DEBUG
          'relative mx-6 flex flex-1 flex-col overflow-hidden py-6 xl:col-span-2',
        )}
      >
        <EditCategoryFormWrapper
          categoryId={categoryId}
          setHandleSubmit={setHandleSubmit}
          setHandleSubmitForm={setHandleSubmitForm}
          setForm={setForm}
        />
      </Card>
    </>
  );
}
