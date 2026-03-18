'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { defaultAiClientType } from '@/lib/ai/types';
import { getErrorText } from '@/lib/helpers';
import { invalidateKeysByPrefixes, makeQueryKeyPrefix } from '@/lib/helpers/react-query';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { useRouteChanging } from '@/hooks/next-router/useRouteChanging';
import { Button } from '@/components/ui/Button';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { TActionMenuItem } from '@/components/dashboard/DashboardActions';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { BusySplash, PageError } from '@/components/shared';
import * as Icons from '@/components/shared/Icons';
import { availableTopicsRoute, defaultAIGenerationTemperature } from '@/config';
import { isDev } from '@/constants';
import { TTopicsManageScopeId } from '@/contexts/TopicsContext';
import { AIGenerationsStatusInfo } from '@/features/ai-generations/components';
import { useAIGenerationsStatus } from '@/features/ai-generations/query-hooks';
import {
  createGenerateTopicQuestionsMessages,
  parseGeneratedTopicQuestions,
} from '@/features/ai/helpers';
import { useUserAIRequest } from '@/features/ai/hooks';
import {
  answersGenerationTypes,
  questionsGenerationTypes,
  TAIQuerDebugDataId,
  TAITextQueryData,
  TGenerateTopicQuestionsParams,
} from '@/features/ai/types';
import { logJsonData } from '@/features/logger/server-actions';
import { addMultipleQuestions, deleteQuestions } from '@/features/questions/actions';
import { useQuestionsBreadcrumbsItems } from '@/features/questions/components/QuestionsBreadcrumbs';
import { TAvailableQuestion, TNewQuestion } from '@/features/questions/types';
import { TTopicId } from '@/features/topics/types';
import { useAvailableTopicById, useDocumentTitle, useGoBack, useSessionData } from '@/hooks';

import { ContentSkeleton, InnerContentSkeleton } from './ContentSkeleton';
import { EditScreen } from './EditScreen';
import { GeneratedScreen } from './GeneratedScreen';
import { GenerateQuestionsForm } from './GenerateQuestionsForm';
import { SavedScreen } from './SavedScreen';
import { formSchema, TFormData } from './types';

/** A debug data file id */
const debugDataId: TAIQuerDebugDataId = 'questions-query-data-06';

