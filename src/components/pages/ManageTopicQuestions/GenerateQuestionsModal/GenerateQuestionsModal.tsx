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
import { Button } from '@/components/ui/Button';
import { DialogDescription, DialogTitle } from '@/components/ui/Dialog';
import { Modal } from '@/components/ui/Modal';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { BusySplashWithInfo, PageError } from '@/components/shared';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
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
import { logJsonData } from '@/features/logger/server-actions';
import { addMultipleQuestions, deleteQuestions } from '@/features/questions/actions';
import { TAvailableQuestion, TNewQuestion } from '@/features/questions/types';
import {
  useAvailableTopicById,
  useGoBack,
  useMediaQuery,
  useModalTitle,
  useUpdateModalVisibility,
} from '@/hooks';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

import { EditScreen } from './EditScreen';
import { GeneratedScreen } from './GeneratedScreen';
import { GenerateQuestionsForm } from './GenerateQuestionsForm';
import { SavedScreen } from './SavedScreen';
import { TFormData } from './types';

// Url example: /en/topics/my/[topicId]/questions/generate
const urlPostfix = '/questions/generate';
const urlTopicsToken = '/topics/';
const idToken = '([^/]*)';
const urlRegExp = new RegExp(urlTopicsToken + idToken + '/' + idToken + urlPostfix + '$');

/** A debug data file id */
const debugDataId: TAIQuerDebugDataId = 'questions-query-data-05';

/** Show debug data to test questions editing */
const __debugEdit = isDev && false;
const __debugGeneratedQuestions: TNewQuestion[] | undefined = __debugEdit
  ? [
      // DEBUG: Test data
      {
        topicId: 'xxx',
        text: 'Sample generated question',
        answers: [
          {
            text: 'Sample answer',
            explanation: 'Sample explanation',
            isCorrect: true,
            // isGenerated: true,
          },
        ],
        isGenerated: true,
      },
    ]
  : undefined;

