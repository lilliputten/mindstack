'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getErrorText } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { DialogDescription, DialogTitle } from '@/components/ui/Dialog';
import { Modal } from '@/components/ui/Modal';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { SkeletonPopup } from '@/components/ui/SkeletonPopup';
import { StableMountWrapper } from '@/components/hoc/withStableMount';
import { isDev } from '@/constants';
import { addNewTopic } from '@/features/topics/actions/addNewTopic';
import { TAvailableTopic, TNewTopic, TTopicId } from '@/features/topics/types';
import { useAvailableTopicsByScope, useDocumentTitle, useGoBack, useMediaQuery } from '@/hooks';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

import { AddTopicForm } from './AddTopicForm';
import { AddTopicFormSkeleton } from './AddTopicFormSkeleton';

const urlPostfix = '/add';

export function AddTopicModal() {
  const { manageScope } = useManageTopicsStore();
  const routePath = `/topics/${manageScope}`;
  const [addedTopicId, setAddedTopicId] = React.useState<TTopicId | undefined>();
  const { isMobile } = useMediaQuery();

  const t = useT();

  const availableTopicsQuery = useAvailableTopicsByScope({ manageScope });

  // Check if we're still on the add route
  const pathname = usePathname();
  /** Should the modal be visible? */
  const shouldBeVisible = pathname?.endsWith(urlPostfix);

  // const goToTheRoute = useGoToTheRoute();
  const goBack = useGoBack(routePath);

  const hideModal = React.useCallback(() => {
    goBack();
  }, [goBack]);

  const title = t('AddNewTopic');
  useDocumentTitle(title, shouldBeVisible);

  const addTopicMutation = useMutation<TAvailableTopic, Error, TNewTopic>({
    mutationFn: addNewTopic,
    onSuccess: (addedTopic) => {
      // TODO: Issue #66: Verify all react-query invalidation
      // Add the created item to the cached react-query data
      availableTopicsQuery.addNewTopic(addedTopic, true);
      // Invalidate all other keys...
      availableTopicsQuery.invalidateAllKeysExcept([availableTopicsQuery.queryKey]);

      // Set finished status (set a created record id to show the final dialog)...
      setAddedTopicId(addedTopic.id);

      /* // XXX: It's not used now: see addedTopicId and jump to button in the `AddTopicForm`. See also `jumpToNewEntities` (is it used somewhere?).
       * if (jumpToNewEntities) {
       *   // Navigate to the edit page after successful creation
       *   goToTheRoute(`${routePath}/${addedTopic.id}`, true);
       * } else {
       *   goBack();
       * }
       */
    },
    onError: (error, newTopic) => {
      const message = t('AddTopicModal.ToastError');
      const details = getErrorText(error);
      const comboMsg = [message, details].filter(Boolean).join(': ');
      // eslint-disable-next-line no-console
      console.error('[AddTopicModal:addTopicMutation]', comboMsg, {
        error,
        details,
        newTopic,
      });
      // NOTE: Errors are processing in `AddTopicForm`, do nothing here
    },
  });

  const handleAddTopic = React.useCallback(
    (newTopic: TNewTopic) => {
      const promise = addTopicMutation.mutateAsync(newTopic);
      toast.promise(promise, {
        loading: t('AddTopicModal.ToastLoading'),
        success: (topic) => t('AddTopicModal.ToastSuccess', { name: topic.name }),
        error: t('AddTopicModal.ToastError'),
      });
      return promise;
    },
    [addTopicMutation, t],
  );

  if (!shouldBeVisible) {
    return null;
  }

  const isPending = /* isFinished || */ addTopicMutation.isPending;

  return (
    <Suspense fallback={<SkeletonPopup />}>
      <Modal
        isVisible
        hideModal={hideModal}
        className={cn(
          isDev && '__AddTopicModal', // DEBUG
          'flex flex-col gap-0 text-theme-foreground',
          !isMobile && 'max-h-[90%]',
          isPending && '[&>*]:pointer-events-none [&>*]:opacity-50',
        )}
      >
        <div
          className={cn(
            isDev && '__AddTopicModal_Header', // DEBUG
            !isMobile && 'max-h-[90vh]',
            'flex flex-col border-b bg-theme px-8 py-4 text-theme-foreground',
          )}
        >
          <DialogTitle className="DialogTitle">{title}</DialogTitle>
          <DialogDescription aria-hidden="true" hidden>
            {title}
          </DialogDescription>
        </div>
        <ScrollArea
          className={cn(
            isDev && '__AddTopicModal_Scroll', // DEBUG
          )}
        >
          <StableMountWrapper
            componentName="AddTopicForm"
            stabilizationDelay={500}
            render={({ isMounted, hasStabilized }) => {
              return !isMounted || !hasStabilized ? (
                <AddTopicFormSkeleton className="w-full p-8" />
              ) : (
                <AddTopicForm
                  hasStabilized={hasStabilized}
                  handleAddTopic={handleAddTopic}
                  className="p-8 text-foreground"
                  handleClose={hideModal}
                  isPending={isPending}
                  addedTopicId={addedTopicId}
                />
              );
            }}
          />
        </ScrollArea>
      </Modal>
    </Suspense>
  );
}
