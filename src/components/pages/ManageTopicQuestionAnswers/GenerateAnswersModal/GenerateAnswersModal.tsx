'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import { getErrorText } from '@/lib/helpers';
import { invalidateKeysByPrefixes, makeQueryKeyPrefix } from '@/lib/helpers/react-query';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { DialogDescription, DialogTitle } from '@/components/ui/Dialog';
import { Modal } from '@/components/ui/Modal';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { WaitingSplash } from '@/components/ui/WaitingSplash';
import { isDev } from '@/constants';
import { useSettings } from '@/contexts/SettingsContext';
import {
  createGenerateQuestionAnswersMessages,
  parseGeneratedQuestionAnswers,
} from '@/features/ai/helpers';
import { useUserAIRequest } from '@/features/ai/hooks';
import { TAIQuerDebugDataId, TAITextQueryData } from '@/features/ai/types';
import { TGenerateQuestionAnswersParams } from '@/features/ai/types/GenerateAnswersTypes';
import { addMultipleAnswers } from '@/features/answers/actions/addMultipleAnswers';
import { TAvailableAnswer, TNewAnswer } from '@/features/answers/types';
import {
  useAvailableAnswers,
  useAvailableQuestionById,
  useGoBack,
  useGoToTheRoute,
  useMediaQuery,
  useModalTitle,
  useUpdateModalVisibility,
} from '@/hooks';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

import { GenerateAnswersForm, TFormData } from './GenerateAnswersForm';

// Url example: /en/topics/my/[topicId]/questions/[questionId]/answers/generate
const urlPostfix = '/answers/generate';
const urlQuestionToken = '/questions/';
const idToken = '([^/]*)';
const urlRegExp = new RegExp(idToken + urlQuestionToken + idToken + urlPostfix + '$');

/** A debug data file id */
const debugDataId: TAIQuerDebugDataId = 'answers-query-data-01';

