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
import { useAvailableQuestions } from '@/hooks/react-query/useAvailableQuestions';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { AddQuestionModal } from '@/components/pages/ManageTopicQuestions';
import { isDev } from '@/constants';
import {
  newItemIdPrefix,
  reorderByDate,
  THeadlessEditorState,
  TReorderModes,
  TSaveDataParams,
  useHeadlessEditorState,
} from '@/entities/HeadlessEditor';
import { CmpQuestion } from '@/entities/HeadlessEditor/demo/CmpQuestion';
import { TTopicId } from '@/features/topics/types';
import { useAvailableTopicById } from '@/hooks';

import {
  TUpdateQuestionsDataViaParamsResults,
  updateQuestionsDataViaParams,
} from '../../actions/updateQuestionsDataViaParams';
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
} as const satisfies TReorderModes<T>;
type TReorderKey = keyof typeof reorderModes;

export interface TQuestionsEditorProps {
  topicId: TTopicId;
  availableQuestionsQuery: ReturnType<typeof useAvailableQuestions>;
  availableTopicQuery: ReturnType<typeof useAvailableTopicById>;
  setHeadlessEditorState?: (state: THeadlessEditorState<T>) => void;
  handleSaveData?: (saveParams: TSaveDataParams<T>) => Promise<T[]>;
}

interface TMemo {
  hasChanges?: boolean;
  savePromise?: Promise<TUpdateQuestionsDataViaParamsResults>;
  setItemsData?: (items: T[]) => void;
}

