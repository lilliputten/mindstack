'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { defaultAiClientType } from '@/lib/ai/types';
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
import { TNewOrOldAnswer } from '@/features/answers/types';
import { logJsonData } from '@/features/logger/server-actions';
import {
  TUpdateQuestionsDataViaParamsResults,
  updateQuestionsDataViaParams,
} from '@/features/questions/actions/updateQuestionsDataViaParams';
import { useQuestionsBreadcrumbsItems } from '@/features/questions/components/QuestionsBreadcrumbs';
import { TNewOrOldQuestion } from '@/features/questions/types';
import { TTopicId } from '@/features/topics/types';
import {
  useAvailableQuestions,
  useAvailableTopicById,
  useDocumentTitle,
  useGoBack,
  useSessionData,
} from '@/hooks';

import { ContentSkeleton, InnerContentSkeleton } from './ContentSkeleton';
import { EditScreen } from './EditScreen';
import { GenerateQuestionsForm } from './GenerateQuestionsForm';
import { formSchema, TFormData } from './types';

/** A debug data file id */
const debugDataId: TAIQuerDebugDataId = 'questions-query-data-06';

/** Show debug data to test questions editing */
const __debugGenerated = isDev && false;
const __demoTopicId = 'cml3z7si00001nvdwunclr1gg';
const __debugGeneratedQuestions: TNewOrOldQuestion[] | undefined = __debugGenerated
  ? [
      {
        id: `${newItemIdPrefix}1`,
        isNew: true,
        topicId: __demoTopicId,
        text: 'Sample generated question',
        answers: [
          {
            text: 'Sample answer',
            explanation: 'Sample explanation',
            isCorrect: true,
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
  const { isRouteChanging } = useRouteChanging();

  const isAdmin = user?.role === 'ADMIN';

  const [isStarted, setStarted] = React.useState<boolean>(false);
  const [isGenerated, setGenerated] = React.useState<boolean>(false);

  const [generatedQuestions, setGeneratedQuestions] = React.useState<
    TNewOrOldQuestion[] | undefined
  >(__debugGeneratedQuestions);
  const [isSaved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  const [isLeaving, setLeaving] = React.useState(false);

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

  const aiGenerationsStatusQuery = useAIGenerationsStatus({
    traceId: 'GenerateQuestionsPageWrapper',
  });
  const { allowed: aiGenerationsAllowed, loading: aiGenerationsLoading } = aiGenerationsStatusQuery;

  const userAIRequest = useUserAIRequest();
  const t = useT();
  const queryClient = useQueryClient();

  const topicsListRoutePath = `/topics/${scope}`;
  const topicRoutePath = `${topicsListRoutePath}/${topicId}`;
  const questionsListRoutePath = `${topicRoutePath}/questions`;

  const goBack = useGoBack(topicsListRoutePath);

  const isPreparing = isSessionLoading || aiGenerationsLoading;

  const availableTopicQuery = useAvailableTopicById({
    id: topicId || '',
    includeQuestions: true,
    includeQuestionsCount: true,
  });
  const { topic, isFetched: isTopicFetched, isFetching: isTopicFetching } = availableTopicQuery;
  const isTopicPending = !isTopicFetched || isTopicFetching;

  const availableQuestionsQuery = useAvailableQuestions({
    enabled: isStarted,
    topicId,
    itemsLimit: null,
    includeTopic: true,
    includeAnswers: true,
    traceId: 'GenerateQuestionsPageWrapper',
  });
  const {
    refetch: refetchQuestions,
    allQuestions: questions,
    isFetched: isQuestionsFetched,
    isFetching: isQuestionsFetching,
    isRefetching: isQuestionsRefetching,
  } = availableQuestionsQuery;
  const isQuestionsPending = isStarted && (!isQuestionsFetched || isQuestionsFetching);

  const questionsCount = topic?._count?.questions;
  const allowedTraining = !!questionsCount;

  const combinedQuestions = React.useMemo<TNewOrOldQuestion[]>(
    () => [...questions, ...(generatedQuestions || [])],
    [questions, generatedQuestions],
  );

  // Using different titles depending on the current status
  const title = isSaved
    ? t('GenerateQuestionsModal.QuestionsSaved')
    : isGenerated
      ? t('GenerateQuestionsModal.QuestionsGeneratedStatus')
      : t('GenerateQuestionsModal.DialogTitle');
  useDocumentTitle(title);

  const generateQuestionsMutation = useMutation({
    mutationFn: async (formData: TFormData) => {
      setError(undefined);

      abortControllerRef.current?.abort('Cleaned up');
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

  // Save data function using updateQuestionsDataViaParams
  const saveDataFn = React.useCallback(
    async (
      saveParams: TSaveDataParams<TNewOrOldQuestion>,
    ): Promise<TUpdateQuestionsDataViaParamsResults> => {
      const { updatedItems, addedItems, deletedIds } = saveParams;
      try {
        const updateQuestionsData = {
          updatedItems: updatedItems?.size ? [...updatedItems.values()] : undefined,
          addedItems: addedItems?.size ? [...addedItems.values()] : undefined,
          deletedIds: deletedIds?.size
            ? [...deletedIds.values()].filter((id) => !String(id).startsWith(newItemIdPrefix))
            : undefined,
        };
        const results = await updateQuestionsDataViaParams(updateQuestionsData);
        console.log('[GenerateQuestionsPageWrapper:saveDataFn:done]', {
          results,
          updateQuestionsData,
        });
        return results;
      } catch (error) {
        const details = getErrorText(error);
        const message = 'Cannot save questions';
        // eslint-disable-next-line no-console
        console.error('[GenerateQuestionsPageWrapper:saveDataFn]', [message, details].join(': '), {
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
  const updateQuestionsQueryData = React.useCallback(
    (results: TUpdateQuestionsDataViaParamsResults) => {
      const { added = [], autoAddedIds, updated = [], deletedIds } = results;
      const deletedIdsSet = new Set(deletedIds);
      const updatedItemsMap = new Map(updated?.map((it) => [it.id, it]));
      const addedItemsMap = new Map(added?.map((it) => [it.id, it]));
      const _addedIdsEntries = autoAddedIds && Object.entries(autoAddedIds);
      const autoAddedIdsMap = new Map(_addedIdsEntries?.map(([origId, id]) => [origId, id]));
      const remainedAddedItemsMap = new Map<TNewOrOldQuestion['id'], TNewOrOldQuestion>(
        [...added, ...updated].map((it) => [it.id, it]),
      );

      const allItems = new Map<TNewOrOldQuestion['id'], TNewOrOldQuestion>();

      queryClient.setQueryData<TGetResultsInfiniteQueryData<TNewOrOldQuestion>>(
        availableQuestionsQuery.queryKey,
        (oldData) => {
          if (!oldData) return oldData;
          const lastPageIndex = oldData.pages.length - 1;
          let totalCount = 0;
          const pages = oldData.pages.map((page, index) => {
            const items: TNewOrOldQuestion[] = page.items
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
              .filter(Boolean) as TNewOrOldQuestion[];
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

      console.log('[GenerateQuestionsPageWrapper:updateQuestionsQueryData:done]', {
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
    [queryClient, availableQuestionsQuery.queryKey],
  );

  // Handle mutation results
  const updateSavedDataResults = React.useCallback(
    (_results: TUpdateQuestionsDataViaParamsResults) => {
      const invalidatePrefixes = [
        ['available-questions-for-topic', topicId],
        ['available-topics'],
      ].map(makeQueryKeyPrefix);
      invalidateKeysByPrefixes(queryClient, invalidatePrefixes, [availableQuestionsQuery.queryKey]);
    },
    [queryClient, topicId, availableQuestionsQuery.queryKey],
  );

  const saveDataMutation = useMutation({
    mutationFn: saveDataFn,
    onSuccess: updateSavedDataResults,
    onError: (error) => {
      const details = getErrorText(error);
      const message = 'Cannot save questions';
      const comboMsg = [message, details].join(': ');
      // eslint-disable-next-line no-console
      console.error('[GenerateQuestionsPageWrapper:saveDataMutation:onError]', comboMsg, {
        error,
      });
      debugger; // eslint-disable-line no-debugger
      toast.error(message);
    },
  });

  // Wrapper function that matches the expected signature for QuestionsEditorCore
  const saveData = React.useCallback(
    async (saveParams: TSaveDataParams<TNewOrOldQuestion>): Promise<TNewOrOldQuestion[]> => {
      const results = await saveDataMutation.mutateAsync(saveParams);
      const items = updateQuestionsQueryData(results);
      console.log('[GenerateQuestionsPageWrapper:saveData:items]', {
        items,
        results,
        saveParams,
      });
      setSaved(true);
      setGeneratedQuestions(undefined);
      return items || [];
    },
    [saveDataMutation, updateQuestionsQueryData],
  );

  const resetOperations = React.useCallback(() => {
    abortControllerRef.current?.abort();
    queryClient.cancelQueries({
      queryKey: [availableTopicQuery.queryKey, availableQuestionsQuery.queryKey].filter(Boolean),
    });
    if (generateQuestionsMutation.isPending) {
      generateQuestionsMutation.reset();
    }
    if (saveDataMutation.isPending) {
      saveDataMutation.reset();
    }
  }, [
    queryClient,
    availableTopicQuery.queryKey,
    availableQuestionsQuery.queryKey,
    generateQuestionsMutation,
    saveDataMutation,
  ]);

  const generateCallback = React.useCallback(
    async (formData: TFormData) => {
      setStarted(true);
      try {
        if (!topicId) {
          toast.error(t('GenerateQuestionsModal.NoTopicIdDefined'));
          return;
        }
        const queryPromise = generateQuestionsMutation.mutateAsync(formData);
        toast.promise(queryPromise, {
          loading: t('GenerateQuestionsModal.ReceivingGeneratedData'),
          cancel: {
            label: t('Cancel'),
            onClick: resetOperations,
          },
        });

        const queryData = await queryPromise;
        const parsedQuestions = parseGeneratedTopicQuestions(queryData);

        if (!parsedQuestions?.length) {
          toast.warning(t('GenerateQuestionsModal.NoQuestionsGenerated'));
          return;
        }

        toast.success(
          t('GenerateQuestionsModal.GeneratedQuestionsCount', { count: parsedQuestions.length }),
        );

        setGenerated(true);
        setGeneratedQuestions((existing = []) => {
          const questionIds = new Set<TNewOrOldQuestion['id']>(existing.map(({ id }) => id));
          const newQuestions: TNewOrOldQuestion[] =
            parsedQuestions?.map((q) => {
              const questionId = getUniqueIdForSet(questionIds, newItemIdPrefix);
              questionIds.add(questionId);
              const answersIds = new Set<TNewOrOldAnswer['id']>();
              const answers: TNewOrOldAnswer[] =
                q.answers?.map((answer) => {
                  const answerId = getUniqueIdForSet(answersIds, newItemIdPrefix);
                  answersIds.add(answerId);
                  return {
                    ...answer,
                    id: answerId,
                    isNew: true,
                    questionId: questionId,
                    isGenerated: true,
                  };
                }) || [];

              return {
                ...q,
                id: questionId,
                isNew: true,
                topicId,
                isGenerated: true,
                answers,
              };
            }) || [];
          const __debugData = { newQuestions, queryData, topicId, formData };
          const message = 'Parsed generated questions';
          const __idMsg = '[GenerateQuestionsPageWrapper:generateCallback]';
          // eslint-disable-next-line no-console
          console.log(__idMsg, message, __debugData);
          logJsonData(__idMsg, { formData, topicId }, __debugData); // NOTE: Not awaiting and catching!
          return [...existing, ...newQuestions];
        });
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
          console.warn('[GenerateQuestionsPageWrapper:generateCallback] Aborted:', comboMsg, {
            details,
            error,
          });
        } else {
          // eslint-disable-next-line no-console
          console.error('[GenerateQuestionsPageWrapper:generateCallback] ❌', comboMsg, {
            details,
            error,
          });
          debugger; // eslint-disable-line no-debugger
          toast.error(comboMsg);
          setError(comboMsg);
        }
      }
    },
    [generateQuestionsMutation, topicId, resetOperations, t],
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
    setSaved(false);
    setStarted(false);
  }, [resetOperations]);

  const areMutationsPending = generateQuestionsMutation.isPending || saveDataMutation.isPending;
  const isBusy = isPreparing || isTopicPending || isQuestionsPending || areMutationsPending;

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
        ) : isGenerated ? (
          <EditScreen
            className={cn(
              isDev && '__GenerateQuestionsPageWrapper_EditScreen', // DEBUG
              'px-6',
              (isQuestionsRefetching || saveDataMutation.isPending) && 'opacity-50',
            )}
            topicId={topicId}
            isSaving={saveDataMutation.isPending}
            handleCancel={resetOperations}
            questions={combinedQuestions}
            saveData={saveData}
            reloadQuestions={() => refetchQuestions()}
          />
        ) : (
          <GenerateQuestionsForm
            className={cn(
              isDev && '__GenerateQuestionsPageWrapper_GenerateQuestionsForm', // DEBUG
              'px-6',
            )}
            form={form}
            generateCallback={generateCallback}
            handleCancel={resetOperations}
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