/** Show debug data to test questions editing and generated splash */
const __debugGenerated = isDev && false;
const __debugGeneratedQuestions: TNewQuestion[] | undefined = __debugGenerated
  ? [
      // DEBUG: Test data
      {
        topicId: 'xxx', // cml6pgajf0001nvjsxuordxpm
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

const __now = new Date();

/** Show debug data to test saved questions */
const __debugSaved = isDev && false;
const __debugSavedQuestions: TAvailableQuestion[] | undefined = __debugSaved
  ? [
      // DEBUG: Test data
      {
        id: 'zzz',
        order: null,
        extraQuery: null,
        topicId: 'cml6pgajf0001nvjsxuordxpm',
        text: 'Sample saved question',
        answersCountRandom: null,
        answersCountMin: null,
        answersCountMax: null,
        createdAt: __now,
        updatedAt: __now,
        answers: [
          {
            id: 'aaa',
            order: null,
            questionId: 'zzz',
            createdAt: __now,
            updatedAt: __now,
            isGenerated: true,
            text: 'Sample answer',
            explanation: 'Sample explanation',
            isCorrect: true,
            // isSaved: true,
          },
        ],
        isGenerated: true,
      },
    ]
  : undefined;

export interface TGenerateQuestionsPageWrapperProps {
  scope: TTopicsManageScopeId;
  topicId: TTopicId;
}

export function GenerateQuestionsPageWrapper(props: TGenerateQuestionsPageWrapperProps) {
  const { scope, topicId } = props;

  const { user, loading: isSessionLoading } = useSessionData();
  const isAdmin = user?.role === 'ADMIN';

  const t = useT();

  const { isRouteChanging } = useRouteChanging();

  const topicsListRoutePath = `/topics/${scope}`;
  const topicRoutePath = `${topicsListRoutePath}/${topicId}`;
  const questionsListRoutePath = `${topicRoutePath}/questions`;
  // const questionRoutePath = `${questionsListRoutePath}/${questionId}`;
  // const answersListRoutePath = `${questionRoutePath}/answers`;
  // const answerRoutePath = `${answersListRoutePath}/${answerId}`;

  const [error, setError] = React.useState<string | undefined>();

  const [isLeaving, setLeaving] = React.useState(false);

  const [isEditing, setEditing] = React.useState<boolean>(false && __debugGenerated);
  const [generatedQuestions, setGeneratedQuestions] = React.useState<TNewQuestion[] | undefined>(
    __debugGeneratedQuestions,
  );
  const [savedQuestions, setSavedQuestions] = React.useState<TAvailableQuestion[] | undefined>(
    __debugSavedQuestions,
  );

  const __useDebugData = isDev || isAdmin;

  const defaultValues: TFormData = React.useMemo(
    () => ({
      debugData: __useDebugData,
      questionsGenerationType: questionsGenerationTypes[0],
      questionsCountMin: isDev ? 1 : 5,
      questionsCountMax: isDev ? 1 : 10,
      answersGenerationType: answersGenerationTypes[0],
      answersCountMin: isDev ? 1 : 2,
      answersCountMax: isDev ? 1 : 6,
      extraText: '',
      clientType: defaultAiClientType,
      temperature: defaultAIGenerationTemperature,
    }),
    [__useDebugData],
  );

  const form = useForm<TFormData>({
    mode: 'onChange',
    criteriaMode: 'all',
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const abortControllerRef = React.useRef<AbortController | null>(null);

  const userAIRequest = useUserAIRequest();

  const availableTopicQuery = useAvailableTopicById({
    id: topicId || '',
    includeQuestions: true,
    includeQuestionsCount: true,
  });
  const { topic, isFetched, isFetching } = availableTopicQuery;
  // TODO: Add check for availableTopicQuery request timout handling (and for all react-query hooks, in general; and for abort, too)
  const isTopicPending = !isFetched || isFetching;

  const questionsCount = topic?._count?.questions;
  const allowedTraining = !!questionsCount;

  const goBack = useGoBack(topicsListRoutePath);
  // const goToTheRoute = useGoToTheRoute();

  const aiGenerationsStatusQuery = useAIGenerationsStatus({
    traceId: 'GenerateQuestionsPageWrapper',
  });
  const { allowed: aiGenerationsAllowed, loading: aiGenerationsLoading } = aiGenerationsStatusQuery;

  const isPreparing = isSessionLoading || aiGenerationsLoading;

  const queryClient = useQueryClient();

  const questions = topic?.questions;

  // TODO: Add `useAvailableQuestions` to fetch required questions (for `existedQuestions` and for new questions comparing in the editor screen)?

  // Using different titles depending on the current status
  const title = React.useMemo(
    () =>
      savedQuestions
        ? t('GenerateQuestionsModal.QuestionsSaved')
        : isEditing
          ? t('GenerateQuestionsModal.EditingQuestions')
          : generatedQuestions
            ? t('GenerateQuestionsModal.QuestionsGeneratedStatus')
            : t('GenerateQuestionsModal.DialogTitle'),
    [generatedQuestions, isEditing, savedQuestions, t],
  );

  useDocumentTitle(title);

  const generateQuestionsMutation = useMutation({
    mutationFn: async (formData: TFormData) => {
      setError(undefined);

      // Cancel previous action before starting new
      abortControllerRef.current?.abort('Cleaned up');
      // Initialize abort controller
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const abortPromise = new Promise<never>((_, rej) => (controller.signal.onabort = rej));

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

      const queryData: TAITextQueryData = await Promise.race([
        abortPromise,
        userAIRequest(messages, {
          topicId,
          debugData: debugData ? debugDataId : undefined,
          clientType,
          temperature,
        }),
      ]);

      return queryData;
    },
    onSettled: () => {
      abortControllerRef.current = null;
    },
  });
  const saveQuestionsMutation = useMutation<TAvailableQuestion[], Error, TNewQuestion[]>({
    mutationFn: async (newQuestions) => {
      setError(undefined);

      // Cancel previous action before starting new
      abortControllerRef.current?.abort('Cleaned up');
      // Initialize abort controller
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const abortPromise = new Promise<never>((_, rej) => (controller.signal.onabort = rej));

      const savePromise = addMultipleQuestions(newQuestions);

      // Handle aborted operation and clean up...
      savePromise.then((savedQuestions) => {
        if (controller.signal.aborted) {
          const questionIdsToRemove = savedQuestions?.map(({ id }) => id);
          // eslint-disable-next-line no-console
          console.warn('[GenerateQuestionsPageWrapper:saveQuestionsMutation:aborted]', {
            questionIdsToRemove,
            savedQuestions,
            newQuestions,
            controller,
          });
          // Cleanup: remove added questions (if any)...
          if (questionIdsToRemove?.length) {
            /* await: Don't wait for result */
            deleteQuestions(questionIdsToRemove);
          }
        }
      });

      const savedQuestions = await Promise.race([abortPromise, savePromise]);
      return savedQuestions;
    },
    onSettled: () => {
      abortControllerRef.current = null;
    },
  });

  const resetOperations = React.useCallback(() => {
    abortControllerRef.current?.abort('Aborted by user');
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

  const generateCallback = React.useCallback(
    async (formData: TFormData) => {
      try {
        if (!topicId) {
          toast.error(t('GenerateQuestionsModal.NoTopicIdDefined'));
          return;
        }
        const queryPromise = generateQuestionsMutation.mutateAsync(formData);
        toast.promise(queryPromise, {
          loading: t('GenerateQuestionsModal.ReceivingGeneratedData'),
          success: t('GenerateQuestionsModal.ToastSuccessData'),
          // error: t('GenerateQuestionsModal.ToastErrorData'),
          cancel: {
            label: t('Cancel'),
            onClick: resetOperations,
          },
        });

        const queryData = await queryPromise;
        const questions = parseGeneratedTopicQuestions(queryData);
        if (!questions?.length) {
          throw new Error(t('GenerateQuestionsModal.NoQuestionsGenerated'));
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
        const isAborted =
          (error instanceof Event && error.type === 'abort') ||
          (error as Error).name === 'AbortError';
        const message = isAborted
          ? t('GenerateQuestionsModal.GenerationAborted')
          : t('GenerateQuestionsModal.GenerationError');
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
          toast.error(message);
          setError(message);
        }
      }
    },
    [generateQuestionsMutation, topicId, t, resetOperations],
  );

  const saveCallback = React.useCallback(async () => {
    try {
      if (!topicId) {
        throw new Error(t('GenerateQuestionsModal.NoTopicIdDefined'));
      }
      if (!generatedQuestions?.length) {
        throw new Error(t('GenerateQuestionsModal.NoQuestionsGenerated'));
      }

      const addQuestionsPromise = saveQuestionsMutation.mutateAsync(generatedQuestions);
      toast.promise(addQuestionsPromise, {
        loading: t('GenerateQuestionsModal.ToastLoadingQuestions'),
        success: t('GenerateQuestionsModal.ToastSuccessQuestions'),
        // error: t('GenerateQuestionsModal.ToastErrorQuestions'),
        cancel: {
          label: t('Cancel'),
          onClick: resetOperations,
        },
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
      const isAborted =
        (error instanceof Event && error.type === 'abort') ||
        (error as Error).name === 'AbortError';
      const message = isAborted
        ? t('GenerateQuestionsModal.SavingQuestionsAborted')
        : t('GenerateQuestionsModal.SavingQuestionsError');
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
        toast.error(message);
        setError(message);
      }
    }
  }, [saveQuestionsMutation, generatedQuestions, queryClient, topicId, t, resetOperations]);

  const startOverCallback = React.useCallback(() => {
    resetOperations();
    // Reset state in order to show the form
    setEditing(false);
    setError(undefined);
    setGeneratedQuestions(undefined);
    setSavedQuestions(undefined);
  }, [resetOperations]);

  /** Hide modal & cancel all pending operations */
  const cancelAndGoBack = React.useCallback(() => {
    setLeaving(true);
    resetOperations();
    goBack();
  }, [goBack, resetOperations]);

  const areMutationsPending =
    generateQuestionsMutation.isPending || saveQuestionsMutation.isPending;
  const isBusy = isPreparing || isTopicPending || areMutationsPending;

  const actions: TActionMenuItem[] = React.useMemo(
    () => [
      {
        id: 'Back',
        content: t('Back'),
        icon: Icons.ArrowLeft,
        visibleFor: 'sm',
        onClick: cancelAndGoBack,
      },
      {
        id: 'AddNewQuestion',
        content: t('AddNewQuestion'),
        icon: Icons.Add,
        visibleFor: 'xl',
        href: `${topicRoutePath}/questions/add`,
      },
      {
        id: 'AddNewTopic',
        content: t('AddNewTopic'),
        icon: Icons.Add,
        href: `${topicsListRoutePath}/add`,
      },
      {
        id: 'GoToTheTopic',
        content: t('GoToTheTopic'),
        icon: Icons.ArrowRight,
        href: topicRoutePath,
      },
      {
        id: 'GoToTheQuestions',
        content: t('GoToTheQuestions'),
        icon: Icons.ArrowRight,
        href: questionsListRoutePath,
      },
      {
        id: 'ToTraining',
        content: t('ToTraining'),
        icon: Icons.Rocket,
        href: `${availableTopicsRoute}/${topicId}/workout`,
        hidden: !allowedTraining,
      },
    ],
    [
      t,
      cancelAndGoBack,
      topicRoutePath,
      topicsListRoutePath,
      questionsListRoutePath,
      topicId,
      allowedTraining,
    ],
  );

  const breadcrumbs = useQuestionsBreadcrumbsItems({
    scope,
    topic: topic || undefined,
    lastItem: { content: t('Generation') },
  });

  const __showSkeleton = false;
  if (__showSkeleton) {
    return <ContentSkeleton />;
  }

  return (
    <>
      <DashboardHeader
        heading={title}
        className={cn(
          isDev && '__GenerateQuestionsPageWrapper_DashboardHeader', // DEBUG
          'mx-6 transition',
          (isRouteChanging || isLeaving) && 'disabled',
        )}
        actions={actions}
        breadcrumbs={breadcrumbs}
        inactiveLastBreadcrumb
      />
      <ScrollArea
        className={cn(
          isDev && '__GenerateQuestionsModal_Scroll', // DEBUG
          'transition',
          (isRouteChanging || isLeaving) && 'disabled',
        )}
        viewportClassName={cn(
          isDev && '__GenerateQuestionsModal_ScrollViewport', // DEBUG
          'flex flex-1 flex-col',
          '[&>div]:!flex [&>div]:gap-6 [&>div]:flex-col [&>div]:flex-1',
        )}
      >
        {isPreparing ? (
          <InnerContentSkeleton className="px-6" />
        ) : error ? (
          <PageError
            title={t('GenerateQuestionsModal.ErrorOccured')}
            error={error}
            extraActions={
              <Button onClick={startOverCallback} className="content-truncate flex gap-2">
                <Icons.Refresh className="size-4 shrink-0" />
                <span className="truncate">{t('StartOver')}</span>
              </Button>
            }
          />
        ) : !aiGenerationsAllowed ? (
          <PageError
            title={t('NoAiGenrationsAvailable')}
            explanation={
              <AIGenerationsStatusInfo className="justify-center border-0 bg-transparent" />
            }
            className="mx-6"
          />
        ) : savedQuestions ? (
          <SavedScreen
            className="px-6"
            startOverCallback={startOverCallback}
            scope={scope}
            topicId={topicId}
            savedQuestions={savedQuestions}
          />
        ) : generatedQuestions && isEditing ? (
          <EditScreen
            className="px-6"
            startOverCallback={startOverCallback}
            topicId={topicId}
            isSaving={saveQuestionsMutation.isPending}
            handleCancel={resetOperations}
            generatedQuestions={generatedQuestions}
            saveQuestions={saveCallback}
          />
        ) : generatedQuestions ? (
          <GeneratedScreen
            className="px-6"
            startOverCallback={startOverCallback}
            handleCancel={resetOperations}
            topicId={topicId}
            isSaving={saveQuestionsMutation.isPending}
            generatedQuestions={generatedQuestions}
            saveQuestions={saveCallback}
            /* // TODO: Issue #80: Implement simple questions editing
             * editQuestions={() => {
             *   if (!generatedQuestions?.length) {
             *     toast.error(t('GenerateQuestionsModal.NoQuestionsGenerated'));
             *   } else {
             *     setEditing(true);
             *   }
             * }}
             */
          />
        ) : (
          <GenerateQuestionsForm
            form={form}
            generateCallback={generateCallback}
            handleCancel={resetOperations}
            className="px-6"
            isGenerating={generateQuestionsMutation.isPending}
            isPending={isBusy}
            topicId={topicId}
          />
        )}

        {/* Leaving splash */}
        <BusySplash
          className={cn(
            isDev && '__GenerateQuestionsPageWrapper_BusySplash', // DEBUG
          )}
          isBusy={isRouteChanging || isLeaving}
        />
      </ScrollArea>
    </>
  );
}
