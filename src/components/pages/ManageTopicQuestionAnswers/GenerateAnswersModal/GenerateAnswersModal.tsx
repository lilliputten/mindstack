'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getErrorText } from '@/lib/helpers';
import { invalidateKeysByPrefixes, makeQueryKeyPrefix } from '@/lib/helpers/react-query';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { DialogDescription, DialogTitle } from '@/components/ui/Dialog';
import { Modal } from '@/components/ui/Modal';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { BusySplashWithInfo, PageError } from '@/components/shared';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import {
  createGenerateQuestionAnswersMessages,
  parseGeneratedQuestionAnswers,
} from '@/features/ai/helpers';
import { useUserAIRequest } from '@/features/ai/hooks';
import { TAIQuerDebugDataId, TAITextQueryData } from '@/features/ai/types';
import { TGenerateQuestionAnswersParams } from '@/features/ai/types/GenerateAnswersTypes';
import { deleteAnswers } from '@/features/answers/actions';
import { addMultipleAnswers } from '@/features/answers/actions/addMultipleAnswers';
import { TAvailableAnswer, TNewAnswer } from '@/features/answers/types';
import { logJsonData } from '@/features/logger/server-actions';
import {
  useAvailableAnswers,
  useAvailableQuestionById,
  useGoBack,
  useMediaQuery,
  useModalTitle,
  useSessionData,
  useUpdateModalVisibility,
} from '@/hooks';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

