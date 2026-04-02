'use client';

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';

import {
  getErrorText,
  getUnqueItemsList,
  invalidateKeysByPrefixes,
  makeQueryKeyPrefix,
} from '@/lib/helpers';
import { getRandomHashString } from '@/lib/helpers/strings';
import { TGetResults, TGetResultsInfiniteQueryData } from '@/lib/types';
import { cn } from '@/lib/utils';
import { TLocale, useT } from '@/i18n';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { AddAnswerModal } from '@/components/pages/ManageTopicQuestionAnswers';
import { isDev } from '@/constants';
import {
  newItemIdPrefix,
  reorderByDate,
  THeadlessEditorState,
  TReorderModes,
  TSaveDataParams,
  useHeadlessEditorState,
} from '@/entities/HeadlessEditor';
import { CmpAnswer } from '@/entities/HeadlessEditor/demo/CmpAnswer';
import { TNewOrOldAnswer } from '@/features/answers/types';
import { TQuestionId } from '@/features/questions/types';
import { TTopicId } from '@/features/topics/types';
import { useAvailableAnswers } from '@/hooks';

import {
  TUpdateAnswersDataViaParamsResults,
  updateAnswersDataViaParams,
} from '../../actions/updateAnswersDataViaParams';
import { T } from './types';

const saveScrollHash = getRandomHashString();

const largeTexts = false;

function getItemText(item: T) {
  return item.text;
}

const reorderModes = {
  abc: {},
  abcDesc: { desc: true },
  date: { func: reorderByDate },
  dateDesc: { func: reorderByDate, desc: true },
} as const satisfies TReorderModes<TNewOrOldAnswer>;
type TReorderKey = keyof typeof reorderModes;

export interface TAnswersEditorProps {
  topicId: TTopicId;
  questionId: TQuestionId;
  availableAnswersQuery: ReturnType<typeof useAvailableAnswers>;
  setHeadlessEditorState?: (state: THeadlessEditorState<TNewOrOldAnswer>) => void;
}

interface TMemo {
  hasChanges?: boolean;
  savePromise?: Promise<TUpdateAnswersDataViaParamsResults>;
  setItemsData?: (items: T[]) => void;
}

