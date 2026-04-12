'use client';

import React from 'react';
import { useLocale } from 'next-intl';

import { getRandomHashString } from '@/lib/helpers/strings';
import { cn } from '@/lib/utils';
import { TLocale, useT } from '@/i18n';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { AddQuestionModal } from '@/components/pages/ManageTopicQuestions';
import { isDev } from '@/constants';
import {
  reorderByDate,
  THeadlessEditorState,
  TReorderModes,
  TSaveDataParams,
  useHeadlessEditorState,
} from '@/entities/HeadlessEditor';
import { CmpQuestion } from '@/entities/HeadlessEditor/demo/CmpQuestion';
import { TTopicId } from '@/features/topics/types';

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

export interface TQuestionsEditorCoreProps {
  topicId: TTopicId;
  /** Used for comparator language; falls back to the active UI locale when omitted. */
  langCode?: string;
  questions: T[];
  setHeadlessEditorState?: (state: THeadlessEditorState<T>) => void;
  onBindSetItemsData?: (setItemsData: (items: T[]) => void) => void;
  saveData?: (saveParams: TSaveDataParams<T>) => Promise<T[]>;
  /** Upper-level readiness (e.g. all React Query requests settled). */
  isReady?: boolean;
  reloadData?: (ctx: { setItemsData: (items: T[]) => void }) => void | Promise<void>;
  /** Arbitrary extra data forwarded to every CmpQuestion call */
  extraParams?: unknown;
  /** When true, `hasChanges` is derived from `totalChangedCount` instead of tracked as independent state. */
  calculateChanges?: boolean;
}

interface TMemo {
  hasChanges?: boolean;
  setItemsData?: (items: T[]) => void;
}

export function QuestionsEditorCore(props: TQuestionsEditorCoreProps) {
  const memo = React.useMemo<TMemo>(() => ({}), []);
  const {
    topicId,
    langCode,
    questions,
    setHeadlessEditorState,
    onBindSetItemsData,
    saveData: saveDataProp,
    isReady: isReadyProp,
    reloadData: reloadDataProp,
    extraParams,
    calculateChanges,
  } = props;

  const isExternalReady = isReadyProp ?? true;
  const isReady = isExternalReady;

  const locale = useLocale() as TLocale;
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

  const questionsLocale = langCode || locale;

  const [defaultItems, setDefaultItems] = React.useState<T[]>(questions);

  React.useEffect(() => {
    if (memo.setItemsData) {
      memo.setItemsData(questions);
    }
  }, [memo, questions]);

  const [addQuestionModalVisible, setAddQuestionModalVisible] = React.useState(false);
  const [deleteSelectedConfirmVisible, setDeleteSelectedConfirmVisible] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState<() => void | undefined>();

  const [showNormalized, setShowNormalized] = React.useState(false);

  const [filterTargeted, setFilterTargeted] = React.useState(false);
  const [filterUpdated, setFilterUpdated] = React.useState(false);
  const [filterAdded, setFilterAdded] = React.useState(false);
  const [filterSelected, setFilterSelected] = React.useState(false);
  const [filterText, setFilterText] = React.useState<string | undefined>();
  const [filterTextSmart, setFilterTextSmart] = React.useState(false);

  const headlessEditorState = useHeadlessEditorState({
    isReady,
    lang: questionsLocale,
    largeTexts,
    reorderModes,
    filterText,
    filterTextSmart,
    filterTargeted,
    filterUpdated,
    filterAdded,
    filterSelected,
    defaultItems,
    saveData: saveDataProp,
    getItemText,
    RenderItem: CmpQuestion,
    calculateChanges,
    extraParams,
    showNormalized,
    setShowNormalized,
  });

  React.useEffect(() => {
    if (setHeadlessEditorState) {
      setHeadlessEditorState(headlessEditorState);
    }
  }, [setHeadlessEditorState, headlessEditorState]);

  const {
    // totalChangedCount,
    hasChanges,
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
  memo.hasChanges = hasChanges;

  const confirmActionCallback = React.useCallback(
    (action?: () => void) => {
      if (!action) return undefined;
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

  React.useLayoutEffect(() => {
    onBindSetItemsData?.(setItemsData);
  }, [onBindSetItemsData, setItemsData]);

  const reloadData = React.useMemo(() => {
    if (reloadDataProp) {
      return () => {
        void reloadDataProp({ setItemsData });
        return;
      };
    }
    return undefined;
  }, [reloadDataProp, setItemsData]);

  React.useEffect(() => {
    if (!isReady) {
      return;
    }
    if (hasChanges) {
      return;
    }
    setItemsData(questions);
  }, [questions, hasChanges, isReady, setItemsData]);

  return (
    <>
      <RenderHeadlessEditorControls
        className={cn(
          isDev && '__QuestionsEditorCore_RenderHeadlessEditorControls',
          'transition',
          !isReady && 'opacity-50',
        )}
        reorderTitles={reorderTitles}
        onAddAction={() => setAddQuestionModalVisible(true)}
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
        saveScrollKey="QuestionsEditorCore"
        saveScrollHash={saveScrollHash}
        className={cn(
          isDev && '__QuestionsEditorCore_Scroll',
          'relative flex flex-1 flex-col overflow-hidden',
        )}
        viewportClassName={cn(isDev && '__QuestionsEditorCore_Scroll_Viewport')}
      >
        <RenderHeadlessEditor
          className={cn(
            isDev && '__QuestionsEditorCore_RenderHeadlessEditor',
            'w-full',
            'transition',
            !isReady && 'opacity-50',
          )}
        />
      </ScrollArea>
      {addQuestionModalVisible && (
        <AddQuestionModal
          isVisible
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