import { GenerateAnswersForm } from './GenerateAnswersForm';
import { GeneratedScreen } from './GeneratedScreen';
import { SavedScreen } from './SavedScreen';
import { TFormData } from './types';

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

  const [isCorrecting, setCorrecting] = React.useState(false);

  const [generatedAnswers, setGeneratedAnswers] = React.useState<TNewAnswer[] | undefined>(/*[
    // DEBUG: Test data
    {
      questionId: 'cmlgsuq5i0005nvikvocydif7',
      text: 'Answer _markdown_ text',
      explanation: 'Explanation markdown text...',
      isCorrect: false,
      isGenerated: true,
    },
    {
      questionId: 'cmlgsuq5i0005nvikvocydif7',
      text: '**Second answer** with much longer text for test purposes and visual issues detection',
      explanation: 'Explanation markdown text...',
      isCorrect: true,
      isGenerated: true,
    },
    ]*/);

  // Already added to the database answers
  const [savedAnswers, setSavedAnswers] = React.useState<TAvailableAnswer[] | undefined>();

  const userAIRequest = useUserAIRequest();

  const t = useT();

  const [isSubmited, setSubmited] = React.useState(false);

  // Has been aborted with `abortControllerRef`?
  const [isAborted, setAborted] = React.useState(false);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const pathname = usePathname();
  const match = pathname.match(urlRegExp);
  const topicId = match?.[1];
  const questionId = match?.[2];

  const shouldBeVisible = !!match;

  const { loading: isSessionLoading } = useSessionData();

  // Calculate paths...
  const topicsListRoutePath = `/topics/${manageScope}`;
  const topicRoutePath = `${topicsListRoutePath}/${topicId}`;
  const questionsListRoutePath = `${topicRoutePath}/questions`;
  const questionRoutePath = `${questionsListRoutePath}/${questionId}`;
  const answersListRoutePath = `${questionRoutePath}/answers`;
  // const answerRoutePath = `${answersListRoutePath}/${answerId}`;

  const queryClient = useQueryClient();

  const { isMobile } = useMediaQuery();

  // const goToTheRoute = useGoToTheRoute();
  const goBack = useGoBack(answersListRoutePath);

  const availableQuestionQuery = useAvailableQuestionById({
    id: questionId || '',
    // includeTopic: true,
    // includeAnswers: true,
    // includeAnswersCount: true,
  });
  const {
    question,
    isFetched: isQuestionFetched,
    isFetching: isQuestionFetching,
  } = availableQuestionQuery;
  const isQuestionPending = !isQuestionFetched || isQuestionFetching;

  // Fetch answers using dedicated hook
  const availableAnswersQuery = useAvailableAnswers({
    itemsLimit: null,
    questionId,
    // enabled: !!questionId,
  });
  const {
    allAnswers: answers,
    isFetching: isAnswersFetching,
    isFetched: isAnswersFetched,
    // error: answersError,
  } = availableAnswersQuery;
  const isAnswersPending = !isAnswersFetched || isAnswersFetching;

  // TODO: Use different titles depending on the current status
  const title = t('GenerateAnswersModal.Title');
  useModalTitle(title, shouldBeVisible);
  useUpdateModalVisibility(setVisible, shouldBeVisible);

  const generateAnswersMutation = useMutation({
    mutationFn: async (formData: TFormData) => {
      setError(undefined);

      // Cancel previous action before starting new
      abortControllerRef.current?.abort();
      // Initialize abort controller
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // throw new Error('Test generation error');

      // Prepare data...
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
      // Finished aborted generation (no other messages for the user will be disaplyed, only console warnings instead of errors)
      if (controller.signal.aborted) {
        const message = 'Generation aborted';
        // eslint-disable-next-line no-console
        console.warn('[GenerateAnswersModal:generateAnswersMutation]', message, {
          controller,
          queryData,
          messages,
          params,
        });
        setAborted(true);
        toast.warning(message);
        throw new DOMException(message, 'AbortError');
      }
      /* console.log('[GenerateAnswersModal:generateAnswersMutation] Generated query data', {
       *   // content: queryData?.content,
       *   queryData,
       * });
       */
      return queryData;
    },
    onSettled: () => {
      abortControllerRef.current = null;
    },
  });

  const retrieveAndParse = React.useCallback(
    async (formData: TFormData) => {
      try {
        if (!questionId) {
          toast.error(t('GenerateAnswersModal.NoQuestionIdDefined'));
          return;
        }
        // Form has been submitted
        setSubmited(true);
        /* console.log('[GenerateAnswersModal:retrieveAndParse] Start', {
         *   formData,
         *   questionId,
         * });
         */
        const queryPromise = generateAnswersMutation.mutateAsync(formData);
        toast.promise(queryPromise, {
          loading: t('GenerateAnswersModal.GeneratingAnswers'),
          success: t('GenerateAnswersModal.AnswersGenerated'),
          // error: t('GenerateAnswersModal.AnswersGenerationError'),
        });
        const queryData = await queryPromise;
        /* console.log('[GenerateAnswersModal:retrieveAndParse] Got generated query data', {
         *   queryData,
         * });
         */
        // Parsing answers...
        const answers = parseGeneratedQuestionAnswers(queryData);
        /* console.log('[GenerateAnswersModal:retrieveAndParse] Got parsed answers', {
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
        /* console.log('[GenerateAnswersModal:retrieveAndParse] Done', {
         *   newAnswers,
         * });
         */

        // Log the operation
        const __debugData = {
          newAnswers,
          queryData,
          questionId,
          formData,
        };
        const message = 'Parsed generated answers';
        const __idMsg = '[GenerateAnswersModal:retrieveAndParse] 🆗 ' + message;
        // eslint-disable-next-line no-console
        console.log(__idMsg, __debugData);
        logJsonData(__idMsg, { formData, questionId }, __debugData);

        // Store data
        setGeneratedAnswers(newAnswers);
      } catch (error) {
        const isAborted = (error as Error).name === 'AbortError';
        const message = isAborted ? 'Generation aborted' : 'Generation error occured';
        const details = getErrorText(error);
        const comboMsg = [message, details].filter(Boolean).join(': ');
        generateAnswersMutation.reset();
        if (isAborted) {
          // eslint-disable-next-line no-console
          console.warn('[GenerateAnswersModal:retrieveAndParse] Aborted:', comboMsg, {
            details,
            error,
          });
        } else {
          // eslint-disable-next-line no-console
          console.error('[GenerateAnswersModal:retrieveAndParse] ❌', comboMsg, {
            details,
            error,
          });
          debugger; // eslint-disable-line no-debugger
          toast.error(comboMsg);
          setError(comboMsg);
          // throw new Error(comboMsg);
        }
      }
    },
    [generateAnswersMutation, questionId, t],
  );

  const saveAnswersMutation = useMutation<TAvailableAnswer[], Error, TNewAnswer[]>({
    mutationFn: async (newAnswers) => {
      setError(undefined);

      // Cancel previous action before starting new
      abortControllerRef.current?.abort();
      // Initialize abort controller
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const savedAnswers = await addMultipleAnswers(newAnswers);

      // Finished aborted generation (no other messages for the user will be disaplyed, only console warnings instead of errors)
      if (controller.signal.aborted) {
        const message = 'Aborted save operation';
        const answerIds = savedAnswers?.map(({ id }) => id);
        // eslint-disable-next-line no-console
        console.warn('[GenerateAnswersModal:saveAnswersMutation]', message, {
          answerIds,
          savedAnswers,
          controller,
          newAnswers,
        });
        // Cleanup: remove added answers (if any)...
        if (answerIds?.length) {
          /* await: Don't wait for result */
          deleteAnswers(answerIds);
        }
        // Set abort flag, show toast and retrhoe the error
        setAborted(true);
        toast.warning(message);
        throw new DOMException(message, 'AbortError');
      }

      return savedAnswers;
    },
    onSettled: () => {
      abortControllerRef.current = null;
    },
  });

  const saveGeneratedAnswers = React.useCallback(async () => {
    try {
      if (!questionId) {
        throw new Error(t('GenerateAnswersModal.NoQuestionIdDefined'));
      }
      if (!generatedAnswers?.length) {
        throw new Error('No answers has been generated');
      }
      const newAnswers: TNewAnswer[] = generatedAnswers;
      /* console.log('[GenerateAnswersModal:saveGeneratedAnswers] Start', {
       *   newAnswers,
       * });
       */
      const addAnswersPromise = saveAnswersMutation.mutateAsync(newAnswers);
      toast.promise(addAnswersPromise, {
        loading: t('GenerateAnswersModal.AddingAnswers'),
        success: t('GenerateAnswersModal.AnswersAdded'),
        // error: t('GenerateAnswersModal.AnswersAddingError'),
      });
      const savedAnswers = await addAnswersPromise;
      /* console.log('[GenerateAnswersModal:saveGeneratedAnswers] Answers added', {
       *   savedAnswers,
       * });
       */

      setSavedAnswers(savedAnswers);

      // TODO: Issue #66: Verify all react-query invalidation
      // Invalidate parent question and its answers...
      const invalidatePrefixes = [
        ['available-question', questionId],
        ['available-answers-for-question', questionId],
      ].map(makeQueryKeyPrefix);
      invalidateKeysByPrefixes(queryClient, invalidatePrefixes);

      // return savedAnswers;
    } catch (error) {
      const isAborted = (error as Error).name === 'AbortError';
      const message = isAborted ? 'Saving answers aborted' : 'Saving answers error occured';
      const details = getErrorText(error);
      const comboMsg = [message, details].filter(Boolean).join(': ');
      saveAnswersMutation.reset();
      if (isAborted) {
        // eslint-disable-next-line no-console
        console.warn('[GenerateAnswersModal:saveGeneratedAnswers] Aborted:', comboMsg, {
          details,
          error,
        });
      } else {
        // eslint-disable-next-line no-console
        console.error('[GenerateAnswersModal:saveGeneratedAnswers] ❌', comboMsg, {
          details,
          error,
        });
        debugger; // eslint-disable-line no-debugger
        setError(comboMsg);
        // throw new Error(comboMsg);
      }
    }
  }, [saveAnswersMutation, generatedAnswers, queryClient, questionId, t]);

  const resetOperations = React.useCallback(() => {
    /* console.log('[GenerateAnswersModal:resetOperations]', {
     *   abortControllerRef_current: abortControllerRef.current,
     *   generateAnswersMutation_isPending: generateAnswersMutation.isPending,
     *   saveAnswersMutation_isPending: saveAnswersMutation.isPending,
     * });
     */
    abortControllerRef.current?.abort();
    if (generateAnswersMutation.isPending) {
      generateAnswersMutation.reset();
    }
    if (saveAnswersMutation.isPending) {
      saveAnswersMutation.reset();
    }
  }, [abortControllerRef, saveAnswersMutation, generateAnswersMutation]);

  /** Hide modal & canecl all pending operations */
  const hideModal = React.useCallback(() => {
    resetOperations();
    setVisible(false);
    goBack();
  }, [goBack, resetOperations]);

  const backToForm = React.useCallback(() => {
    resetOperations();
    // Reset state in order to show the form
    setCorrecting(false);
    setGeneratedAnswers(undefined);
    setSavedAnswers(undefined);
    // Reset form submited status
    setSubmited(false);
  }, [resetOperations]);

  if (!shouldBeVisible || !topicId || !questionId) {
    return null;
    // throw new Error('Cannot parse topic id from the modal url.');
  }

  const areMutationsPending = generateAnswersMutation.isPending || saveAnswersMutation.isPending;
  const isBusy = isSessionLoading || isAnswersPending || isQuestionPending || areMutationsPending;

  return (
    <Modal
      isVisible={isVisible}
      hideModal={hideModal}
      className={cn(
        isDev && '__GenerateAnswersModal', // DEBUG
        'flex flex-col gap-0',
        'text-theme-foreground',
        !isMobile && 'max-h-[90%]',
        isBusy && '[&>*]:opacity-50',
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
        <ScrollArea
          className={cn(
            isDev && '__GenerateAnswersModal_Scroll', // DEBUG
          )}
          viewportClassName={cn(
            isDev && '__GenerateAnswersModal_ScrollViewport', // DEBUG
            'flex flex-1 flex-col',
            '[&>div]:relative',
            '[&>div]:!flex [&>div]:my-6 [&>div]:gap-6 [&>div]:flex-col [&>div]:flex-1',
          )}
        >
          {/* Small error box: error && (
            <div
              className={cn(
                isDev && '__GenerateAnswersModal_error', // DEBUG
                'mx-6 flex items-center gap-1 rounded-md border border-red-500/20 bg-red-500/20 p-3 py-2 text-sm',
              )}
            >
              <Icons.Warning className="mr-1 size-4 text-red-500 opacity-50" />
              <span className="text-red-500">{error}</span>
            </div>
          )*/}

          {isSessionLoading ? (
            <BusySplashWithInfo title="Preparing..." className="p-6" />
          ) : error ? (
            <PageError
              title="Error occured"
              error={error}
              extraActions={
                <Button onClick={hideModal} className="content-truncate flex gap-2">
                  <Icons.Close className="size-4 shrink-0" />
                  <span className="truncate">{t('Close')}</span>
                </Button>
              }
            />
          ) : isAborted && !isSubmited ? (
            <PageError
              title="Operation aborted"
              // error={error}
              extraActions={
                <Button onClick={hideModal} className="content-truncate flex gap-2">
                  <Icons.Close className="size-4 shrink-0" />
                  <span className="truncate">{t('Close')}</span>
                </Button>
              }
            />
          ) : saveAnswersMutation.isPending || savedAnswers ? (
            // Final screen
            <SavedScreen
              className="px-6"
              handleClose={hideModal}
              backToForm={backToForm}
              isSaving={saveAnswersMutation.isPending}
              questionId={questionId}
              savedAnswers={savedAnswers}
            />
          ) : generatedAnswers && isCorrecting ? (
            // Verify generated answers
            <div className="m-12 text-center">Correcting answers</div>
          ) : generateAnswersMutation.isPending || generatedAnswers ? (
            // Final screen
            <GeneratedScreen
              className="px-6"
              handleClose={hideModal}
              backToForm={backToForm}
              isGenerating={generateAnswersMutation.isPending}
              questionId={questionId}
              generatedAnswers={generatedAnswers}
              saveAnswers={saveGeneratedAnswers}
              correctAnswers={() => {
                if (!generatedAnswers?.length) {
                  toast.error('No generated answers to correct');
                } else {
                  setCorrecting(true);
                }
              }}
            />
          ) : !isSubmited ? (
            // Generate form
            <GenerateAnswersForm
              startGeneratingAnswers={retrieveAndParse}
              className="px-6"
              handleClose={hideModal}
              isPending={isBusy}
              questionId={questionId}
            />
          ) : null}
        </ScrollArea>
      </div>
    </Modal>
  );
}
