import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  getErrorText,
  getUnqueItemsList,
  invalidateKeysByPrefixes,
  makeQueryKeyPrefix,
} from '@/lib/helpers';
import { TGetResults, TGetResultsInfiniteQueryData } from '@/lib/types';
import { useAvailableQuestions } from '@/hooks/react-query/useAvailableQuestions';
import { newItemIdPrefix, THeadlessEditorState, TSaveDataParams } from '@/entities/HeadlessEditor';
import { TTopicId } from '@/features/topics/types';
import { useAvailableTopicById } from '@/hooks';

import {
  TUpdateQuestionsDataViaParamsResults,
  updateQuestionsDataViaParams,
} from '../../actions/updateQuestionsDataViaParams';
import { QuestionsEditorCore } from './QuestionsEditorCore';
import { T } from './types';

export interface TQuestionsEditorProps {
  topicId: TTopicId;
  availableQuestionsQuery: ReturnType<typeof useAvailableQuestions>;
  availableTopicQuery: ReturnType<typeof useAvailableTopicById>;
  /** When false, the headless editor stays in a non-interactive loading state. */
  isReady?: boolean;
  setHeadlessEditorState?: (state: THeadlessEditorState<T>) => void;
  saveData?: (saveParams: TSaveDataParams<T>) => Promise<T[]>;
}

interface TMemo {
  savePromise?: Promise<TUpdateQuestionsDataViaParamsResults>;
  setItemsData?: (items: T[]) => void;
}

