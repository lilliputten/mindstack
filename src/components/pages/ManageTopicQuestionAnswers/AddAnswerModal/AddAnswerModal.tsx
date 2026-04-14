'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { APIError } from '@/lib/types/api';
import { invalidateKeysByPrefixes, makeQueryKeyPrefix } from '@/lib/helpers/react-query';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { DialogDescription, DialogTitle } from '@/components/ui/Dialog';
import { Modal } from '@/components/ui/Modal';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { isDev } from '@/constants';
import { addNewAnswer } from '@/features/answers/actions';
import { TAnswerId, TAvailableAnswer, TNewAnswer } from '@/features/answers/types';
import { TQuestionId } from '@/features/questions/types';
import { TTopicId } from '@/features/topics';
import {
  useAvailableAnswers,
  useDocumentTitle,
  useGoBack,
  useMediaQuery,
  useUpdateModalVisibility,
} from '@/hooks';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

import { AddAnswerForm, TFormData } from './AddAnswerForm';

// Url example: /en/topics/my/[topicId]/questions/[questionId]/answers/add
const urlPostfix = '/answers/add';
const urlQuestionToken = '/questions/';
const idToken = '([^/]*)';
const urlRegExp = new RegExp(idToken + urlQuestionToken + idToken + urlPostfix + '$');

type TAddAnswerModalRouteProps = {
  variant?: 'route';
};

export type TAddAnswerModalControlledProps = {
  variant: 'controlled';
  isVisible: boolean;
  onClose: () => void;
  onDone: (formData: TFormData) => void;
  topicId: TTopicId;
  questionId: TQuestionId;
  isPending?: boolean;
  closeImmediatelly?: boolean;
  className?: string;
};

export type TAddAnswerModalProps = TAddAnswerModalRouteProps | TAddAnswerModalControlledProps;

function AddAnswerModalRoute() {
  const { manageScope } = useManageTopicsStore();
  const [isVisible, setVisible] = React.useState(true);
  const [addedAnswerId, setAddedAnswerId] = React.useState<TAnswerId | undefined>();

  const t = useT();

  const pathname = usePathname();
  const match = pathname.match(urlRegExp);
  const topicId = match?.[1];
  const questionId = match?.[2];

  const shouldBeVisible = !!match;

  const topicsListRoutePath = `/topics/${manageScope}`;
  const topicRoutePath = `${topicsListRoutePath}/${topicId}`;
  const questionsListRoutePath = `${topicRoutePath}/questions`;
  const questionRoutePath = `${questionsListRoutePath}/${questionId}`;

  const { isMobile } = useMediaQuery();

  const goBack = useGoBack(`${questionRoutePath}/answers`);

  const hideModal = React.useCallback(() => {
    setVisible(false);
    goBack();
  }, [goBack]);

  const availableAnswersQuery = useAvailableAnswers({ questionId });
  const queryClient = useQueryClient();

  useDocumentTitle(t('AddAnswerModal.ModalTitle'), shouldBeVisible);
  useUpdateModalVisibility(setVisible, shouldBeVisible);

  const addAnswerMutation = useMutation<TAvailableAnswer, Error, TNewAnswer>({
    mutationFn: addNewAnswer,
    onSuccess: (addedAnswer) => {
      availableAnswersQuery.addNewAnswer(addedAnswer, true);
      availableAnswersQuery.invalidateAllKeysExcept([availableAnswersQuery.queryKey]);
      const invalidatePrefixes = [
        ['available-question', questionId],
        ['available-questions-for-topic', topicId],
      ].map(makeQueryKeyPrefix);
      invalidateKeysByPrefixes(queryClient, invalidatePrefixes);

      setAddedAnswerId(addedAnswer.id);
    },
    onError: (error, newAnswer) => {
      const details = error instanceof APIError ? error.details : null;
      const message = t('AddAnswerModal.ToastError');
      // eslint-disable-next-line no-console
      console.error('[AddAnswerModal:addAnswerMutation]', message, {
        error,
        details,
        newAnswer,
        questionId,
      });
      debugger; // eslint-disable-line no-debugger
    },
  });

  const handleAddAnswer = React.useCallback(
    (newAnswer: TNewAnswer) => {
      const promise = addAnswerMutation.mutateAsync(newAnswer);
      toast.promise(promise, {
        loading: t('AddAnswerModal.ToastLoading'),
        success: t('AddAnswerModal.ToastSuccess'),
        error: t('AddAnswerModal.ToastError'),
      });
      return promise;
    },
    [addAnswerMutation, t],
  );

  if (!shouldBeVisible || !topicId || !questionId) {
    return null;
  }

  const isPending = addAnswerMutation.isPending;

  return (
    <Modal
      isVisible={isVisible}
      hideModal={hideModal}
      className={cn(
        isDev && '__AddAnswerModal',
        'flex flex-col gap-0 text-theme-foreground',
        !isMobile && 'max-h-[90%]',
        isPending && '[&>*]:pointer-events-none [&>*]:opacity-50',
      )}
    >
      <div
        className={cn(
          isDev && '__AddAnswerModal_Header',
          !isMobile && 'max-h-[90vh]',
          'flex flex-col border-b bg-theme px-6 py-4 text-theme-foreground',
        )}
      >
        <DialogTitle className="DialogTitle">{t('AddAnswerModal.DialogTitle')}</DialogTitle>
        <DialogDescription aria-hidden="true" hidden>
          {t('AddAnswerModal.DialogDescription')}
        </DialogDescription>
      </div>
      <ScrollArea className={cn(isDev && '__AddAnswerModal_Scroll')}>
        <AddAnswerForm
          handleAddAnswer={handleAddAnswer}
          className="flex flex-col p-6 text-foreground"
          handleClose={hideModal}
          isPending={addAnswerMutation.isPending}
          topicId={topicId}
          questionId={questionId}
          addedAnswerId={addedAnswerId}
        />
      </ScrollArea>
    </Modal>
  );
}