export function GenerateAnswersModal() {
  const { manageScope } = useManageTopicsStore();
  const [isVisible, setVisible] = React.useState(true);
  const [error, setError] = React.useState<string | undefined>();

  const userAIRequest = useUserAIRequest();

  const { jumpToNewEntities } = useSettings();
  const t = useT();

  const pathname = usePathname();
  const match = pathname.match(urlRegExp);
  const topicId = match?.[1];
  const questionId = match?.[2];

  // const { allowed: aiGenerationsAllowed, loading: aiGenerationsLoading } = useAIGenerationsStatus();
  const shouldBeVisible = !!match;

  const session = useSession();
  const isSessionLoading = session.status === 'loading';

  // Calculate paths...
  const topicsListRoutePath = `/topics/${manageScope}`;
  const topicRoutePath = `${topicsListRoutePath}/${topicId}`;
  const questionsListRoutePath = `${topicRoutePath}/questions`;
  const questionRoutePath = `${questionsListRoutePath}/${questionId}`;
  const answersListRoutePath = `${questionRoutePath}/answers`;
  // const answerRoutePath = `${answersListRoutePath}/${answerId}`;

  const queryClient = useQueryClient();

  const { isMobile } = useMediaQuery();

  const goToTheRoute = useGoToTheRoute();
  const goBack = useGoBack(answersListRoutePath);

  const hideModal = React.useCallback(() => {
    setVisible(false);
    goBack();
  }, [goBack]);

  const availableQuestionQuery = useAvailableQuestionById({
    id: questionId || '',
    // includeTopic: true,
    // includeAnswers: true,
    // includeAnswersCount: true,
  });
  const {
    question,
    isFetched: isQuestionFetched,
    isLoading: isQuestionLoading,
  } = availableQuestionQuery;
  const isQuestionPending = !isQuestionFetched || isQuestionLoading;

  // Fetch answers using dedicated hook
  const availableAnswersQuery = useAvailableAnswers({
    itemsLimit: null,
    questionId,
    // enabled: !!questionId,
  });
  const {
    allAnswers: answers,
    isLoading: isAnswersLoading,
    isFetched: isAnswersFetched,
    // error: answersError,
  } = availableAnswersQuery;
  const isAnswersPending = !isAnswersFetched || isAnswersLoading;

  const title = t('GenerateAnswers');
  useModalTitle(title, shouldBeVisible);
  useUpdateModalVisibility(setVisible, shouldBeVisible);

  // const generateAnswersMutation = useMutation<TGeneratedAnswers, Error, TFormData>({
  const generateAnswersMutation = useMutation({
    mutationFn: async (formData: TFormData) => {
      const topic = question?.topic;
      const questionText = question?.text || '';
      const topicText = topic?.name || '';
      const topicDescription = topic?.description || '';
      const topicKeywords = topic?.keywords || '';
      const params: TGenerateQuestionAnswersParams = {
        ...formData,
        topicText,
        topicDescription,
        topicKeywords,
        langName: topic?.langName || undefined,
        langCode: topic?.langCode || undefined,
        questionText,
        existedAnswers: answers?.map(({ isCorrect, explanation, text }) => ({
          isCorrect,
          explanation: explanation || null,
          text,
        })),
      };
      const { debugData } = formData;

      /* // DEBUG
       * console.log('[GenerateAnswersModal:generateAnswersMutation] Start', {
       *   debugData,
       *   formData,
       *   params,
       *   topic,
       *   question,
       *   answers,
       * });
       */

      const messages = createGenerateQuestionAnswersMessages(params);
      /* // DEBUG
       * const __debugMessagesStr = messages.map(({ content }) => content).join('\n\n');
       * console.log('[GenerateAnswersModal:generateAnswersMutation] Created messages', {
       *   __debugMessagesStr,
       *   messages,
       *   params,
       * });
       */
      const queryData: TAITextQueryData = await userAIRequest(messages, {
        topicId,
        debugData: debugData ? debugDataId : undefined,
      });
      /* console.log('[GenerateAnswersModal:generateAnswersMutation] Generated query data', {
       *   // content: queryData?.content,
       *   queryData,
       *   messages,
       *   params,
       * });
       */
      setError(undefined);
      return queryData;
    },
    onError: (error, formData) => {
      const message = 'Cannot generate answers';
      const details = getErrorText(error);
      const comboMsg = [message, details].filter(Boolean).join(': ');
      // eslint-disable-next-line no-console
      console.error('[GenerateAnswersModal:generateAnswersMutation]', comboMsg, {
        details,
        error,
        formData,
        questionId,
      });
      debugger; // eslint-disable-line no-debugger
      setError(comboMsg);
    },
  });

  const addAnswersMutation = useMutation<TAvailableAnswer[], Error, TNewAnswer[]>({
    mutationFn: addMultipleAnswers,
  });

  const handleGenerateAnswers = React.useCallback(
    async (formData: TFormData) => {
      try {
        if (!questionId) {
          toast.error(t('GenerateAnswersModal.NoQuestionIdDefined'));
          return;
        }
        /* console.log('[GenerateAnswersModal:handleGenerateAnswers] Start', {
         *   formData,
         *   questionId,
         * });
         */
        const queryPromise = generateAnswersMutation.mutateAsync(formData);
        toast.promise(queryPromise, {
          loading: t('GenerateAnswersModal.ToastLoadingData'),
          success: t('GenerateAnswersModal.ToastSuccessData'),
          error: t('GenerateAnswersModal.ToastErrorData'),
        });
        const queryData = await queryPromise;
        /* console.log('[GenerateAnswersModal:handleGenerateAnswers] Got query data', {
         *   queryData,
         * });
         */
        // Parsing answers...
        const answers = parseGeneratedQuestionAnswers(queryData);
        /* console.log('[GenerateAnswersModal:handleGenerateAnswers] Parsed answers', {
         *   answers,
         * });
         */
        const newAnswers: TNewAnswer[] | undefined = answers?.map((answer) => ({
          ...answer,
          questionId,
          isGenerated: true,
        }));
        if (!newAnswers || !newAnswers.length) {
          throw new Error('No answers generated');
        }
        const addAnswersPromise = addAnswersMutation.mutateAsync(newAnswers);
        toast.promise(addAnswersPromise, {
          loading: t('GenerateAnswersModal.ToastLoadingAnswers'),
          success: t('GenerateAnswersModal.ToastSuccessAnswers'),
          error: t('GenerateAnswersModal.ToastErrorAnswers'),
        });
        await addAnswersPromise;
        /* console.log('[GenerateAnswersModal:handleGenerateAnswers] Answers added', {
         *   addedAnswers,
         * });
         */
        /* // UNUSED: Add the created items to the cached react-query data
         * addedAnswers.map((addedAnswer) => {
         *   availableAnswersQuery.addNewAnswer(addedAnswer, true);
         * });
         * // Invalidate all other queries...
         * availableAnswersQuery.invalidateAllKeysExcept([availableAnswersQuery.queryKey]);
         */
        // Invalidate parent question and its answers...
        const invalidatePrefixes = [
          ['available-question', questionId],
          ['available-answers-for-question', questionId],
        ].map(makeQueryKeyPrefix);
        invalidateKeysByPrefixes(queryClient, invalidatePrefixes);
        // Close modal and navigate out
        setVisible(false);
        if (jumpToNewEntities) {
          const continueUrl = `${answersListRoutePath}`;
          goToTheRoute(continueUrl, true);
        } else {
          goBack();
        }
        return addAnswersPromise;
      } catch (error) {
        const message = 'An error occurred while generating and adding question answers';
        const details = getErrorText(error);
        const comboMsg = [message, details].filter(Boolean).join(': ');
        // eslint-disable-next-line no-console
        console.error('[GenerateAnswersModal] ❌', comboMsg, {
          details,
          error,
        });
        debugger; // eslint-disable-line no-debugger
        toast.error(comboMsg);
        setError(comboMsg);
      }
    },
    [
      addAnswersMutation,
      answersListRoutePath,
      generateAnswersMutation,
      goBack,
      goToTheRoute,
      jumpToNewEntities,
      queryClient,
      questionId,
      t,
    ],
  );

  if (!shouldBeVisible || !topicId || !questionId) {
    return null;
    // throw new Error('Cannot parse topic id from the modal url.');
  }

  const areMutationsPending = generateAnswersMutation.isPending || addAnswersMutation.isPending;
  const isOverallPending = isAnswersPending || isQuestionPending || areMutationsPending;

  return (
    <Modal
      isVisible={isVisible}
      hideModal={hideModal}
      className={cn(
        isDev && '__GenerateAnswersModal', // DEBUG
        'flex flex-col gap-0',
        'text-theme-foreground',
        !isMobile && 'max-h-[90%]',
        // isQuestionPending && 'border border-red-500', // ???
        isOverallPending && '[&>*]:pointer-events-none [&>*]:opacity-50',
      )}
    >
      <div
        className={cn(
          isDev && '__GenerateAnswersModal_Header', // DEBUG
          !isMobile && 'max-h-[90vh]',
          'flex flex-col border-b bg-theme px-6 py-4 text-theme-foreground',
        )}
      >
        <DialogTitle className="DialogTitle">{title}</DialogTitle>
        <DialogDescription aria-hidden="true" hidden>
          {title}
        </DialogDescription>
      </div>
      <div
        className={cn(
          isDev && '__GenerateAnswersModal_Wrapper', // DEBUG
          'relative flex min-h-24 flex-col overflow-hidden',
          'text-foreground',
        )}
      >
        {!isSessionLoading && (
          <ScrollArea
            className={cn(
              isDev && '__GenerateAnswersModal_Scroll', // DEBUG
            )}
          >
            <GenerateAnswersForm
              handleGenerateAnswers={handleGenerateAnswers}
              className="p-8"
              handleClose={hideModal}
              isPending={areMutationsPending}
              questionId={questionId}
              user={session.data?.user}
              error={error}
            />
          </ScrollArea>
        )}
        <WaitingSplash show={isOverallPending} />
      </div>
    </Modal>
  );
}
