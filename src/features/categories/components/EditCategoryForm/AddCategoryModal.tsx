'use client';

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import {
  ensureDate,
  getErrorText,
  invalidateKeysByPrefixes,
  makeQueryKeyPrefix,
  translatedPeriod,
} from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { DialogDescription, DialogTitle } from '@/components/ui/Dialog';
import { Modal } from '@/components/ui/Modal';
import { PageError } from '@/components/shared';
import * as Icons from '@/components/shared/Icons';
import { availableCategoriesRoute } from '@/config';
import { isDev } from '@/constants';
import { createCategory } from '@/features/categories/actions';
import { useMostRecentSuggestedCategory } from '@/features/categories/query-hooks/useMostRecentSuggestedCategory';
import { TAvailableCategory, TCreateCategoryParams } from '@/features/categories/types';
import { useGoBack, useMediaQuery, useModalTitle, useUpdateModalVisibility } from '@/hooks';

import { allowSuggestCategoriesIn } from '../../constants';
import { EditCategoryForm } from './EditCategoryForm';

interface TProps {
  /** Is it a suggestion? Then offer a limited editing mode */
  suggestionMode?: boolean;
  /** Route path for navigation (defaults to manageCategoriesRoute) */
  routePath?: string;
}

export function AddCategoryModal(props: TProps) {
  const {
    /** Is it a suggestion? Then offer a limited editing mode */
    suggestionMode = false,
    /** Route path for navigation */
    routePath = availableCategoriesRoute,
  } = props;

  const [isVisible, setVisible] = React.useState(false);
  const { isMobile } = useMediaQuery();

  const { data: sessionData, status: sessionStatus } = useSession();
  const isUserLoading = sessionStatus === 'loading';
  const user = sessionData?.user;
  const isUser = !!user?.id;
  // const isAdmin = user?.role === 'ADMIN';

  const [saved, setSaved] = React.useState(false);

  /** We're using the `ManageCategories.Edit` as a default namespace, and the
   * `ManageCategories.EditNew` as another for category creating
   */
  const t = useT();

  // const locale = useLocale() as TLocale;

  const queryClient = useQueryClient();

  // const availableCategoriesQuery = useAvailableCategories({ traceId: 'AddCategoryModal' });

  const mostRecentSuggestedCategoryQuery = useMostRecentSuggestedCategory({
    enabled: isUser && suggestionMode && !saved,
  });
  const { data: recentCategory } = mostRecentSuggestedCategoryQuery;

  /** Should the modal be visible? */
  const shouldBeVisible = true; // pathname?.endsWith(urlPostfix);

  const dialogTitle = suggestionMode
    ? t('AddCategoryModal.SuggestDialogTitle')
    : t('AddCategoryModal.DialogTitle');
  useModalTitle(dialogTitle, shouldBeVisible);
  useUpdateModalVisibility(setVisible, shouldBeVisible);

  const goBack = useGoBack(routePath);

  const hideModal = React.useCallback(() => {
    setVisible(false);
    goBack();
  }, [goBack]);

  const mutationFn = createCategory;

  const saveCategoryMutation = useMutation<TAvailableCategory, Error, TCreateCategoryParams>({
    mutationFn,
    onSuccess: (_savedCategory) => {
      setSaved(true);

      const invalidatePrefixes = [
        ['available-categories'],
        // Invalidate the most recent suggested category queries when in suggestion mode
        ['most-recent-suggested-category'],
      ].map(makeQueryKeyPrefix);
      invalidateKeysByPrefixes(queryClient, invalidatePrefixes, [
        // availableCategoriesQuery.queryKey,
      ]);
    },
    onError: (error, newCategory) => {
      const message = t('AddCategoryModal.CantSaveCategory');
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
    (savedCategory: TCreateCategoryParams) => {
      // Toasts are displaying in `EditCategoryForm`
      return saveCategoryMutation.mutateAsync(savedCategory);
    },
    [saveCategoryMutation],
  );

  const hasRecentSuggestion = React.useMemo(() => {
    if (!suggestionMode || !recentCategory) {
      return false;
    }
    const now = Date.now();
    const categoryCreatedAt = new Date(recentCategory.createdAt!).getTime();
    const timeSinceLastSuggestion = now - categoryCreatedAt;
    return timeSinceLastSuggestion < allowSuggestCategoriesIn;
  }, [suggestionMode, recentCategory]);

  // const nextSuggestionDelay = 5 * 60 * 1000; // DEBUG
  const nextSuggestionDelay = React.useMemo(
    () =>
      !saved && hasRecentSuggestion && recentCategory
        ? Date.now() - ensureDate(recentCategory.createdAt).getTime()
        : undefined,
    [saved, hasRecentSuggestion, recentCategory],
  );

  if (!shouldBeVisible) {
    return null;
  }

  const isLoading = isUserLoading;

  return (
    <Modal
      data-suggestion-mode={suggestionMode}
      isVisible={isVisible}
      hideModal={hideModal}
      className={cn(
        isDev && '__AddCategoryModal', // DEBUG
        `__suggestionMode_${String(suggestionMode)}`,
        'flex flex-col gap-0 text-theme-foreground',
        !isMobile && 'max-h-[90vh]',
        saveCategoryMutation.isPending && '[&>*]:pointer-events-none [&>*]:opacity-50',
      )}
    >
      {!isLoading && !isUser ? (
        <PageError
          className={cn(
            isDev && '__AddCategoryModal_UserError', // DEBUG
            'mt-4',
          )}
          title={t('AddCategoryModal.UnauthorizedUserTitle')}
          explanation={t('AddCategoryModal.UnauthorizedUserMessage')}
          // extraActions={extraActions}
          border={false}
        />
      ) : nextSuggestionDelay ? (
        <PageError
          className={cn(
            isDev && '__AddCategoryModal_SuggestionError', // DEBUG
            'mt-4',
          )}
          title={t('AddCategoryModal.ForbiddenSuggestionTitle')}
          explanation={t('AddCategoryModal.ForbiddenSuggestionMessage', {
            time: translatedPeriod(nextSuggestionDelay, t),
          })}
          // extraActions={extraActions}
          border={false}
        />
      ) : (
        <>
          <div
            className={cn(
              isDev && '__AddCategoryModal_Header', // DEBUG
              !isMobile && 'max-h-[90vh]',
              'flex flex-col border-b bg-theme px-8 py-4 text-theme-foreground',
            )}
          >
            <DialogTitle className="DialogTitle">{dialogTitle}</DialogTitle>
            <DialogDescription aria-hidden="true" hidden>
              {dialogTitle}
            </DialogDescription>
          </div>
          {isLoading ? (
            <div
              className={cn(
                isDev && '__AddCategoryModal_SpinnerWrapper', // DEBUG
                'mx-auto p-8',
              )}
            >
              <Icons.Spinner className={cn('size-8 animate-spin')} />
            </div>
          ) : (
            <EditCategoryForm
              handleSaveCategory={handleSaveCategory}
              className="text-foreground"
              handleClose={hideModal}
              isPending={saveCategoryMutation.isPending}
              suggestionMode={suggestionMode}
            />
          )}
        </>
      )}
    </Modal>
  );
}
