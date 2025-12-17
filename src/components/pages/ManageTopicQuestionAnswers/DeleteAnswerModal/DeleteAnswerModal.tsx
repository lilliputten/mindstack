'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { APIError } from '@/lib/types/api';
import { invalidateKeysByPrefixes, makeQueryKeyPrefix } from '@/lib/helpers/react-query';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { deleteAnswer } from '@/features/answers/actions';
import { TAnswerId, TAvailableAnswer } from '@/features/answers/types';
import { useAvailableAnswers, useGoBack, useModalTitle, useUpdateModalVisibility } from '@/hooks';
import { useT } from '@/i18n';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

import { topicAnswerDeletedEventId } from './constants';

interface TDeleteAnswerModalProps {
  answerId?: TAnswerId;
  from?: string;
}

const urlPostfix = '/answers/delete';
const urlQuestionToken = '/questions/';
const idToken = '([^/]*)';
const urlMatchRegExp = new RegExp(idToken + urlQuestionToken + idToken + urlPostfix);

export function DeleteAnswerModal(props: TDeleteAnswerModalProps) {
  const { manageScope } = useManageTopicsStore();
  const { answerId } = props;

  if (!answerId) {
    throw new Error('No answer id passed for deletion');
  }

  const [isVisible, setVisible] = React.useState(true);
  const t = useT();

  const pathname = usePathname();
  const match = pathname.match(urlMatchRegExp);
  const shouldBeVisible = pathname.endsWith(urlPostfix);
  const topicId = match?.[1];
  const questionId = match?.[2];

  if (!topicId) {
    throw new Error('Not found topic id');
  }
  if (!questionId) {
    throw new Error('No question id passed for deletion');
  }

  // Calculate paths...
  const topicsListRoutePath = `/topics/${manageScope}`;
  const topicRoutePath = `${topicsListRoutePath}/${topicId}`;
  const questionsListRoutePath = `${topicRoutePath}/questions`;
  const questionRoutePath = `${questionsListRoutePath}/${questionId}`;
  const answersListRoutePath = `${questionRoutePath}/answers`;
  // const answerRoutePath = `${answersListRoutePath}/${answerId}`;

  const goBack = useGoBack(answersListRoutePath);

  const hideModal = React.useCallback(() => {
    setVisible(false);
    goBack();
  }, [goBack]);

  const availableAnswersQuery = useAvailableAnswers({ questionId });

  const queryClient = useQueryClient();

  useModalTitle(t('DeleteAnswerModal.ModalTitle'), shouldBeVisible);
  useUpdateModalVisibility(setVisible, shouldBeVisible);

  // Change a browser title
  React.useEffect(() => {
    const originalTitle = document.title;
    document.title = t('DeleteAnswerModal.ModalTitle');
    return () => {
      document.title = originalTitle;
    };
  }, [t]);

  const deleteAnswerMutation = useMutation<TAvailableAnswer, Error, TAnswerId>({
    mutationFn: deleteAnswer,
    onSuccess: () => {
      // Hide the modal
      hideModal();
      // Add the created item to the cached react-query data
      availableAnswersQuery.deleteAnswer(answerId);
      // Invalidate all other queries...
      availableAnswersQuery.invalidateAllKeysExcept([availableAnswersQuery.queryKey]);
      // Invalidate parent question...
      const invalidatePrefixes = [
        ['available-question', questionId],
        ['available-questions-for-topic', topicId],
      ].map(makeQueryKeyPrefix);
      invalidateKeysByPrefixes(queryClient, invalidatePrefixes);
      // Dispatch a broadcast event
      const event = new CustomEvent<TAnswerId>(topicAnswerDeletedEventId, {
        detail: answerId,
        bubbles: true,
      });
      window.dispatchEvent(event);
    },
    onError: (error) => {
      const details = error instanceof APIError ? error.details : null;
      const message = 'Cannot delete answer';
      // eslint-disable-next-line no-console
      console.error('[DeleteAnswerModal:deleteAnswerMutation]', message, {
        details,
        error,
        answerId: answerId,
      });
      debugger; // eslint-disable-line no-debugger
    },
  });

  const confirmDeleteAnswer = React.useCallback(() => {
    const promise = deleteAnswerMutation.mutateAsync(answerId);
    toast.promise(promise, {
      loading: t('DeleteAnswerModal.ToastLoading'),
      success: t('DeleteAnswerModal.ToastSuccess'),
      error: t('DeleteAnswerModal.ToastError'),
    });
    return promise;
  }, [deleteAnswerMutation, answerId, t]);

  if (!shouldBeVisible) {
    return null;
  }

  return (
    <ConfirmModal
      dialogTitle={t('DeleteAnswerModal.DialogTitle')}
      confirmButtonVariant="destructive"
      confirmButtonText={t('DeleteAnswerModal.ConfirmButtonText')}
      confirmButtonBusyText={t('DeleteAnswerModal.ConfirmButtonBusyText')}
      cancelButtonText={t('DeleteAnswerModal.CancelButtonText')}
      handleClose={hideModal}
      handleConfirm={confirmDeleteAnswer}
      isPending={deleteAnswerMutation.isPending}
      isVisible={isVisible}
    >
      {t('DeleteAnswerModal.DialogContent')}
    </ConfirmModal>
  );
}