export function QuestionsEditor(props: TQuestionsEditorProps) {
  const memo = React.useMemo<TMemo>(() => ({}), []);
  const {
    topicId,
    availableQuestionsQuery,
    availableTopicQuery,
    isReady: isReadyFromParent,
    setHeadlessEditorState,
    saveData: saveDataFromParent,
  } = props;

  const [savePromise, setSavePromise] = React.useState<
    Promise<TUpdateQuestionsDataViaParamsResults> | undefined
  >();
  const isSaving = !!savePromise;

  const queryClient = useQueryClient();

  const { topic } = availableTopicQuery;
  const { allQuestions, queryKey, refetch, isRefetching, isFetching, isFetched } =
    availableQuestionsQuery;
  const isQuestionsQueryReady = isFetched && !isFetching;
  const isExternalReady = isReadyFromParent ?? true;
  const isHeadlessReady = isExternalReady && isQuestionsQueryReady && !isSaving && !isRefetching;

  const saveDataFn = React.useCallback(
    async (saveParams: TSaveDataParams<T>): Promise<TUpdateQuestionsDataViaParamsResults> => {
      if (memo.savePromise) {
        return memo.savePromise;
      }
      const { updatedItems, addedItems, deletedIds } = saveParams;
      try {
        const updateQuestionsData = {
          updatedItems: updatedItems?.size ? [...updatedItems.values()] : undefined,
          addedItems: addedItems?.size ? [...addedItems.values()] : undefined,
          deletedIds: deletedIds?.size
            ? [...deletedIds.values()].filter((id) => !String(id).startsWith(newItemIdPrefix))
            : undefined,
        };
        const promise: Promise<TUpdateQuestionsDataViaParamsResults> =
          updateQuestionsDataViaParams(updateQuestionsData);
        setSavePromise(promise);
        const results = await promise;
        return results;
      } catch (error) {
        const details = getErrorText(error);
        const message = 'Cannot save questions';
        // eslint-disable-next-line no-console
        console.error('[QuestionsEditor:saveDataFn]', [message, details].join(': '), {
          error,
          saveParams,
        });
        debugger; // eslint-disable-line no-debugger
        throw error;
      } finally {
        setSavePromise(undefined);
        memo.savePromise = undefined;
      }
    },
    [memo],
  );

  const updateQuestionsQueryData = React.useCallback(
    (results: TUpdateQuestionsDataViaParamsResults) => {
      const { added = [], autoAddedIds, updated = [], deletedIds } = results;
      const deletedIdsSet = new Set(deletedIds);
      const updatedItemsMap = new Map(updated?.map((it) => [it.id, it]));
      const addedItemsMap = new Map(added?.map((it) => [it.id, it]));
      const _addedIdsEntries = autoAddedIds && Object.entries(autoAddedIds);
      const autoAddedIdsMap = new Map(_addedIdsEntries?.map(([origId, id]) => [origId, id]));
      const remainedAddedItemsMap = new Map<T['id'], T>(
        [...added, ...updated].map((it) => [it.id, it]),
      );
      const allItems = new Map<T['id'], T>();
      queryClient.setQueryData<TGetResultsInfiniteQueryData<T>>(queryKey, (oldData) => {
        if (!oldData) return oldData;
        const lastPageIndex = oldData.pages.length - 1;
        let totalCount = 0;
        const pages: TGetResults<T>[] = oldData.pages.map((page, index) => {
          const items: T[] = page.items
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
            .filter(Boolean) as T[];
          if (remainedAddedItemsMap.size && index === lastPageIndex) {
            items.push(...remainedAddedItemsMap.values());
          }
          totalCount += items.length;
          return { ...page, items, totalCount };
        });
        const updatedPages = pages.map((page) => ({ ...page, totalCount }));
        return { ...oldData, pages: updatedPages };
      });
      const items = [...allItems.values(), ...remainedAddedItemsMap.values()];
      return items;
    },
    [queryClient, queryKey],
  );

  const updateSavedDataResults = React.useCallback(
    (results: TUpdateQuestionsDataViaParamsResults) => {
      const invalidatePrefixes = [
        ['available-questions-for-topic', topicId],
        ['available-topic', topicId],
        ['available-topics'],
        ['available-answers-for-question'],
        ['available-question'],
      ].map(makeQueryKeyPrefix);
      invalidateKeysByPrefixes(queryClient, invalidatePrefixes, [queryKey]);
      const items = updateQuestionsQueryData(results);
      if (items && memo.setItemsData) {
        memo.setItemsData(items);
      }
    },
    [memo, updateQuestionsQueryData, queryClient, queryKey, topicId],
  );

  const saveDataMutation = useMutation({
    mutationFn: saveDataFn,
    onSuccess: updateSavedDataResults,
    onError: (error) => {
      const details = getErrorText(error);
      const message = 'Cannot save questions';
      const comboMsg = [message, details].join(': ');
      // eslint-disable-next-line no-console
      console.error('[QuestionsEditor:saveDataMutation:onError]', comboMsg, {
        error,
      });
      debugger; // eslint-disable-line no-debugger
      toast.error(message);
    },
  });

  const saveDataMutationHandler = React.useMemo(
    () => saveDataMutation.mutateAsync,
    [saveDataMutation],
  );

  const saveData = React.useCallback(
    async (saveParams: TSaveDataParams<T>): Promise<T[]> => {
      if (saveDataFromParent) {
        const items = await saveDataFromParent(saveParams);
        if (items && memo.setItemsData) {
          memo.setItemsData(items);
        }
        return items;
      }
      const results = await saveDataMutationHandler(saveParams);
      return updateQuestionsQueryData(results);
    },
    [memo, saveDataFromParent, saveDataMutationHandler, updateQuestionsQueryData],
  );

  const reloadData = React.useCallback(
    ({ setItemsData }: { setItemsData: (items: T[]) => void }) => {
      void refetch().then((res) => {
        const { data } = res;
        const items = getUnqueItemsList<T>(data?.pages);
        setItemsData(items);
      });
    },
    [refetch],
  );

  const onBindSetItemsData = React.useCallback(
    (setItemsData: (items: T[]) => void) => {
      memo.setItemsData = setItemsData;
    },
    [memo],
  );

  return (
    <QuestionsEditorCore
      topicId={topicId}
      langCode={topic?.langCode ?? undefined}
      questions={allQuestions}
      isReady={isHeadlessReady}
      saveData={saveData}
      reloadData={reloadData}
      onBindSetItemsData={onBindSetItemsData}
      setHeadlessEditorState={setHeadlessEditorState}
    />
  );
}
