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
  createGenerateTopicQuestionsMessages,
  parseGeneratedTopicQuestions,
} from '@/features/ai/helpers';
import { useUserAIRequest } from '@/features/ai/hooks';
import {
  TAIQuerDebugDataId,
  TAITextQueryData,
  TGenerateTopicQuestionsParams,
} from '@/features/ai/types';
import { addMultipleQuestions } from '@/features/questions/actions';
import { TAvailableQuestion, TNewQuestion } from '@/features/questions/types';
import {
  useAvailableTopicById,
  useGoBack,
  useGoToTheRoute,
  useMediaQuery,
  useModalTitle,
  useUpdateModalVisibility,
} from '@/hooks';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

import { GenerateQuestionsForm, TFormData } from './GenerateQuestionsForm';

// Url example: /en/topics/my/[topicId]/questions/generate
const urlPostfix = '/questions/generate';
const urlTopicsToken = '/topics/';
const idToken = '([^/]*)';
const urlRegExp = new RegExp(urlTopicsToken + idToken + '/' + idToken + urlPostfix + '$');

/** A debug data file id */
const debugDataId: TAIQuerDebugDataId = 'questions-query-data-05';

export function GenerateQuestionsModal() {
  const { manageScope } = useManageTopicsStore();
  const [isVisible, setVisible] = React.useState(true);
  const [error, setError] = React.useState<string | undefined>();

  const userAIRequest = useUserAIRequest();

  const { jumpToNewEntities } = useSettings();
  const t = useT();

  const pathname = usePathname();
  const match = pathname.match(urlRegExp);
  const topicId = match?.[2];

  // const { allowed: aiGenerationsAllowed, loading: aiGenerationsLoading } = useAIGenerationsStatus();
  const shouldBeVisible = !!match;

  const session = useSession();
  const isSessionLoading = session.status === 'loading';

  // Calculate paths...
  const topicsListRoutePath = `/topics/${manageScope}`;
  const topicRoutePath = `${topicsListRoutePath}/${topicId}`;
  const questionsListRoutePath = `${topicRoutePath}/questions`;

  const queryClient = useQueryClient();

  const { isMobile } = useMediaQuery();

  const goToTheRoute = useGoToTheRoute();
  const goBack = useGoBack(questionsListRoutePath);

  const hideModal = React.useCallback(() => {
    setVisible(false);
    goBack();
  }, [goBack]);

  const availableTopicQuery = useAvailableTopicById({
    id: topicId || '',
    includeQuestions: true,
    includeQuestionsCount: true,
  });
  const { topic, isFetched, isLoading } = availableTopicQuery;
  const isTopicPending = !isFetched || isLoading;

  const questions = topic?.questions;

  const dialogTitle = t('GenerateQuestionsModal.DialogTitle');
  useModalTitle(dialogTitle, shouldBeVisible);
  useUpdateModalVisibility(setVisible, shouldBeVisible);

  const generateQuestionsMutation = useMutation({
    mutationFn: async (formData: TFormData) => {
      const topicText = topic?.name || '';
      const topicDescription = topic?.description || '';
      const topicKeywords = topic?.keywords || '';
      const { clientType, temperature } = formData;
      const params: TGenerateTopicQuestionsParams = {
        ...formData,
        topicText,
        topicDescription,
        topicKeywords,
        langName: topic?.langName || undefined,
        langCode: topic?.langCode || undefined,
        existedQuestions: questions?.map(({ text }) => ({ text })),
      };
      const { debugData } = formData;
      /* console.log('[GenerateQuestionsModal:generateQuestionsMutation] Start', {
       *   debugData,
       *   formData,
       *   params,
       *   topic,
       *   questions,
       * });
       */
      const messages = createGenerateTopicQuestionsMessages(params);
      /* // DEBUG
       * const __debugMessagesStr = messages.map(({ content }) => content).join('\n\n');
       * console.log('[GenerateQuestionsModal:generateQuestionsMutation] Created messages', {
       *   __debugMessagesStr,
       *   messages,
       *   params,
       * });
       */
      const queryData: TAITextQueryData = await userAIRequest(messages, {
        topicId,
        debugData: debugData ? debugDataId : undefined,
        clientType,
        temperature,
      });
      /* // DEBUG
       * const __content = queryData?.content;
       * console.log('[GenerateQuestionsModal:generateQuestionsMutation] Generated query data', {
       *   __content,
       *   queryData,
       *   messages,
       *   params,
       * });
       */
      setError(undefined);
      return queryData;
    },
    onError: (error, formData) => {
      const message = 'Error generating questions';
      const details = getErrorText(error);
      const comboMsg = [message, details].filter(Boolean).join(': ');
      // eslint-disable-next-line no-console
      console.error('[GenerateQuestionsModal:generateQuestionsMutation]', comboMsg, {
        details,
        error,
        formData,
        topicId,
      });
      debugger; // eslint-disable-line no-debugger
      setError(comboMsg);
    },
  });

  const addQuestionsMutation = useMutation<TAvailableQuestion[], Error, TNewQuestion[]>({
    mutationFn: addMultipleQuestions,
    /* onError: (error, newQuestions) => {
     *   const details = getErrorText(error); //  instanceof APIError ? error.details : null;
     *   const message = 'Cannot create questions';
     *   // eslint-disable-next-line no-console
     *   console.error('[GenerateQuestionsModal:addQuestionsMutation]', message, {
     *     error,
     *     details,
     *     newQuestions,
     *     topicId,
     *   });
     *   debugger; // eslint-disable-line no-debugger
     * },
     */
  });

  const handleGenerateQuestions = React.useCallback(
    async (formData: TFormData) => {
      try {
        if (!topicId) {
          toast.error(t('GenerateQuestionsModal.NoTopicIdDefined'));
          return;
        }
        /* console.log('[GenerateQuestionsModal:handleGenerateQuestions] Start', {
         *   formData,
         *   topicId,
         * });
         */
        const queryPromise = generateQuestionsMutation.mutateAsync(formData);
        toast.promise(queryPromise, {
          loading: t('GenerateQuestionsModal.ToastLoadingData'),
          success: t('GenerateQuestionsModal.ToastSuccessData'),
          error: t('GenerateQuestionsModal.ToastErrorData'),
        });
        const queryData: TAITextQueryData = await queryPromise;
        /* console.log('[GenerateQuestionsModal:handleGenerateQuestions] Got query data', {
         *   queryData,
         * });
         */
        // Parsing questions...
        const questions = parseGeneratedTopicQuestions(queryData);
        if (!questions || !questions.length) {
          throw new Error('No questions generated');
        }
        const newQuestions: TNewQuestion[] = questions.map(
          ({
            answers,
            //  answersCount,
            ...question
          }) => ({
            ...question,
            answers: answers?.map((answer) => ({ ...answer, isGenerated: true })),
            topicId,
            isGenerated: true,
          }),
        );
        // TODO: Here should be a grid editor step, to allow the user to tune-up generated data
        /* console.log('[GenerateQuestionsModal:handleGenerateQuestions] Parsed questions', {
         *   newQuestions,
         *   questions,
         * });
         */
        const addQuestionsPromise = addQuestionsMutation.mutateAsync(newQuestions);
        toast.promise(addQuestionsPromise, {
          loading: t('GenerateQuestionsModal.ToastLoadingQuestions'),
          success: t('GenerateQuestionsModal.ToastSuccessQuestions'),
          error: t('GenerateQuestionsModal.ToastErrorQuestions'),
        });
        await addQuestionsPromise;
        /* console.log('[GenerateQuestionsModal:handleGenerateQuestions] Questions added', {
         *   addedQuestions,
         * });
         */
        // Invalidate parent topic and its questions...
        const invalidatePrefixes = [
          ['available-topic', topicId],
          ['available-questions-for-topic', topicId],
        ].map(makeQueryKeyPrefix);
        invalidateKeysByPrefixes(queryClient, invalidatePrefixes);
        // Close modal and navigate out
        setVisible(false);
        if (jumpToNewEntities) {
          const continueUrl = `${questionsListRoutePath}`;
          goToTheRoute(continueUrl, true);
        } else {
          goBack();
        }
        setError(undefined);
        return addQuestionsPromise;
      } catch (error) {
        const message = 'An error occurred while generating and adding topic questions';
        const details = getErrorText(error);
        const comboMsg = [message, details].filter(Boolean).join(': ');
        // eslint-disable-next-line no-console
        console.error('[GenerateQuestionsModal] ❌', comboMsg, {
          details,
          error,
        });
        debugger; // eslint-disable-line no-debugger
        toast.error(comboMsg);
        setError(comboMsg);
      }
    },
    [
      addQuestionsMutation,
      generateQuestionsMutation,
      goBack,
      goToTheRoute,
      jumpToNewEntities,
      queryClient,
      questionsListRoutePath,
      t,
      topicId,
    ],
  );

  if (!shouldBeVisible || !topicId) {
    return null;
  }

  const areMutationsPending = generateQuestionsMutation.isPending || addQuestionsMutation.isPending;
  const isOverallPending = isTopicPending || areMutationsPending;

  return (
    <Modal
      isVisible={isVisible}
      hideModal={hideModal}
      className={cn(
        isDev && '__GenerateQuestionsModal',
        'flex flex-col gap-0 text-theme-foreground',
        !isMobile && 'max-h-[90%]',
        isOverallPending && '[&>*]:pointer-events-none [&>*]:opacity-50',
      )}
    >
      <div
        className={cn(
          isDev && '__GenerateQuestionsModal_Header',
          !isMobile && 'max-h-[90vh]',
          'flex flex-col border-b bg-theme px-6 py-4 text-theme-foreground',
        )}
      >
        <DialogTitle className="DialogTitle">{dialogTitle}</DialogTitle>
        <DialogDescription aria-hidden="true" hidden>
          {dialogTitle}
        </DialogDescription>
      </div>
      <div
        className={cn(
          isDev && '__GenerateQuestionsModal_Wrapper', // DEBUG
          'relative flex min-h-24 flex-col overflow-hidden',
          'text-foreground',
        )}
      >
        {!isSessionLoading && (
          <ScrollArea
            className={cn(
              isDev && '__GenerateQuestionsModal_Scroll', // DEBUG
              // 'flex flex-col',
            )}
          >
            <GenerateQuestionsForm
              handleGenerateQuestions={handleGenerateQuestions}
              className="p-8"
              handleClose={hideModal}
              isPending={areMutationsPending}
              topicId={topicId}
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