export function AnswersEditor(props: TAnswersEditorProps) {
  const memo = React.useMemo<TMemo>(() => ({}), []);
  const { topicId, questionId, availableAnswersQuery, setHeadlessEditorState } = props;

  const [savePromise, setSavePromise] = React.useState<
    Promise<TUpdateAnswersDataViaParamsResults> | undefined
  >();
  const isSaving = !!savePromise;

  const locale = useLocale() as TLocale;
  const queryClient = useQueryClient();
  const t = useT();

  const reorderTitles = React.useMemo<Record<TReorderKey, string>>(
    () => ({
      abc: t('ByText'),
      abcDesc: t('ByTextDescending'),
      date: t('ByDate'),
      dateDesc: t('ByDateDescending'),
    }),
    [t],
  );

  const { allAnswers, queryKey, refetch, isRefetching, isFetching, isFetched } =
    availableAnswersQuery;
  const isLoading = isSaving || isRefetching || isFetching;

  const answersLocale = locale;

  const [defaultItems, setDefaultItems] = React.useState<T[]>(allAnswers);

  const [addAnswerModalVisible, setAddAnswerModalVisible] = React.useState(false);
  const [deleteSelectedConfirmVisible, setDeleteSelectedConfirmVisible] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState<() => void | undefined>();

  const [showNormalized, setShowNormalized] = React.useState(false);

  const [filterTargeted, setFilterTargeted] = React.useState(false);
  const [filterUpdated, setFilterUpdated] = React.useState(false);
  const [filterAdded, setFilterAdded] = React.useState(false);
  const [filterSelected, setFilterSelected] = React.useState(false);
  const [filterText, setFilterText] = React.useState<string | undefined>();
  const [filterTextSmart, setFilterTextSmart] = React.useState(false);

  const saveDataFn = React.useCallback(
    async (saveParams: TSaveDataParams<T>): Promise<TUpdateAnswersDataViaParamsResults> => {
      if (memo.savePromise) {
        return memo.savePromise;
      }
      const { updatedItems, addedItems, deletedIds } = saveParams;
      try {
        const updateAnswersData = {
          updatedItems: updatedItems?.size ? [...updatedItems.values()] : undefined,
          addedItems: addedItems?.size ? [...addedItems.values()] : undefined,
          deletedIds: deletedIds?.size
            ? [...deletedIds.values()].filter((id) => !String(id).startsWith(newItemIdPrefix))
            : undefined,
        };
        const promise: Promise<TUpdateAnswersDataViaParamsResults> =
          updateAnswersDataViaParams(updateAnswersData);
        setSavePromise(promise);
        const results = await promise;
        return results;
      } catch (error) {
        const details = getErrorText(error);
        const message = 'Cannot save answers';
        // eslint-disable-next-line no-console
        console.error('[AnswersEditor:saveDataFn]', [message, details].join(': '), {
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

  const updateAnswersQueryData = React.useCallback(
    (results: TUpdateAnswersDataViaParamsResults) => {
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
    (results: TUpdateAnswersDataViaParamsResults) => {
      const invalidatePrefixes = [
        ['available-answers-for-question', questionId],
        ['available-question', questionId],
        ['available-questions-for-topic', topicId],
        ['available-topics'],
      ].map(makeQueryKeyPrefix);
      invalidateKeysByPrefixes(queryClient, invalidatePrefixes, [queryKey]);
      const items = updateAnswersQueryData(results);
      if (items && memo.setItemsData) {
        memo.setItemsData(items);
      }
    },
    [memo, updateAnswersQueryData, queryClient, queryKey, questionId, topicId],
  );

  const saveDataMutation = useMutation({
    mutationFn: saveDataFn,
    onSuccess: updateSavedDataResults,
    onError: (error) => {
      const details = getErrorText(error);
      const message = 'Cannot save answers';
      const comboMsg = [message, details].join(': ');
      // eslint-disable-next-line no-console
      console.error('[AnswersEditor:saveDataMutation:onError]', comboMsg, {
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

  const headlessEditorState = useHeadlessEditorState({
    lang: answersLocale,
    largeTexts,
    reorderModes,
    filterText,
    filterTextSmart,
    filterTargeted,
    filterUpdated,
    filterAdded,
    filterSelected,
    defaultItems,
    saveData: saveDataMutationHandler,
    getItemText,
    RenderItem: CmpAnswer,
    showNormalized,
    setShowNormalized,
  });

  React.useEffect(() => {
    if (setHeadlessEditorState) {
      setHeadlessEditorState(headlessEditorState);
    }
  }, [setHeadlessEditorState, headlessEditorState]);

  const {
    totalChangedCount,
    setItems,
    setUpdatedIds,
    setDeletedIds,
    setAddedIds,
    setReorderedIds,
    selectedIds,
    addNewItem,
    deleteSelected,
    RenderHeadlessEditor,
    RenderHeadlessEditorControls,
  } = headlessEditorState;
  const hasChanges = !!totalChangedCount;
  memo.hasChanges = hasChanges;

  const confirmActionCallback = React.useCallback(
    (action: () => void) => {
      return () => {
        if (memo.hasChanges) {
          setConfirmAction(() => action);
        } else {
          action();
        }
      };
    },
    [memo],
  );

  const setItemsData = React.useCallback(
    (items: T[]) => {
      setDefaultItems(items);
      setItems(items);
      setUpdatedIds(undefined);
      setDeletedIds(undefined);
      setAddedIds(undefined);
      setReorderedIds(undefined);
    },
    [setAddedIds, setDeletedIds, setItems, setReorderedIds, setUpdatedIds],
  );
  memo.setItemsData = setItemsData;

  const reloadData = React.useCallback(() => {
    refetch().then((res) => {
      const { data } = res;
      const items = getUnqueItemsList<T>(data?.pages);
      setItemsData(items);
    });
  }, [refetch, setItemsData]);

  React.useEffect(() => {
    if (!isFetched) {
      return;
    }
    if (hasChanges) {
      return;
    }
    setItemsData(allAnswers);
  }, [allAnswers, hasChanges, isFetched, setItemsData]);

  return (
    <>
      <RenderHeadlessEditorControls
        className={cn(
          isDev && '__AnswersEditor_RenderHeadlessEditorControls',
          'transition',
          isLoading && 'opacity-50',
        )}
        reorderTitles={reorderTitles}
        onAddAction={() => setAddAnswerModalVisible(true)}
        onDeleteAction={() => setDeleteSelectedConfirmVisible(true)}
        onReload={confirmActionCallback(reloadData)}
        setFilterTargeted={setFilterTargeted}
        setFilterUpdated={setFilterUpdated}
        setFilterAdded={setFilterAdded}
        setFilterSelected={setFilterSelected}
        setFilterText={setFilterText}
        setFilterTextSmart={setFilterTextSmart}
      />
      <ScrollArea
        saveScrollKey="AnswersEditor"
        saveScrollHash={saveScrollHash}
        className={cn(
          isDev && '__AnswersEditor_Scroll',
          'relative flex flex-1 flex-col overflow-hidden',
        )}
        viewportClassName={cn(isDev && '__AnswersEditor_Scroll_Viewport')}
      >
        <RenderHeadlessEditor
          className={cn(
            isDev && '__AnswersEditor_RenderHeadlessEditor',
            'w-full',
            'transition',
            isLoading && 'opacity-50',
          )}
        />
      </ScrollArea>
      {addAnswerModalVisible && (
        <AddAnswerModal
          variant="controlled"
          isVisible
          onClose={() => setAddAnswerModalVisible(false)}
          onDone={(formData) => {
            addNewItem({ questionId, text: formData.text, isCorrect: formData.isCorrect });
          }}
          topicId={topicId}
          questionId={questionId}
          closeImmediatelly
        />
      )}
      {deleteSelectedConfirmVisible && (
        <ConfirmModal
          isVisible
          dialogTitle={t('ConfirmDeleteAnswers')}
          confirmButtonVariant="destructive"
          confirmButtonText={t('Delete')}
          confirmButtonBusyText={t('AnswersEditor.DeletingAnswers')}
          cancelButtonText={t('Cancel')}
          handleClose={() => setDeleteSelectedConfirmVisible(false)}
          handleConfirm={() => {
            deleteSelected();
            setDeleteSelectedConfirmVisible(false);
          }}
        >
          {t('ConfirmDeleteAnswersMessage', {
            count: selectedIds?.size || 0,
          })}
        </ConfirmModal>
      )}
      {!!confirmAction && (
        <ConfirmModal
          isVisible
          dialogTitle={t('YouHaveUnsavedChanges')}
          confirmButtonVariant="destructive"
          confirmButtonText={t('Yes')}
          cancelButtonText={t('No')}
          handleClose={() => setConfirmAction(undefined)}
          handleConfirm={() => {
            confirmAction?.();
            setConfirmAction(undefined);
          }}
        >
          {t('AreYouSureYouWantToLoseData')}
        </ConfirmModal>
      )}
    </>
  );
}
