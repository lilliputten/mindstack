'use client';

import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { APIError } from '@/lib/types/api';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { deleteTopic } from '@/features/topics/actions/deleteTopic';
import { TAvailableTopic, TTopic, TTopicId } from '@/features/topics/types';
import { useAvailableTopicsByScope, useGoBack, useModalTitle } from '@/hooks';
import { useT } from '@/i18n';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

interface TDeleteTopicModalProps {
  topicId?: TTopicId;
  from?: string;
}

export function DeleteTopicModal(props: TDeleteTopicModalProps) {
  const { manageScope } = useManageTopicsStore();
  const routePath = `/topics/${manageScope}`;
  const { topicId } = props;
  const t = useT();

  const availableTopics = useAvailableTopicsByScope({ manageScope });

  const goBack = useGoBack(routePath);

  const hideModal = React.useCallback(() => {
    // setVisible(false);
    goBack();
  }, [goBack]);

  if (!topicId) {
    throw new Error('No topic id passed for deletion');
  }
  const deletingTopic: TTopic | undefined = React.useMemo(
    () => availableTopics.allTopics.find(({ id }) => id === topicId),
    [topicId, availableTopics.allTopics],
  );

  useModalTitle(t('DeleteTopicModal.ModalTitle'));

  const deleteTopicMutation = useMutation<TAvailableTopic, Error, TTopic>({
    mutationFn: deleteTopic,
    onSuccess: () => {
      // Delete the topic from the cached react-query data
      availableTopics.deleteTopic(topicId);
      // Invalidate all other keys...
      availableTopics.invalidateAllKeysExcept([availableTopics.queryKey]);
      // Hide modal (go back)
      hideModal();
    },
    onError: (error, deletingTopic) => {
      const details = error instanceof APIError ? error.details : null;
      const message = 'Cannot delete topic';
      // eslint-disable-next-line no-console
      console.error('[DeleteTopicModal:deleteTopicMutation]', message, {
        error,
        details,
        deletingTopic,
      });
      debugger; // eslint-disable-line no-debugger
    },
  });

  const confirmDeleteTopic = React.useCallback(() => {
    if (!deletingTopic) {
      return Promise.reject(new Error('No topic to delete provided'));
    }
    const promise = deleteTopicMutation.mutateAsync(deletingTopic);
    const name = deletingTopic.name;
    toast.promise(promise, {
      loading: t('DeleteTopicModal.ToastLoading', { name }),
      success: t('DeleteTopicModal.ToastSuccess', { name }),
      error: t('DeleteTopicModal.ToastError', { name }),
    });
    return promise;
  }, [deleteTopicMutation, deletingTopic, t]);

  const topicName = deletingTopic?.name;

  if (!topicName) {
    return null;
  }

  return (
    <ConfirmModal
      dialogTitle={t('DeleteTopicModal.DialogTitle')}
      confirmButtonVariant="destructive"
      confirmButtonText={t('DeleteTopicModal.ConfirmButtonText')}
      confirmButtonBusyText={t('DeleteTopicModal.ConfirmButtonBusyText')}
      cancelButtonText={t('DeleteTopicModal.CancelButtonText')}
      handleConfirm={confirmDeleteTopic}
      handleClose={hideModal}
      isPending={deleteTopicMutation.isPending}
      isVisible
    >
      {t('DeleteTopicModal.DialogContent', { topicName })}
    </ConfirmModal>
  );
}
