'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { defaultAiClientType } from '@/lib/ai';
import { getErrorText } from '@/lib/helpers';
import { invalidateKeysByPrefixes, makeQueryKeyPrefix } from '@/lib/helpers/react-query';
import { TGetResultsInfiniteQueryData } from '@/lib/types';
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
import { getUniqueIdForSet, newItemIdPrefix, TSaveDataParams } from '@/entities/HeadlessEditor';
import { AIGenerationsStatusInfo } from '@/features/ai-generations/components';
import { useAIGenerationsStatus } from '@/features/ai-generations/query-hooks';
import {
  createGenerateQuestionAnswersMessages,
  parseGeneratedQuestionAnswers,
} from '@/features/ai/helpers';
import { useUserAIRequest } from '@/features/ai/hooks';
import { TAIQuerDebugDataId, TAITextQueryData } from '@/features/ai/types';
import {
  answersGenerationTypes,
  TGenerateQuestionAnswersParams,
} from '@/features/ai/types/GenerateAnswersTypes';
import {
  TUpdateAnswersDataViaParamsResults,
  updateAnswersDataViaParams,
} from '@/features/answers/actions/updateAnswersDataViaParams';
import { useAnswersBreadcrumbsItems } from '@/features/answers/components/AnswersBreadcrumbs';
import { TAvailableAnswer, TNewOrOldAnswer } from '@/features/answers/types';
import { logJsonData } from '@/features/logger/server-actions';
import {
  useAvailableAnswers,
  useAvailableQuestionById,
  useAvailableTopicById,
  useDocumentTitle,
  useGoBack,
  useSessionData,
} from '@/hooks';

import { ContentSkeleton, InnerContentSkeleton } from './ContentSkeleton';
import { EditScreen } from './EditScreen';
import { GenerateAnswersForm } from './GenerateAnswersForm';
import { formSchema, TFormData } from './types';

/** A debug data file id */
const debugDataId: TAIQuerDebugDataId = 'answers-query-data-01';

/** Show debug data to test answers editing */
const __debugGenerated = isDev && false;
const __demoQuestionId = 'x1';
const __debugGeneratedAnswers: TNewOrOldAnswer[] | undefined = __debugGenerated
  ? [
      {
        id: `${newItemIdPrefix}1`,
        isNew: true,
        questionId: __demoQuestionId,
        text: 'Answer _markdown_ text',
        explanation: 'Explanation markdown text...',
        isCorrect: false,
        isGenerated: true,
      },
      {
        id: `${newItemIdPrefix}2`,
        isNew: true,
        questionId: __demoQuestionId,
        text: '**Second answer** with much longer text for test purposes and visual issues detection',
        explanation: 'Explanation markdown text...',
        isCorrect: true,
        isGenerated: true,
      },
    ]
  : undefined;

interface GenerateAnswersPageWrapperProps {
  scope: TTopicsManageScopeId;
  topicId: string;
  questionId: string;
}

