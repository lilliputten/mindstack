'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { APIError } from '@/lib/types/api';
import { invalidateKeysByPrefixes, makeQueryKeyPrefix } from '@/lib/helpers/react-query';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { useAvailableQuestions } from '@/hooks/react-query/useAvailableQuestions';
import { isDev } from '@/constants';
import { addNewQuestion } from '@/features/questions/actions';
import { TNewQuestion, TQuestion, TQuestionId } from '@/features/questions/types';
import { useDocumentTitle, useGoBack, useGoToTheRoute, useUpdateModalVisibility } from '@/hooks';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

import { TFormData } from './AddQuestionForm';
import { AddQuestionModal } from './AddQuestionModal';

const urlPostfix = '/questions/add';
const idToken = '([^/]*)';
const urlTopicIdRegExp = new RegExp(idToken + urlPostfix + '$');

export function AddQuestionModalPage() {
  const { manageScope } = useManageTopicsStore();
  const [isVisible, setVisible] = React.useState(false);
  const [addedQuestionId, setAddedQuestionId] = React.useState<TQuestionId | undefined>();

  const t = useT();

  const pathname = usePathname();
  const match = pathname.match(urlTopicIdRegExp);
  const shouldBeVisible = !!match;
  const topicId = match?.[1];

  const topicsListRoutePath = `/topics/${manageScope}`;
  const topicRoutePath = `${topicsListRoutePath}/${topicId}`;
  const questionsListRoutePath = `${topicRoutePath}/questions`;

  const goToTheRoute = useGoToTheRoute();
  const goBack = useGoBack(questionsListRoutePath);

  const hideModal = React.useCallback(() => {
    setVisible(false);
    goBack();
  }, [goBack]);

  const availableQuestionsQuery = useAvailableQuestions({ topicId });
  const queryClient = useQueryClient();

  useDocumentTitle(t('AddQuestionModal.ModalTitle'), shouldBeVisible);
  useUpdateModalVisibility(setVisible, shouldBeVisible);

  const addQuestionMutation = useMutation<TQuestion, Error, TNewQuestion>({
    mutationFn: addNewQuestion,
    onSuccess: (addedQuestion) => {
      // TODO: Issue #66: Verify all react-query invalidation
      // Add the created item to the cached react-query data
      availableQuestionsQuery.addNewQuestion(addedQuestion, true);
      // Invalidate all other queries...
      availableQuestionsQuery.invalidateAllKeysExcept([availableQuestionsQuery.queryKey]);
      const invalidatePrefixes = [
        // Invalidate parent topic and topics list...
        ['available-topic', topicId],
        ['available-topics'],
      ].map(makeQueryKeyPrefix);
      invalidateKeysByPrefixes(queryClient, invalidatePrefixes);

      // Set finished status (set a created record id to show the final dialog)...
      setAddedQuestionId(addedQuestion.id);
    },
    onError: (error, newQuestion) => {
      const details = error instanceof APIError ? error.details : null;
      const message = t('AddQuestionModal.ToastError');
      // eslint-disable-next-line no-console
      console.error('[AddQuestionModal:addQuestionMutation]', message, {
        error,
        details,
        newQuestion,
        topicId,
      });
      debugger; // eslint-disable-line no-debugger
    },
  });

  const goToAddedQuestion = React.useCallback(() => {
    goToTheRoute(`${questionsListRoutePath}/${addedQuestionId}`, true);
  }, [addedQuestionId, goToTheRoute, questionsListRoutePath]);

  const handleAddQuestion = React.useCallback(
    (formData: TFormData) => {
      if (!topicId) {
        throw new Error('Topic id is not defined!');
      }
      const newQuestion: TNewQuestion = {
        ...formData,
        topicId,
      };
      const promise = addQuestionMutation.mutateAsync(newQuestion);
      toast.promise(promise, {
        loading: t('AddQuestionModal.ToastLoading'),
        success: t('AddQuestionModal.ToastSuccess'),
        error: t('AddQuestionModal.ToastError'),
      });
      return promise;
    },
    [addQuestionMutation, t, topicId],
  );

  if (!shouldBeVisible || !topicId) {
    return null;
  }

  const isPending = addQuestionMutation.isPending;

  return (
    <AddQuestionModal
      className={cn(
        isDev && '__AddQuestionModalPage', // DEBUG
      )}
      isVisible={isVisible}
      isPending={isPending}
      onClose={hideModal}
      onDone={handleAddQuestion}
      goToAddedQuestion={goToAddedQuestion}
    />
  );
}
