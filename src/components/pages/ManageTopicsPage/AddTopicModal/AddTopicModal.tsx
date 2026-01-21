'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getErrorText } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { DialogDescription, DialogTitle } from '@/components/ui/Dialog';
import { Modal } from '@/components/ui/Modal';
import { isDev } from '@/constants';
import { useSettings } from '@/contexts/SettingsContext';
import { addNewTopic } from '@/features/topics/actions/addNewTopic';
import { TAvailableTopic, TNewTopic } from '@/features/topics/types';
import {
  useAvailableTopicsByScope,
  useGoBack,
  useGoToTheRoute,
  useMediaQuery,
  useModalTitle,
  useUpdateModalVisibility,
} from '@/hooks';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

import { AddTopicForm } from './AddTopicForm';

const urlPostfix = '/add';

export function AddTopicModal() {
  const { manageScope } = useManageTopicsStore();
  const routePath = `/topics/${manageScope}`;
  const [isVisible, setVisible] = React.useState(false);
  const { isMobile } = useMediaQuery();

  const { jumpToNewEntities } = useSettings();
  const t = useT();

  const availableTopicsQuery = useAvailableTopicsByScope({ manageScope });

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

  useModalTitle(t('AddTopicModal.ModalTitle'), shouldBeVisible);
  useUpdateModalVisibility(setVisible, shouldBeVisible);

  const addTopicMutation = useMutation<TAvailableTopic, Error, TNewTopic>({
    mutationFn: addNewTopic,
    onSuccess: (addedTopic) => {
      // Add the created item to the cached react-query data
      availableTopicsQuery.addNewTopic(addedTopic, true);
      // Invalidate all other keys...
      availableTopicsQuery.invalidateAllKeysExcept([availableTopicsQuery.queryKey]);
      // Close the modal first
      setVisible(false);
      if (jumpToNewEntities) {
        // Then navigate to the edit page after a short delay to ensure modal is closed
        // setTimeout(() => goToTheRoute(`${routePath}/${addedTopic.id}`, true), 100);
        goToTheRoute(`${routePath}/${addedTopic.id}`, true);
      } else {
        goBack();
      }
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
      // NOTE: Error is processing in `AddTopicForm`
      // debugger; // eslint-disable-line no-debugger
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

  return (
    <Modal
      isVisible={isVisible}
      hideModal={hideModal}
      className={cn(
        isDev && '__AddTopicModal', // DEBUG
        'flex flex-col gap-0 text-theme-foreground',
        addTopicMutation.isPending && '[&>*]:pointer-events-none [&>*]:opacity-50',
      )}
    >
      <div
        className={cn(
          isDev && '__AddTopicModal_Header', // DEBUG
          !isMobile && 'max-h-[90vh]',
          'flex flex-col border-b bg-theme px-8 py-4 text-theme-foreground',
        )}
      >
        <DialogTitle className="DialogTitle">{t('AddTopicModal.DialogTitle')}</DialogTitle>
        <DialogDescription aria-hidden="true" hidden>
          {t('AddTopicModal.DialogDescription')}
        </DialogDescription>
      </div>
      <AddTopicForm
        handleAddTopic={handleAddTopic}
        className="p-8 text-foreground"
        handleClose={hideModal}
        isPending={addTopicMutation.isPending}
      />
    </Modal>
  );
}