export function GenerateAnswersPageWrapper({
  scope,
  topicId,
  questionId,
}: GenerateAnswersPageWrapperProps) {
  const { user, loading: isSessionLoading } = useSessionData();
  const { isRouteChanging } = useRouteChanging();

  const isAdmin = user?.role === 'ADMIN';

  const [isStarted, setStarted] = React.useState<boolean>(false);
  const [isGenerated, setGenerated] = React.useState<boolean>(false);

  const [generatedAnswers, setGeneratedAnswers] = React.useState<TNewOrOldAnswer[] | undefined>(
    __debugGeneratedAnswers,
  );
  const [isSaved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  const [isLeaving, setLeaving] = React.useState(false);

  const __useDebugData = isDev || isAdmin;

  const defaultValues: TFormData = React.useMemo(
    () => ({
      debugData: __useDebugData,
      answersGenerationType: answersGenerationTypes[0],
      answersCountMin: isDev ? 1 : 2,
      answersCountMax: isDev ? 1 : 6,
      extraText: '',
      clientType: defaultAiClientType,
      temperature: defaultAIGenerationTemperature,
    }),
    [__useDebugData],
  );

  // @see https://react-hook-form.com/docs/useform
  const form = useForm<TFormData>({
    mode: 'onChange',
    criteriaMode: 'all',
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const abortControllerRef = React.useRef<AbortController | null>(null);

  const aiGenerationsStatusQuery = useAIGenerationsStatus({
    traceId: 'GenerateAnswersPageWrapper',
  });
  const { allowed: aiGenerationsAllowed, loading: aiGenerationsLoading } = aiGenerationsStatusQuery;

  const userAIRequest = useUserAIRequest();
  const t = useT();
  const queryClient = useQueryClient();

  // Calculate paths
  const topicsListRoutePath = `/topics/${scope}`;
  const topicRoutePath = `${topicsListRoutePath}/${topicId}`;
  const questionsListRoutePath = `${topicRoutePath}/questions`;
  const questionRoutePath = `${questionsListRoutePath}/${questionId}`;
  const answersListRoutePath = `${questionRoutePath}/answers`;
  const goBack = useGoBack(answersListRoutePath);

  const isPreparing = isSessionLoading || aiGenerationsLoading;

  const availableTopicQuery = useAvailableTopicById({
    id: topicId || '',
    includeQuestions: true,
    includeQuestionsCount: true,
  });
  const { topic, isFetched: isTopicFetched, isFetching: isTopicFetching } = availableTopicQuery;
  const isTopicPending = !isTopicFetched || isTopicFetching;

  const availableQuestionQuery = useAvailableQuestionById({
    id: questionId,
    traceId: 'GenerateAnswersPageWrapper',
  });
  const {
    question,
    isFetched: isQuestionFetched,
    isFetching: isQuestionFetching,
  } = availableQuestionQuery;
  const isQuestionPending = !isQuestionFetched || isQuestionFetching;

  const availableAnswersQuery = useAvailableAnswers({
    enabled: isStarted,
    questionId,
    itemsLimit: null,
    includeQuestion: true,
    traceId: 'GenerateAnswersPageWrapper',
  });
  const {
    refetch: refetchAnswers,
    allAnswers: answers,
    isFetched: isAnswersFetched,
    isFetching: isAnswersFetching,
    isRefetching: isAnswersRefetching,
  } = availableAnswersQuery;
  const isAnswersPending = isStarted && (!isAnswersFetched || isAnswersFetching);

  const questionsCount = topic?._count?.questions;
  const allowedTraining = !!questionsCount;

  const combinedAnswers = React.useMemo<TNewOrOldAnswer[]>(
    () => [...answers, ...(generatedAnswers || [])],
    [answers, generatedAnswers],
  );

  // Using different titles depending on the current status
  const title = isSaved
    ? t('GenerateAnswersModal.AnswersSaved')
    : isGenerated
      ? t('GenerateAnswersModal.AnswersGeneratedStatus')
      : t('GenerateAnswersModal.Title');
  useDocumentTitle(title);

  const generateAnswersMutation = useMutation({
    mutationFn: async (formData: TFormData) => {
      setError(undefined);

      // Cancel previous action before starting new
      abortControllerRef.current?.abort('Cleaned up');
      // Initialize abort controller
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const abortPromise = new Promise<never>((_, rej) => (controller.signal.onabort = rej));

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
        existedAnswers: answers?.map(({ isCorrect, explanation, text }: TAvailableAnswer) => ({
          isCorrect,
          explanation: explanation || null,
          text,
        })),
      };
      const { debugData } = formData;

      const messages = createGenerateQuestionAnswersMessages(params);

      const queryData: TAITextQueryData = await Promise.race([
        abortPromise,
        userAIRequest(messages, {
          topicId,
          debugData: debugData ? debugDataId : undefined,
        }),
      ]);

      return queryData;
    },
    onSettled: () => {
      abortControllerRef.current = null;
    },
  });

  // Save data function using updateAnswersDataViaParams
  const saveDataFn = React.useCallback(
    async (
      saveParams: TSaveDataParams<TNewOrOldAnswer>,
    ): Promise<TUpdateAnswersDataViaParamsResults> => {
      const { updatedItems, addedItems, deletedIds } = saveParams;
      try {
        const updateAnswersData = {
          updatedItems: updatedItems?.size ? [...updatedItems.values()] : undefined,
          addedItems: addedItems?.size ? [...addedItems.values()] : undefined,
          deletedIds: deletedIds?.size
            ? [...deletedIds.values()].filter((id) => !String(id).startsWith(newItemIdPrefix))
            : undefined,
        };
        const results = await updateAnswersDataViaParams(updateAnswersData);
        console.log('[GenerateAnswersPageWrapper:saveDataFn:done]', {
          results,
          updateAnswersData,
        });
        return results;
      } catch (error) {
        const details = getErrorText(error);
        const message = 'Cannot save answers';
        // eslint-disable-next-line no-console
        console.error('[GenerateAnswersPageWrapper:saveDataFn]', [message, details].join(': '), {
          error,
          saveParams,
        });
        debugger; // eslint-disable-line no-debugger
        throw error;
      }
    },
    [],
  );

  // Update React Query cache with saved data
  const updateAnswersQueryData = React.useCallback(
    (results: TUpdateAnswersDataViaParamsResults) => {
      const { added = [], autoAddedIds, updated = [], deletedIds } = results;
      const deletedIdsSet = new Set(deletedIds);
      const updatedItemsMap = new Map(updated?.map((it) => [it.id, it]));
      const addedItemsMap = new Map(added?.map((it) => [it.id, it]));
      const _addedIdsEntries = autoAddedIds && Object.entries(autoAddedIds);
      const autoAddedIdsMap = new Map(_addedIdsEntries?.map(([origId, id]) => [origId, id]));
      const remainedAddedItemsMap = new Map<TNewOrOldAnswer['id'], TNewOrOldAnswer>(
        [...added, ...updated].map((it) => [it.id, it]),
      );

      /** Collect all returned items */
      const allItems = new Map<TNewOrOldAnswer['id'], TNewOrOldAnswer>();

      queryClient.setQueryData<TGetResultsInfiniteQueryData<TNewOrOldAnswer>>(
        availableAnswersQuery.queryKey,
        (oldData) => {
          if (!oldData) return oldData;
          const lastPageIndex = oldData.pages.length - 1;
          let totalCount = 0;
          const pages = oldData.pages.map((page, index) => {
            const items: TNewOrOldAnswer[] = page.items
              .map((it) => {
                if (deletedIdsSet.has(it.id)) {
                  return undefined;
                }
                if (updatedItemsMap.has(it.id)) {
                  it = updatedItemsMap.get(it.id) ?? it;
                } else {
                  const newId = autoAddedIdsMap.has(it.id) ? autoAddedIdsMap.get(it.id) : it.id;
                  if (newId && addedItemsMap.has(newId)) {
                    const newItem = addedItemsMap.get(it.id);
                    if (newItem) {
                      it = newItem;
                    }
                  }
                }
                remainedAddedItemsMap.delete(it.id);
                allItems.set(it.id, it);
                return it;
              })
              .filter(Boolean) as TNewOrOldAnswer[];
            if (remainedAddedItemsMap.size && index === lastPageIndex) {
              items.push(...remainedAddedItemsMap.values());
            }
            totalCount += items.length;
            return { ...page, items, totalCount };
          });
          const updatedPages = pages.map((page) => ({ ...page, totalCount }));
          return { ...oldData, pages: updatedPages };
        },
      );

      const items = [...allItems.values(), ...remainedAddedItemsMap.values()];

      console.log('[GenerateAnswersPageWrapper:updateAnswersQueryData:done]', {
        items,
        allItems,
        remainedAddedItemsMap,
        autoAddedIdsMap,
        updatedItemsMap,
        addedItemsMap,
        results,
      });

      return items;
    },
    [queryClient, availableAnswersQuery.queryKey],
  );

  // Handle mutation results
  const updateSavedDataResults = React.useCallback(
    (_results: TUpdateAnswersDataViaParamsResults) => {
      const invalidatePrefixes = [
        ['available-answers-for-question', questionId],
        ['available-question', questionId],
        ['available-questions-for-topic', topicId],
        ['available-topics'],
      ].map(makeQueryKeyPrefix);
      invalidateKeysByPrefixes(queryClient, invalidatePrefixes, [availableAnswersQuery.queryKey]);
    },
    [queryClient, questionId, topicId, availableAnswersQuery.queryKey],
  );

  const saveDataMutation = useMutation({
    mutationFn: saveDataFn,
    onSuccess: updateSavedDataResults,
    onError: (error) => {
      const details = getErrorText(error);
      const message = 'Cannot save answers';
      const comboMsg = [message, details].join(': ');
      // eslint-disable-next-line no-console
      console.error('[GenerateAnswersPageWrapper:saveDataMutation:onError]', comboMsg, {
        error,
      });
      debugger; // eslint-disable-line no-debugger
      toast.error(message);
    },
  });

  // Wrapper function that matches the expected signature for AnswersEditorCore
  const saveData = React.useCallback(
    async (saveParams: TSaveDataParams<TNewOrOldAnswer>): Promise<TNewOrOldAnswer[]> => {
      const results = await saveDataMutation.mutateAsync(saveParams);
      // Return the updated items from the query data
      const items = updateAnswersQueryData(results);
      console.log('[GenerateAnswersPageWrapper:saveData:items]', {
        items,
        results,
        saveParams,
      });
      setSaved(true);
      setGeneratedAnswers(undefined);
      // setSavedAnswers(items as TAvailableAnswer[]);
      return items || [];
    },
    [saveDataMutation, updateAnswersQueryData],
  );

  const resetOperations = React.useCallback(() => {
    abortControllerRef.current?.abort();
    queryClient.cancelQueries({
      queryKey: [
        // All used query keys...
        availableTopicQuery.queryKey,
        availableAnswersQuery.queryKey,
        availableQuestionQuery.queryKey,
      ].filter(Boolean),
    });
    if (generateAnswersMutation.isPending) {
      generateAnswersMutation.reset();
    }
    if (saveDataMutation.isPending) {
      saveDataMutation.reset();
    }
  }, [
    queryClient,
    availableTopicQuery.queryKey,
    availableAnswersQuery.queryKey,
    availableQuestionQuery.queryKey,
    generateAnswersMutation,
    saveDataMutation,
  ]);

  const generateCallback = React.useCallback(
    async (formData: TFormData) => {
      setStarted(true);
      try {
        if (!questionId) {
          toast.error(t('GenerateAnswersModal.NoQuestionIdDefined'));
          return;
        }
        const queryPromise = generateAnswersMutation.mutateAsync(formData);
        toast.promise(queryPromise, {
          loading: t('GenerateAnswersModal.GeneratingAnswers'),
          // success: t('GenerateAnswersModal.AnswersGenerated'),
          cancel: {
            label: t('Cancel'),
            onClick: resetOperations,
          },
        });

        const queryData = await queryPromise;
        const parsedAnswers = parseGeneratedQuestionAnswers(queryData);

        if (!parsedAnswers?.length) {
          toast.warning(t('GenerateAnswersModal.NoAnswersGenerated'));
          return;
        }

        toast.success(
          t('GenerateAnswersModal.GeneratedAnswersCount', { count: parsedAnswers.length }),
        );

        setGenerated(true);
        setGeneratedAnswers((answers = []) => {
          const answersIds = new Set<TNewOrOldAnswer['id']>(answers.map(({ id }) => id));
          const newAnswers: TNewOrOldAnswer[] =
            parsedAnswers?.map((answer) => {
              const answerId = getUniqueIdForSet(answersIds, newItemIdPrefix);
              answersIds.add(answerId);
              return {
                ...answer,
                id: answerId,
                isNew: true,
                questionId,
                isGenerated: true,
              };
            }) || [];
          const __debugData = {
            newAnswers,
            queryData,
            topicId,
            questionId,
            formData,
          };
          const message = 'Parsed generated answers';
          const __idMsg = '[GenerateAnswersPageWrapper:generateCallback]';
          // eslint-disable-next-line no-console
          console.log(__idMsg, message, __debugData);
          logJsonData(__idMsg, { formData, topicId, questionId }, __debugData); // NOTE: Not awaiting and catching!
          return [...answers, ...newAnswers];
        });
      } catch (error) {
        const isAborted =
          (error instanceof Event && error.type === 'abort') ||
          (error as Error).name === 'AbortError';
        const message = isAborted
          ? t('GenerateAnswersModal.GenerationAborted')
          : t('GenerateAnswersModal.GenerationErrorOccured');
        const details = getErrorText(error);
        const comboMsg = [message, details].filter(Boolean).join(': ');
        generateAnswersMutation.reset();

        if (isAborted) {
          // eslint-disable-next-line no-console
          console.warn('[GenerateAnswersPageWrapper:generateCallback] Aborted:', comboMsg, {
            details,
            error,
          });
        } else {
          // eslint-disable-next-line no-console
          console.error('[GenerateAnswersPageWrapper:generateCallback] ❌', comboMsg, {
            details,
            error,
          });
          debugger; // eslint-disable-line no-debugger
          toast.error(comboMsg);
          setError(comboMsg);
        }
      }
    },
    [generateAnswersMutation, topicId, questionId, resetOperations, t],
  );

  /** Hide modal & cancel all pending operations */
  const cancelAndGoBack = React.useCallback(() => {
    setLeaving(true);
    resetOperations();
    goBack();
  }, [goBack, resetOperations]);

  const startOverCallback = React.useCallback(() => {
    resetOperations();
    setGenerated(false);
    // setGeneratedAnswers(undefined);
    setSaved(false);
    setStarted(false);
  }, [resetOperations]);

  const areMutationsPending = generateAnswersMutation.isPending || saveDataMutation.isPending;
  const isBusy =
    isPreparing || isTopicPending || isQuestionPending || isAnswersPending || areMutationsPending;

  const actions: TActionMenuItem[] = React.useMemo(
    () => [
      {
        id: 'Back',
        content: t('Back'),
        icon: Icons.ArrowLeft,
        visibleFor: 'xs',
        onClick: cancelAndGoBack,
      },
      {
        id: 'StartOver',
        content: t('GenerateAgain'),
        icon: Icons.Refresh,
        visibleFor: 'sm',
        onClick: startOverCallback,
        hidden: !isGenerated,
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
      allowedTraining,
      cancelAndGoBack,
      isGenerated,
      questionsListRoutePath,
      startOverCallback,
      t,
      topicId,
      topicRoutePath,
    ],
  );

  const breadcrumbs = useAnswersBreadcrumbsItems({
    scope,
    topic: topic || undefined,
    question: question || undefined,
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
          isDev && '__GenerateAnswersPageWrapper_DashboardHeader', // DEBUG
          'mx-6 transition',
          (isRouteChanging || isLeaving) && 'disabled',
        )}
        actions={actions}
        breadcrumbs={breadcrumbs}
        inactiveLastBreadcrumb
      />
      <ScrollArea
        className={cn(isDev && '__GenerateAnswersPageWrapper_Scroll')}
        viewportClassName={cn(
          isDev && '__GenerateAnswersPageWrapper_ScrollViewport', // DEBUG
          'flex flex-1 flex-col',
          '[&>div]:!flex [&>div]:gap-6 [&>div]:flex-col [&>div]:flex-1',
        )}
      >
        {isPreparing ? (
          <InnerContentSkeleton className="px-6" />
        ) : error ? (
          <PageError
            title={t('GenerateAnswersModal.ErrorOccured')}
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
            explanation={<AIGenerationsStatusInfo className="justify-center" />}
          />
        ) : isGenerated ? (
          <EditScreen
            className={cn(
              isDev && '__GenerateAnswersPageWrapper_EditScreen', // DEBUG
              'px-6',
              (isAnswersRefetching || saveDataMutation.isPending) && 'opacity-50',
            )}
            // startOverCallback={startOverCallback}
            topicId={topicId}
            questionId={questionId}
            isSaving={saveDataMutation.isPending}
            handleCancel={resetOperations}
            answers={combinedAnswers}
            saveData={saveData}
            reloadAnswers={() => refetchAnswers()}
          />
        ) : (
          <GenerateAnswersForm
            className={cn(
              isDev && '__GenerateAnswersPageWrapper_GenerateAnswersForm', // DEBUG
              'px-6',
            )}
            form={form}
            generateCallback={generateCallback}
            handleCancel={resetOperations}
            isGenerating={generateAnswersMutation.isPending}
            isPending={isBusy}
            topicId={topicId}
            questionId={questionId}
          />
        )}

        {/* Leaving splash */}
        <BusySplash
          className={cn(
            isDev && '__GenerateAnswersPageWrapper_BusySplash', // DEBUG
          )}
          isBusy={isRouteChanging || isLeaving}
        />
      </ScrollArea>
    </>
  );
}
