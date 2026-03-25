import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';

import { getRandomHashString } from '@/lib/helpers/strings';
import { cn } from '@/lib/utils';
import { TLocale, useT } from '@/i18n';
import { useAvailableQuestions } from '@/hooks/react-query/useAvailableQuestions';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { AddQuestionModal } from '@/components/pages/ManageTopicQuestions';
import { isDev } from '@/constants';
import {
  getUniqueIdForSet,
  newItemIdPrefix,
  reorderByDate,
  THeadlessEditorState,
  TReorderModes,
  TSaveDataParams,
  useHeadlessEditorState,
} from '@/entities/HeadlessEditor';
import { CmpQuestion } from '@/entities/HeadlessEditor/demo/CmpQuestion';
import { TNewOrOldQuestion } from '@/features/questions/types';
import { TTopicId } from '@/features/topics/types';
import { useAvailableTopicById } from '@/hooks';

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
} as const satisfies TReorderModes<TNewOrOldQuestion>;
type TReorderKey = keyof typeof reorderModes;

export interface TQuestionsEditorProps {
  topicId: TTopicId;
  availableQuestionsQuery: ReturnType<typeof useAvailableQuestions>;
  availableTopicQuery: ReturnType<typeof useAvailableTopicById>;
  setHeadlessEditorState?: (state: THeadlessEditorState<TNewOrOldQuestion>) => void;
}

interface TMemo {
  hasChanges?: boolean;
}