function AddAnswerModalControlled(props: Omit<TAddAnswerModalControlledProps, 'variant'>) {
  const {
    isVisible,
    onClose,
    onDone,
    topicId,
    questionId,
    isPending = false,
    closeImmediatelly = true,
    className: modalClassName,
  } = props;

  const t = useT();
  const { isMobile } = useMediaQuery();

  useDocumentTitle(t('AddAnswerModal.ModalTitle'), isVisible);

  const handleAddAnswer = React.useCallback(
    async (newAnswer: TNewAnswer) => {
      onDone({
        text: newAnswer.text,
        isCorrect: newAnswer.isCorrect ?? false,
      });
    },
    [onDone],
  );

  return (
    <Modal
      isVisible={isVisible}
      hideModal={onClose}
      className={cn(
        isDev && '__AddAnswerModal',
        'flex flex-col gap-0 text-theme-foreground',
        modalClassName,
        !isMobile && 'max-h-[90%]',
        isPending && '[&>*]:pointer-events-none [&>*]:opacity-50',
      )}
    >
      <div
        className={cn(
          isDev && '__AddAnswerModal_Header',
          !isMobile && 'max-h-[90vh]',
          'flex flex-col border-b bg-theme px-6 py-4 text-theme-foreground',
        )}
      >
        <DialogTitle className="DialogTitle">{t('AddAnswerModal.DialogTitle')}</DialogTitle>
        <DialogDescription aria-hidden="true" hidden>
          {t('AddAnswerModal.DialogDescription')}
        </DialogDescription>
      </div>
      <ScrollArea className={cn(isDev && '__AddAnswerModal_Scroll')}>
        <AddAnswerForm
          handleAddAnswer={handleAddAnswer}
          className="flex flex-col p-6 text-foreground"
          handleClose={onClose}
          isPending={isPending}
          topicId={topicId}
          questionId={questionId}
          closeImmediatelly={closeImmediatelly}
        />
      </ScrollArea>
    </Modal>
  );
}

export function AddAnswerModal(props: TAddAnswerModalProps = {}) {
  if ('variant' in props && props.variant === 'controlled') {
    const { variant: _variant, ...rest } = props;
    return <AddAnswerModalControlled {...rest} />;
  }
  return <AddAnswerModalRoute />;
}