export function QuestionsEditor(props: TQuestionsEditorProps) {
  const memo = React.useMemo<TMemo>(() => ({}), []);
  const {
    topicId,
    availableQuestionsQuery,
    availableTopicQuery,
    setHeadlessEditorState,
    handleSaveData,
  } = props;

  // const [isSaving, startSaving] = React.useTransition();
  const [savePromise, setSavePromise] = React.useState<
    Promise<TUpdateQuestionsDataViaParamsResults> | undefined
  >();
  const isSaving = !!savePromise;

  const locale = useLocale() as TLocale;

  const queryClient = useQueryClient();
  const t = useT();

  /** Texts for the reorder items */
  const reorderTitles = React.useMemo<Record<TReorderKey, string>>(
    () => ({
      abc: t('ByText'),
      abcDesc: t('ByTextDescending'),
      date: t('ByDate'),
      dateDesc: t('ByDateDescending'),
    }),
    [t],
  );

  // const { manageScope } = useManageTopicsStore();
  // const topicsListRoutePath = `/topics/${manageScope}`;
  // const topicRoutePath = `${topicsListRoutePath}/${topicId}`;
  // const questionsListRoutePath = `${topicRoutePath}/questions`;
  // const questionRoutePath = `${questionsListRoutePath}/${questionId}`;
  // const answersListRoutePath = `${questionRoutePath}/answers`;
  // const answerRoutePath = `${answersListRoutePath}/${answerId}`;

  // const goBack = useGoBack(topicsListRoutePath);
  // const goToTheRoute = useGoToTheRoute();

  const { topic } = availableTopicQuery;
  const { allQuestions, queryKey, refetch, isRefetching, isFetching, isFetched } =
    availableQuestionsQuery;
  const isReady = isFetched && !isFetching;
  const isLoading = isSaving || isRefetching || !isReady;

  const questionsLocale = topic?.langCode || locale;
  // const questionsCount = topic?._count?.questions;
  // const allowedTraining = !!questionsCount;

  const [defaultItems, setDefaultItems] = React.useState<T[]>(allQuestions);

  // (Re-) Initialize default items...
  React.useEffect(() => {
    if (memo.setItemsData) {
      memo.setItemsData(allQuestions);
    }
  }, [memo, allQuestions]);

  const [addQuestionModalVisible, setAddQuestionModalVisible] = React.useState(false);
  const [deleteSelectedConfirmVisible, setDeleteSelectedConfirmVisible] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState<() => void | undefined>();
  // const [selectedQuestions, setSelectedQuestions] = React.useState<Set<TQuestionId>>(new Set());
  // const [showDeleteSelectedConfirm, setShowDeleteSelectedConfirm] = React.useState(false);

  const [showNormalized, setShowNormalized] = React.useState(false);

  const [filterTargeted, setFilterTargeted] = React.useState(false);
  const [filterUpdated, setFilterUpdated] = React.useState(false);
  const [filterAdded, setFilterAdded] = React.useState(false);
  const [filterSelected, setFilterSelected] = React.useState(false);
  const [filterText, setFilterText] = React.useState<string | undefined>();
  const [filterTextSmart, setFilterTextSmart] = React.useState(false);

  const saveDataFn = React.useCallback(
    async (saveParams: TSaveDataParams<T>): Promise<TUpdateQuestionsDataViaParamsResults> => {
      if (memo.savePromise) {
        return memo.savePromise;
      }
      const {
        // All items list...
        // items, // T[]
        // Items by update type...
        updatedItems, // Set<T>
        // deletedItems, // Set<T>
        addedItems, // Set<T>
        // Ids by update type...
        // affectedIds,
        // addedIds, // Set<T['id']>
        deletedIds, // Set<T['id']>
        // updatedIds, // Set<T['id']>
        // reorderedIds, // Set<T['id']>
        // selectedIds, // Set<T['id']>
      } = saveParams;
      try {
        const updateQuestionsData = {
          updatedItems: updatedItems?.size ? [...updatedItems.values()] : undefined,
          addedItems: addedItems?.size ? [...addedItems.values()] : undefined,
          deletedIds: deletedIds?.size
            ? [...deletedIds.values()].filter((id) => !String(id).startsWith(newItemIdPrefix))
            : undefined,
        };
        // Call the server action to update and invalidate the topic and all the questions
        // Call the server action to update questions...
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
      const {
        added = [], // TQuestion[], Newly added items
        autoAddedIds, // TQuestionId>, Hash for auto-renamed 'new ids'
        updated = [], // TQuestion[], Updated items
        deletedIds, // TQuestionId[], Deleted item ids
      } = results;
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
                // Delete the item
                return undefined;
              }
              if (updatedItemsMap.has(it.id)) {
                // Use the updated item
                it = updatedItemsMap.get(it.id) ?? it;
              } else {
                const newId = autoAddedIdsMap.has(it.id) ? autoAddedIdsMap.get(it.id) : it.id;
                if (newId && addedItemsMap.has(newId)) {
                  // Use the added item with
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
          // If added questions remained and it's the last page...
          if (remainedAddedItemsMap.size && index === lastPageIndex) {
            items.push(...remainedAddedItemsMap.values());
          }
          totalCount += items.length;
          return { ...page, items, totalCount };
        });
        // Update totalCount for all pages...
        const updatedPages = pages.map((page) => ({ ...page, totalCount }));
        // Return updated data...
        return { ...oldData, pages: updatedPages };
      });
      const items = [...allItems.values(), ...remainedAddedItemsMap.values()];
      return items;
    },
    [queryClient, queryKey],
  );

  const updateSavedDataResults = React.useCallback(
    (results: TUpdateQuestionsDataViaParamsResults) => {
      // Invalidate the topic and all the questions...
      const invalidatePrefixes = [
        ['available-questions-for-topic', topicId],
        ['available-topic', topicId],
        ['available-topics'],
        // TODO: It's possible to use `affectedIds` and generate keys only for them
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
      if (handleSaveData) {
        const items = await handleSaveData(saveParams);
        if (items && memo.setItemsData) {
          memo.setItemsData(items);
        }
        return items;
      }
      const results = await saveDataMutationHandler(saveParams);
      return updateQuestionsQueryData(results);
    },
    [memo, handleSaveData, saveDataMutationHandler, updateQuestionsQueryData],
  );

  // Create the state...
  const headlessEditorState = useHeadlessEditorState({
    isReady,
    /// Options...
    lang: questionsLocale,
    largeTexts,
    /// Reordering...
    reorderModes,
    /// Filters...
    filterText,
    filterTextSmart,
    filterTargeted,
    filterUpdated,
    filterAdded,
    filterSelected,
    // Items interface...
    defaultItems,
    saveData,
    getItemText,
    RenderItem: CmpQuestion,
    // Normalized...
    showNormalized,
    setShowNormalized,
  });
  // Expose the state for the parent component (optional)...
  React.useEffect(() => {
    if (setHeadlessEditorState) {
      setHeadlessEditorState(headlessEditorState);
    }
  }, [setHeadlessEditorState, headlessEditorState]);
  // Get the state data...
  const {
    /// Data...
    // items,
    /// State...
    // compareTargetId,
    totalChangedCount,
    /// Setters (AKA state controllers)...
    setItems,
    // setCompareTargetId,
    // setSelectedIds,
    setUpdatedIds,
    setDeletedIds,
    setAddedIds,
    setReorderedIds,
    /// Indices (TODO: To use on save)...
    // deletedIds,
    // reorderedIds,
    // addedIds,
    selectedIds,
    // updatedIds,
    /// Handlers...
    // restoreDefaults,
    addNewItem,
    deleteSelected,
    // reorderItems,
    /// Components...
    RenderHeadlessEditor,
    RenderHeadlessEditorControls,
  } = headlessEditorState;
  const hasChanges = !!totalChangedCount;
  memo.hasChanges = hasChanges;

  const confirmActionCallback = React.useCallback(
    (action: () => void) => {
      return () => {
        if (memo.hasChanges) {
          // Set the action for the dialog `handleConfirm` handler...
          setConfirmAction(() => action);
        } else {
          // ...or invoke it immediatelly...
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
      // Reset ids
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

  return (
    <>
      <RenderHeadlessEditorControls
        className={cn(
          isDev && '__QuestionsEditor_RenderHeadlessEditorControls', // DEBUG
          'transition',
          isLoading && 'opacity-50',
        )}
        // Reorder...
        reorderTitles={reorderTitles}
        // Actions...
        onAddAction={() => setAddQuestionModalVisible(true)}
        // onSaveData={onSaveData} // UNUSED: In favor of `saveData`
        onDeleteAction={() => setDeleteSelectedConfirmVisible(true)}
        onReload={confirmActionCallback(reloadData)}
        // Filter setters...
        setFilterTargeted={setFilterTargeted}
        setFilterUpdated={setFilterUpdated}
        setFilterAdded={setFilterAdded}
        setFilterSelected={setFilterSelected}
        setFilterText={setFilterText}
        setFilterTextSmart={setFilterTextSmart}
      />
      <ScrollArea
        saveScrollKey="QuestionsEditor"
        saveScrollHash={saveScrollHash}
        className={cn(
          isDev && '__QuestionsEditor_Scroll', // DEBUG
          'relative flex flex-1 flex-col overflow-hidden',
        )}
        viewportClassName={cn(
          isDev && '__QuestionsEditor_Scroll_Viewport', // DEBUG
        )}
      >
        <RenderHeadlessEditor
          className={cn(
            isDev && '__QuestionsEditor_RenderHeadlessEditor', // DEBUG
            'w-full',
            'transition',
            isLoading && 'opacity-50',
          )}
        />
      </ScrollArea>
      {addQuestionModalVisible && (
        <AddQuestionModal
          isVisible
          // isVisible={addQuestionModalVisible}
          onClose={() => setAddQuestionModalVisible(false)}
          onDone={(formData) => {
            const newItem = { topicId, ...formData };
            addNewItem(newItem);
          }}
          closeImmediatelly
        />
      )}
      {deleteSelectedConfirmVisible && (
        <ConfirmModal
          isVisible
          // isVisible={deleteSelectedConfirmVisible}
          dialogTitle={t('ConfirmDeleteQuestions')}
          confirmButtonVariant="destructive"
          confirmButtonText={t('Delete')}
          confirmButtonBusyText={t('QuestionsEditor.DeletingQuestions')}
          cancelButtonText={t('Cancel')}
          handleClose={() => setDeleteSelectedConfirmVisible(false)}
          handleConfirm={() => {
            deleteSelected();
            setDeleteSelectedConfirmVisible(false);
          }}
        >
          {t('ConfirmDeleteQuestionsMessage', {
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
