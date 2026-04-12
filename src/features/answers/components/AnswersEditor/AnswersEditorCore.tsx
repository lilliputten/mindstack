'use client';

import React from 'react';
import { useLocale } from 'next-intl';

import { getRandomHashString } from '@/lib/helpers/strings';
import { cn } from '@/lib/utils';
import { TLocale, useT } from '@/i18n';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { AddAnswerModal } from '@/components/pages/ManageTopicQuestionAnswers';
import { isDev } from '@/constants';
import {
  reorderByDate,
  THeadlessEditorState,
  TReorderModes,
  TSaveDataParams,
  useHeadlessEditorState,
} from '@/entities/HeadlessEditor';
import { CmpAnswer } from '@/entities/HeadlessEditor/demo/CmpAnswer';
import { TQuestionId } from '@/features/questions/types';
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

export interface TAnswersEditorCoreProps {
  topicId: TTopicId;
  questionId: TQuestionId;
  /** Answer rows (named `answers` per shared headless editor contract). */
  answers: T[];
  setHeadlessEditorState?: (state: THeadlessEditorState<T>) => void;
  /**
   * Lets a parent wrapper obtain `setItemsData` for cache-driven sync (e.g. React Query).
   * Not part of the public feature API; prefer keeping sync logic in the wrapper.
   */
  onBindSetItemsData?: (setItemsData: (items: T[]) => void) => void;
  saveData?: (saveParams: TSaveDataParams<T>) => Promise<T[]>;
  /** Upper-level readiness (e.g. all React Query requests settled). */
  isReady?: boolean;
  /**
   * When set, invoked on reload instead of resetting from the `answers` prop.
   * Use `setItemsData` to apply fetched rows (e.g. after a React Query refetch).
   */
  reloadData?: (ctx: { setItemsData: (items: T[]) => void }) => void | Promise<void>;
  /** Arbitrary extra data forwarded to every CmpAnswer call */
  extraParams?: unknown;
}

interface TMemo {
  hasChanges?: boolean;
  setItemsData?: (items: T[]) => void;
}

export function AnswersEditorCore(props: TAnswersEditorCoreProps) {
  const memo = React.useMemo<TMemo>(() => ({}), []);
  const {
    topicId,
    questionId,
    answers,
    setHeadlessEditorState,
    onBindSetItemsData,
    saveData: saveDataProp,
    isReady: isReadyProp,
    reloadData: reloadDataProp,
    extraParams,
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

  const answersLocale = locale;

  const [defaultItems, setDefaultItems] = React.useState<T[]>(answers);

  React.useEffect(() => {
    if (memo.setItemsData) {
      memo.setItemsData(answers);
    }
  }, [memo, answers]);

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

  const headlessEditorState = useHeadlessEditorState({
    isReady,
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
    saveData: saveDataProp,
    getItemText,
    RenderItem: CmpAnswer,
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
    setItemsData(answers);
  }, [answers, hasChanges, isReady, setItemsData]);

  return (
    <>
      <RenderHeadlessEditorControls
        className={cn(
          isDev && '__AnswersEditorCore_RenderHeadlessEditorControls',
          'transition',
          !isReady && 'opacity-50',
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
        saveScrollKey="AnswersEditorCore"
        saveScrollHash={saveScrollHash}
        className={cn(
          isDev && '__AnswersEditorCore_Scroll',
          'relative flex flex-1 flex-col overflow-hidden',
        )}
        viewportClassName={cn(isDev && '__AnswersEditorCore_Scroll_Viewport')}
      >
        <RenderHeadlessEditor
          className={cn(
            isDev && '__AnswersEditorCore_RenderHeadlessEditor',
            'w-full',
            'transition',
            !isReady && 'opacity-50',
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