export function GenerateQuestionsModal() {
  const { manageScope } = useManageTopicsStore();
  const [isVisible, setVisible] = React.useState(true);
  const [error, setError] = React.useState<string | undefined>();

  const [isEditing, setEditing] = React.useState<boolean>(__debugEdit);
  const [generatedQuestions, setGeneratedQuestions] = React.useState<TNewQuestion[] | undefined>(
    __debugGeneratedQuestions,
  );
  const [savedQuestions, setSavedQuestions] = React.useState<TAvailableQuestion[] | undefined>();
  const [isSubmited, setSubmited] = React.useState(false);

  const [_isAborted, setAborted] = React.useState(false);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const userAIRequest = useUserAIRequest();

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

  // const goToTheRoute = useGoToTheRoute();
  const goBack = useGoBack(questionsListRoutePath);

  const availableTopicQuery = useAvailableTopicById({
    id: topicId || '',
    includeQuestions: true,
    includeQuestionsCount: true,
  });
  const { topic, isFetched, isFetching } = availableTopicQuery;
  // TODO: Add check for availableTopicQuery request timout handling (and for all react-query hooks, in general; and for abort, too)
  const isTopicPending = !isFetched || isFetching;

  const questions = topic?.questions;

  // Using different titles depending on the current status
  const title = isEditing
    ? t('GenerateQuestionsModal.EditingQuestions')
    : savedQuestions
      ? t('GenerateQuestionsModal.QuestionsSaved')
      : generatedQuestions
        ? t('GenerateQuestionsModal.QuestionsGeneratedStatus')
        : t('GenerateQuestionsModal.DialogTitle');

  useModalTitle(title, shouldBeVisible);
  useUpdateModalVisibility(setVisible, shouldBeVisible);

  const generateQuestionsMutation = useMutation({
    mutationFn: async (formData: TFormData) => {
      setError(undefined);

      // Cancel previous action before starting new
      abortControllerRef.current?.abort();
      // Initialize abort controller
      const controller = new AbortController();
      abortControllerRef.current = controller;

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

      const messages = createGenerateTopicQuestionsMessages(params);
      const queryData: TAITextQueryData = await userAIRequest(messages, {
        topicId,
        debugData: debugData ? debugDataId : undefined,
        clientType,
        temperature,
        // signal: controller.signal,
      });

      // Finished aborted generation
      if (controller.signal.aborted) {
        const message = 'Generation aborted';
        // eslint-disable-next-line no-console
        console.warn('[GenerateQuestionsModal:generateQuestionsMutation]', message, {
          controller,
          queryData,
          messages,
          params,
        });
        setAborted(true);
        toast.warning(message);
        throw new DOMException(message, 'AbortError');
      }

      return queryData;
    },
    onSettled: () => {
      abortControllerRef.current = null;
    },
  });

  const generateCallback = React.useCallback(
    async (formData: TFormData) => {
      try {
        if (!topicId) {
          toast.error(t('GenerateQuestionsModal.NoTopicIdDefined'));
          return;
        }

        setSubmited(true);
        const queryPromise = generateQuestionsMutation.mutateAsync(formData);
        toast.promise(queryPromise, {
          loading: t('GenerateQuestionsModal.ToastLoadingData'),
          success: t('GenerateQuestionsModal.ToastSuccessData'),
          error: t('GenerateQuestionsModal.ToastErrorData'),
        });

        const queryData = await queryPromise;
        const questions = parseGeneratedTopicQuestions(queryData);
        if (!questions?.length) {
          throw new Error(t('GenerateQuestionsModal.NoQuestionsGeneratedError'));
        }

        const newQuestions: TNewQuestion[] = questions.map((q) => ({
          ...q,
          topicId,
          isGenerated: true,
        }));

        // Log the operation
        const __debugData = {
          newQuestions,
          queryData,
          topicId,
          formData,
        };
        const message = 'Parsed generated questions';
        const __idMsg = '[GenerateQuestionsModal:generateCallback] 🆗 ' + message;
        // eslint-disable-next-line no-console
        console.log(__idMsg, __debugData);
        logJsonData(__idMsg, { formData, topicId }, __debugData);

        setGeneratedQuestions(newQuestions);
      } catch (error) {
        const isAborted = (error as Error).name === 'AbortError';
        const message = isAborted
          ? t('GenerateQuestionsModal.GenerationAborted')
          : t('GenerateQuestionsModal.GenerationErrorOccured');
        const details = getErrorText(error);
        const comboMsg = [message, details].filter(Boolean).join(': ');
        generateQuestionsMutation.reset();

        if (isAborted) {
          // eslint-disable-next-line no-console
          console.warn('[GenerateQuestionsModal:generateCallback] Aborted:', comboMsg, {
            details,
            error,
          });
        } else {
          // eslint-disable-next-line no-console
          console.error('[GenerateQuestionsModal:generateCallback] ❌', comboMsg, {
            details,
            error,
          });
          debugger; // eslint-disable-line no-debugger
          toast.error(comboMsg);
          setError(comboMsg);
        }
      }
    },
    [generateQuestionsMutation, topicId, t],
  );

  const saveQuestionsMutation = useMutation<TAvailableQuestion[], Error, TNewQuestion[]>({
    mutationFn: async (newQuestions) => {
      setError(undefined);

      // Cancel previous action before starting new
      abortControllerRef.current?.abort();
      // Initialize abort controller
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const savedQuestions = await addMultipleQuestions(newQuestions);

      // Finished aborted generation
      if (controller.signal.aborted) {
        const message = 'Aborted save operation';
        const questionIds = savedQuestions?.map(({ id }) => id);
        // eslint-disable-next-line no-console
        console.warn('[GenerateQuestionsModal:saveQuestionsMutation]', message, {
          questionIds,
          savedQuestions,
          controller,
          newQuestions,
        });
        // Cleanup: remove added questions (if any)...
        if (questionIds?.length) {
          /* await: Don't wait for result */
          deleteQuestions(questionIds);
        }
        // Set abort flag, show toast and retrhoe the error
        setAborted(true);
        toast.warning(message);
        throw new DOMException(message, 'AbortError');
      }

      return savedQuestions;
    },
    onSettled: () => {
      abortControllerRef.current = null;
    },
  });
  const saveCallback = React.useCallback(async () => {
    try {
      if (!topicId) {
        throw new Error(t('GenerateQuestionsModal.NoTopicIdDefined'));
      }
      if (!generatedQuestions?.length) {
        throw new Error('No questions has been generated');
      }

      const addQuestionsPromise = saveQuestionsMutation.mutateAsync(generatedQuestions);
      toast.promise(addQuestionsPromise, {
        loading: t('GenerateQuestionsModal.ToastLoadingQuestions'),
        success: t('GenerateQuestionsModal.ToastSuccessQuestions'),
        error: t('GenerateQuestionsModal.ToastErrorQuestions'),
      });

      const savedQuestions = await addQuestionsPromise;
      setSavedQuestions(savedQuestions);

      // Invalidate parent topic and its questions...
      const invalidatePrefixes = [
        ['available-topic', topicId],
        ['available-questions-for-topic', topicId],
      ].map(makeQueryKeyPrefix);
      invalidateKeysByPrefixes(queryClient, invalidatePrefixes);
    } catch (error) {
      const isAborted = (error as Error).name === 'AbortError';
      const message = isAborted
        ? t('GenerateQuestionsModal.SavingQuestionsAborted')
        : t('GenerateQuestionsModal.SavingQuestionsErrorOccured');
      const details = getErrorText(error);
      const comboMsg = [message, details].filter(Boolean).join(': ');
      saveQuestionsMutation.reset();

      if (isAborted) {
        // eslint-disable-next-line no-console
        console.warn('[GenerateQuestionsModal:saveCallback] Aborted:', comboMsg, {
          details,
          error,
        });
      } else {
        // eslint-disable-next-line no-console
        console.error('[GenerateQuestionsModal:saveCallback] ❌', comboMsg, {
          details,
          error,
        });
        debugger; // eslint-disable-line no-debugger
        setError(comboMsg);
      }
    }
  }, [saveQuestionsMutation, generatedQuestions, queryClient, topicId, t]);

  const resetOperations = React.useCallback(() => {
    abortControllerRef.current?.abort();
    // Cancel all react-queries with a single command
    queryClient.cancelQueries({
      queryKey: [
        // All used query keys...
        availableTopicQuery.queryKey,
      ].filter(Boolean),
    });
    // Reset mutations
    if (generateQuestionsMutation.isPending) {
      generateQuestionsMutation.reset();
    }
    if (saveQuestionsMutation.isPending) {
      saveQuestionsMutation.reset();
    }
  }, [
    abortControllerRef,
    saveQuestionsMutation,
    generateQuestionsMutation,
    queryClient,
    availableTopicQuery,
  ]);

  const backToForm = React.useCallback(() => {
    resetOperations();
    // Reset state in order to show the form
    setEditing(false);
    setGeneratedQuestions(undefined);
    setSavedQuestions(undefined);
    // Reset form submited status
    setSubmited(false);
  }, [resetOperations]);

  /** Hide modal & cancel all pending operations */
  const hideModal = React.useCallback(() => {
    resetOperations();
    setVisible(false);
    goBack();
  }, [goBack, resetOperations]);

  if (!shouldBeVisible || !topicId) {
    return null;
  }

  const areMutationsPending =
    generateQuestionsMutation.isPending || saveQuestionsMutation.isPending;
  const isBusy = isTopicPending || areMutationsPending;

  return (
    <Modal
      isVisible={isVisible}
      hideModal={hideModal}
      className={cn(
        isDev && '__GenerateQuestionsModal',
        'flex flex-col gap-0',
        'text-theme-foreground',
        !isMobile && 'max-h-[90%]',
        isBusy && '[&>*]:opacity-50',
      )}
    >
      <div
        className={cn(
          isDev && '__GenerateQuestionsModal_Header',
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
          isDev && '__GenerateQuestionsModal_Wrapper',
          'relative flex min-h-24 flex-col overflow-hidden',
          'text-foreground',
        )}
      >
        <ScrollArea
          className={cn(isDev && '__GenerateQuestionsModal_Scroll')}
          viewportClassName={cn(
            isDev && '__GenerateQuestionsModal_ScrollViewport',
            'flex flex-1 flex-col',
            '[&>div]:relative',
            '[&>div]:!flex [&>div]:my-6 [&>div]:gap-6 [&>div]:flex-col [&>div]:flex-1',
          )}
        >
          {isSessionLoading ? (
            <BusySplashWithInfo title={t('GenerateQuestionsModal.Preparing')} className="p-6" />
          ) : error ? (
            <PageError
              title={t('GenerateQuestionsModal.ErrorOccured')}
              error={error}
              extraActions={
                <Button onClick={hideModal} className="content-truncate flex gap-2">
                  <Icons.Close className="size-4 shrink-0" />
                  <span className="truncate">{t('Close')}</span>
                </Button>
              }
            />
          ) : saveQuestionsMutation.isPending || savedQuestions ? (
            // Final screen
            <SavedScreen
              className="px-6"
              handleClose={hideModal}
              backToForm={backToForm}
              isSaving={saveQuestionsMutation.isPending}
              topicId={topicId}
              savedQuestions={savedQuestions}
            />
          ) : generatedQuestions && isEditing ? (
            // Verify generated questions
            <EditScreen
              className="px-6"
              handleClose={hideModal}
              backToForm={backToForm}
              topicId={topicId}
              generatedQuestions={generatedQuestions}
              saveQuestions={() => {
                if (!generatedQuestions?.length) {
                  toast.error(t('GenerateQuestionsModal.NoQuestionsGenerated'));
                } else {
                  setEditing(true);
                }
              }}
            />
          ) : generateQuestionsMutation.isPending || generatedQuestions ? (
            // Final screen
            <GeneratedScreen
              className="px-6"
              handleClose={hideModal}
              backToForm={backToForm}
              isGenerating={generateQuestionsMutation.isPending}
              topicId={topicId}
              generatedQuestions={generatedQuestions}
              saveQuestions={saveCallback}
              // TODO: Issue #80: Implement simple questions editing
              editQuestions={() => {
                if (!generatedQuestions?.length) {
                  toast.error('No generated questions to edit');
                } else {
                  setEditing(true);
                }
              }}
            />
          ) : !isSubmited ? (
            // Generate form
            <GenerateQuestionsForm
              generateCallback={generateCallback}
              className="px-6"
              handleClose={hideModal}
              isPending={isBusy}
              topicId={topicId}
            />
          ) : null}
        </ScrollArea>
      </div>
    </Modal>
  );
}
