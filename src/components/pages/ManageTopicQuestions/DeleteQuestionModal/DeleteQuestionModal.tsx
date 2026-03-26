'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { APIError } from '@/lib/types/api';
import { invalidateKeysByPrefixes, makeQueryKeyPrefix } from '@/lib/helpers/react-query';
import { useT } from '@/i18n';
import { useAvailableQuestions } from '@/hooks/react-query/useAvailableQuestions';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { deleteQuestion } from '@/features/questions/actions/deleteQuestion';
import { TAvailableQuestion, TQuestionId } from '@/features/questions/types';
import { useDocumentTitle, useGoBack, useUpdateModalVisibility } from '@/hooks';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

import { topicQuestionDeletedEventId } from './constants';

interface TDeleteQuestionModalProps {
  questionId?: TQuestionId;
  from?: string;
}

const urlPostfix = '/questions/delete';
const idToken = '([^/]*)';
const urlMatchRegExp = new RegExp(idToken + urlPostfix); // + '\\b\\?([^/]*)$');

export function DeleteQuestionModal(props: TDeleteQuestionModalProps) {
  const { manageScope } = useManageTopicsStore();
  const { questionId } = props;
  const [isVisible, setVisible] = React.useState(true);
  const t = useT();

  const pathname = usePathname();
  const match = pathname.match(urlMatchRegExp);
  const shouldBeVisible = pathname.endsWith(urlPostfix);
  const topicId = match?.[1];

  const topicsListRoutePath = `/topics/${manageScope}`;
  const topicRoutePath = `${topicsListRoutePath}/${topicId}`;
  const questionsListRoutePath = `${topicRoutePath}/questions`;

  const goBack = useGoBack(questionsListRoutePath);

  const hideModal = React.useCallback(() => {
    setVisible(false);
    goBack();
  }, [goBack]);

  const availableQuestionsQuery = useAvailableQuestions({
    traceId: 'DeleteQuestionModal',
    topicId,
  });

  const queryClient = useQueryClient();

  useDocumentTitle(t('DeleteQuestionModal.ModalTitle'), shouldBeVisible);
  useUpdateModalVisibility(setVisible, shouldBeVisible);

  if (!topicId) {
    throw new Error('Not found topic id');
  }
  if (!questionId) {
    throw new Error('No question id passed for deletion');
  }

  const deleteQuestionMutation = useMutation<TAvailableQuestion, Error, TQuestionId>({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      // Add the created item to the cached react-query data
      availableQuestionsQuery.deleteQuestion(questionId);
      // Invalidate all other keys...
      availableQuestionsQuery.invalidateAllKeysExcept([availableQuestionsQuery.queryKey]);
      const invalidatePrefixes = [
        // Invalidate parent topic and topics list...
        ['available-topic', topicId],
        ['available-topics'],
      ].map(makeQueryKeyPrefix);
      invalidateKeysByPrefixes(queryClient, invalidatePrefixes);
      // Broadcast an event
      const event = new CustomEvent<TQuestionId>(topicQuestionDeletedEventId, {
        detail: questionId,
        bubbles: true,
      });
      window.dispatchEvent(event);
      // Hide the modal
      hideModal();
    },
    onError: (error) => {
      const details = error instanceof APIError ? error.details : null;
      const message = 'Cannot delete question';
      // eslint-disable-next-line no-console
      console.error('[DeleteQuestionModal:deleteQuestionMutation]', message, {
        error,
        details,
        questionId,
      });
      debugger; // eslint-disable-line no-debugger
    },
  });

  const confirmDeleteQuestion = React.useCallback(() => {
    const promise = deleteQuestionMutation.mutateAsync(questionId);
    toast.promise(promise, {
      loading: t('DeleteQuestionModal.ToastLoading'),
      success: t('DeleteQuestionModal.ToastSuccess'),
      error: t('DeleteQuestionModal.ToastError'),
    });
    return promise;
  }, [deleteQuestionMutation, questionId, t]);

  if (!shouldBeVisible || !topicId || !questionId) {
    return null;
    // throw new Error('Cannot parse topic id from the modal url.');
  }

  return (
    <ConfirmModal
      dialogTitle={t('DeleteQuestionModal.DialogTitle')}
      confirmButtonVariant="destructive"
      confirmButtonText={t('DeleteQuestionModal.ConfirmButtonText')}
      confirmButtonBusyText={t('DeleteQuestionModal.ConfirmButtonBusyText')}
      cancelButtonText={t('DeleteQuestionModal.CancelButtonText')}
      handleClose={hideModal}
      handleConfirm={confirmDeleteQuestion}
      isPending={deleteQuestionMutation.isPending}
      isVisible={isVisible}
    >
      {t('DeleteQuestionModal.DialogContent')}
    </ConfirmModal>
  );
}