export function QuestionsEditor(props: TQuestionsEditorProps) {
  const memo = React.useMemo<TMemo>(() => ({}), []);
  const { topicId, availableQuestionsQuery, availableTopicQuery, setHeadlessEditorState } = props;

  const locale = useLocale() as TLocale;

  const queryClient = useQueryClient();
  const t = useT();

  /** Texts for the reorder items */
  const reorderTitles = React.useMemo<Record<TReorderKey, string>>(
    () => ({
      abc: t('By text'),
      abcDesc: t('By text (descending)'),
      date: t('By date'),
      dateDesc: t('By date (descending)'),
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
  const {
    allQuestions,
    // refetch,
    // isRefetching,
  } = availableQuestionsQuery;

  const questionsLocale = topic?.langCode || locale;
  const questionsCount = topic?._count?.questions;
  // const allowedTraining = !!questionsCount;

  const [defaultItems, setDefaultItems] = React.useState<T[]>(allQuestions);

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

  // const handleReload = React.useCallback(() => {
  //   refetch({ cancelRefetch: true });
  // }, [refetch]);

  const saveData = React.useCallback((saveParams: TSaveDataParams<T>) => {
    const {
      // All items list...
      items, // T[]
      // Items by update type...
      updatedItems, // Set<T>
      deletedItems, // Set<T>
      addedItems, // Set<T>
      // Ids by update type...
      addedIds, // Set<T['id']>
      deletedIds, // Set<T['id']>
      updatedIds, // Set<T['id']>
      reorderedIds, // Set<T['id']>
      selectedIds, // Set<T['id']>
    } = saveParams;
    const updateQuestionsData = {
      updatedItems: updatedItems ? [...updatedItems.values()] : undefined,
      addedItems: updatedItems && [...updatedItems.values()],
      deletedIds: deletedIds && [...deletedIds.values()],
    };
    // TODO: Call the proper server action. Update and invalidate the topic and all the questions
    const promise: Promise<unknown> = updateQuestionsDataViaParams(updateQuestionsData);
    console.log('[QuestionsEditor:saveData]', {
      saveParams,
    });
    debugger;
    return promise; // Promise.resolve(true);
  }, []);

  // Create the state...
  const headlessEditorState = useHeadlessEditorState({
    // isReady,
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
    items,
    /// State...
    compareTargetId,
    totalChangedCount,
    /// Setters (AKA state controllers)...
    // setItems,
    setCompareTargetId,
    setSelectedIds,
    // setUpdatedIds,
    // setDeletedIds,
    // setAddedIds,
    // setReorderedIds,
    /// Indices (TODO: To use on save)...
    deletedIds,
    reorderedIds,
    addedIds,
    selectedIds,
    updatedIds,
    /// Handlers...
    restoreDefaults,
    addNewItem,
    deleteSelected,
    reorderItems,
    /// Components...
    RenderHeadlessEditor,
    RenderHeadlessEditorControls,
  } = headlessEditorState;
  const hasChanges = !!totalChangedCount;
  memo.hasChanges = hasChanges;

  /* // UNUSED: Confirmation callback handlers
   * const { allowed: aiGenerationsAllowed, loading: aiGenerationsLoading } = useAIGenerationsStatus({
   *   traceId: 'QuestionsEditor:QuestionsEditor',
   * });
   * const confirmActionCallback = React.useCallback(
   *   (action: () => void) => {
   *     return () => {
   *       if (memo.hasChanges) {
   *         // Set the action for the dialog `handleConfirm` handler...
   *         setConfirmAction(() => action);
   *       } else {
   *         // ...or invoke it immediatelly...
   *         action();
   *       }
   *     };
   *   },
   *   [memo],
   * );
   * const confirmGoToTheRouteCallback = React.useCallback(
   *   (route: string) => {
   *     return confirmActionCallback(() => goToTheRoute(route as TRoutePath));
   *   },
   *   [confirmActionCallback, goToTheRoute],
   * );
   */

  const onSaveData = React.useCallback(() => {
    // Emulate data save procedure: remove any 'new item' features...
    const usedIds = new Set<T['id']>();
    const savedItems = items.map((it) => {
      const savedIt = { ...it };
      if (savedIt.isNew) delete savedIt.isNew;
      let id = savedIt.id;
      if (!id || id.startsWith(newItemIdPrefix)) {
        id = getUniqueIdForSet(usedIds, '__saved');
        savedIt.id = id;
      }
      usedIds.add(id);
      return savedIt;
    });
    console.log('[QuestionsEditor:onSaveData]', {
      // selectedIds,
      addedIds,
      deletedIds,
      items,
      memo,
      reorderedIds,
      updatedIds,
    });
    debugger;
    // Save new data...
    setDefaultItems(savedItems);
    // TODO: Update and invalidate the topic and all the questions
    // setItems(savedItems);
    // // Update all data-related indices...
    // setUpdatedIds(undefined);
    // setDeletedIds(undefined);
    // setAddedIds(undefined);
    // setReorderedIds(undefined);
  }, [
    // selectedIds,
    addedIds,
    deletedIds,
    items,
    memo,
    reorderedIds,
    updatedIds,
  ]);

  return (
    <>
      <RenderHeadlessEditorControls
        className={cn(
          isDev && '__QuestionsEditor_RenderHeadlessEditorControls', // DEBUG
          // 'mx-6',
        )}
        // Reorder...
        reorderTitles={reorderTitles}
        // Actions...
        onAddAction={() => setAddQuestionModalVisible(true)}
        onSaveData={onSaveData}
        onDeleteAction={() => setDeleteSelectedConfirmVisible(true)}
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
            // 'mx-6',
            'w-full',
          )}
        />
      </ScrollArea>
      {addQuestionModalVisible && (
        <AddQuestionModal
          isVisible
          // isVisible={addQuestionModalVisible}
          onClose={() => setAddQuestionModalVisible(false)}
          onDone={(formData) => {
            const newItem = {
              topicId,
              ...formData,
            };
            addNewItem(newItem);
          }}
          closeImmediatelly
        />
      )}
      {deleteSelectedConfirmVisible && (
        <ConfirmModal
          isVisible
          // isVisible={deleteSelectedConfirmVisible}
          dialogTitle={t('QuestionsEditor.ConfirmDeleteQuestions')}
          confirmButtonVariant="destructive"
          confirmButtonText={t('Delete')}
          confirmButtonBusyText={t('QuestionsEditor.Deleting')}
          cancelButtonText={t('Cancel')}
          handleClose={() => setDeleteSelectedConfirmVisible(false)}
          handleConfirm={() => {
            deleteSelected();
            setDeleteSelectedConfirmVisible(false);
          }}
        >
          {t('QuestionsEditor.ConfirmDeleteQuestionsMessage', {
            count: selectedIds?.size || 0,
          })}
        </ConfirmModal>
      )}
      {!!confirmAction && (
        <ConfirmModal
          isVisible // ={!!confirmAction}
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
          {t('Are you sure you want to lose all your modified data?')}
        </ConfirmModal>
      )}
    </>
  );
}
