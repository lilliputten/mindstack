import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';

import { getRandomHashString } from '@/lib/helpers/strings';
import { cn } from '@/lib/utils';
import { TLocale, useT } from '@/i18n';
import { useAvailableQuestions } from '@/hooks/react-query/useAvailableQuestions';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { TActionMenuItem } from '@/components/dashboard/DashboardActions';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { AddQuestionModal } from '@/components/pages/ManageTopicQuestions';
import { TGenericIcon } from '@/components/shared';
import * as Icons from '@/components/shared/Icons';
import { availableTopicsRoute, TRoutePath } from '@/config';
import { isDev } from '@/constants';
import { reorderByDate, TReorderModes, useHeadlessEditorState } from '@/entities/HeadlessEditor';
import { CmpQuestion } from '@/entities/HeadlessEditor/demo/CmpQuestion';
import { useAIGenerationsStatus } from '@/features/ai-generations/query-hooks';
import { useQuestionsBreadcrumbsItems } from '@/features/questions/components/QuestionsBreadcrumbs';
import { TNewOrOldQuestion } from '@/features/questions/types';
import { TTopicId } from '@/features/topics/types';
import { useAvailableTopicById, useGoBack, useGoToTheRoute } from '@/hooks';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

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
const reorderModeIds = Object.keys(reorderModes) as TReorderKey[];
const reorderIcons: Record<TReorderKey, TGenericIcon> = {
  abc: Icons.ArrowDownAZ,
  abcDesc: Icons.ArrowUpAZ,
  date: Icons.ArrowDown10,
  dateDesc: Icons.ArrowDown10,
};

export interface TQuestionsEditorProps {
  topicId: TTopicId;
  availableQuestionsQuery: ReturnType<typeof useAvailableQuestions>;
  availableTopicQuery: ReturnType<typeof useAvailableTopicById>;
}

interface TMemo {
  hasChanges?: boolean;
}

export function QuestionsEditor(props: TQuestionsEditorProps) {
  const memo = React.useMemo<TMemo>(() => ({}), []);
  const { topicId, availableQuestionsQuery, availableTopicQuery } = props;

  const locale = useLocale() as TLocale;

  const { manageScope } = useManageTopicsStore();
  const queryClient = useQueryClient();
  const t = useT();

  const reorderTitles = React.useMemo<Record<TReorderKey, string>>(
    () => ({
      abc: t('Reorder by text'),
      abcDesc: t('Reorder by text (descending)'),
      date: t('Reorder by date'),
      dateDesc: t('Reorder by date (descending)'),
    }),
    [t],
  );

  const topicsListRoutePath = `/topics/${manageScope}`;
  const topicRoutePath = `${topicsListRoutePath}/${topicId}`;
  const questionsListRoutePath = `${topicRoutePath}/questions`;
  // const questionRoutePath = `${questionsListRoutePath}/${questionId}`;
  // const answersListRoutePath = `${questionRoutePath}/answers`;
  // const answerRoutePath = `${answersListRoutePath}/${answerId}`;

  const goBack = useGoBack(topicsListRoutePath);
  const goToTheRoute = useGoToTheRoute();

  const { topic } = availableTopicQuery;
  const { allQuestions, refetch, isRefetching } = availableQuestionsQuery;

  const questionsLocale = topic?.langCode || locale;
  const questionsCount = topic?._count?.questions;
  const allowedTraining = !!questionsCount;

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

  const handleReload = React.useCallback(() => {
    refetch({ cancelRefetch: true });
  }, [refetch]);

  const {
    /// Data...
    items,
    /// State...
    compareTargetId,
    totalChangedCount,
    /// Setters (AKA state controllers)...
    setItems,
    setCompareTargetId,
    setSelectedIds,
    setUpdatedIds,
    setDeletedIds,
    setAddedIds,
    setReorderedIds,
    /// Indices (TODO: To use on save)...
    // deletedIds,
    // reorderedIds,
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
  } = useHeadlessEditorState({
    // isReady,
    /// Options...
    lang: questionsLocale,
    largeTexts,
    showNormalized,
    /// Reordering...
    // reorderModes,
    /// Filters...
    filterText,
    filterTextSmart,
    filterTargeted,
    filterUpdated,
    filterAdded,
    filterSelected,
    // Items interface...
    defaultItems,
    getItemText,
    RenderItem: CmpQuestion,
  });
  const hasChanges = !!totalChangedCount;
  memo.hasChanges = hasChanges;

  const { allowed: aiGenerationsAllowed, loading: aiGenerationsLoading } = useAIGenerationsStatus({
    traceId: 'QuestionsEditor:QuestionsEditor',
  });

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
  const confirmGoToTheRouteCallback = React.useCallback(
    (route: string) => {
      return confirmActionCallback(() => goToTheRoute(route as TRoutePath));
    },
    [confirmActionCallback, goToTheRoute],
  );
  const onSaveData = React.useCallback(() => {
    debugger;
  }, []);

  const actions: TActionMenuItem[] = React.useMemo(
    () => [
      {
        id: 'Back',
        content: t('Back'),
        icon: Icons.ArrowLeft,
        visibleFor: 'sm',
        onClick: confirmActionCallback(goBack),
      },
      {
        id: 'Save',
        content: t('Save'),
        icon: Icons.Save,
        visibleFor: 'sm',
        // pending: isSaving,
        hidden: !totalChangedCount,
        variant: 'success',
        onClick: onSaveData,
      },
      {
        id: 'UndoChanges',
        content: t('Undo Changes'),
        icon: Icons.Undo2,
        // visibleFor: 'sm',
        // pending: isSaving,
        hidden: !totalChangedCount,
        onClick: confirmActionCallback(restoreDefaults),
      },
      {
        id: 'ResetCompareTarget',
        content: t('Reset Comparison Target'),
        icon: Icons.CircleSlash2,
        // visibleFor: 'xl',
        hidden: !compareTargetId,
        onClick: () => setCompareTargetId(undefined),
      },
      {
        id: 'ShowNormalizedComparsions',
        content: showNormalized ? t('Show Real Comparsions') : t('Show Normalized Comparsions'),
        icon: Icons.Scale,
        // visibleFor: 'xl',
        // hidden: !compareTargetId,
        onClick: () => setShowNormalized((showNormalized) => !showNormalized),
      },
      {
        id: 'SelectAll',
        content: !selectedIds?.size ? t('Select All') : t('Deselect All'),
        icon: Icons.CheckCheck,
        // visibleFor: 'xl',
        hidden: !items.length,
        onClick: () =>
          setSelectedIds((selectedIds) => {
            return !selectedIds?.size ? new Set(items.map(({ id }) => id)) : undefined;
          }),
      },
      {
        id: 'AddNew',
        content: t('Add New Question'),
        icon: Icons.Plus,
        visibleFor: 'xl',
        onClick: () => setAddQuestionModalVisible(true),
      },
      {
        id: 'DeleteSelected',
        content: t('Delete selected'),
        icon: Icons.Plus,
        visibleFor: 'xl',
        variant: 'destructive',
        hidden: !selectedIds?.size,
        onClick: () => setDeleteSelectedConfirmVisible(true),
      },
      /*
      <Button
        key="DeleteSelected"
        onClick={() => setDeleteSelectedConfirmVisible(true)}
        className="content-truncate flex items-center gap-2"
        variant={selectedIds?.size ? 'destructive' : 'ghost'}
        disabled={!selectedIds?.size}
        // size="sm"
      >
        <Icons.Trash className="size-4 shrink-0 opacity-50" />
        <span className="truncate">
          Delete selected
          {!!selectedIds?.size && (
            <span className="ml-1 font-thin opacity-50">({selectedIds.size})</span>
          )}
        </span>
      </Button>,

      */
      // Separate reorder buttons...
      ...reorderModeIds.map((id) => ({
        id: `reorder-${id}`,
        content: reorderTitles[id],
        icon: reorderIcons[id],
        // visibleFor: 'sm',
        hidden: !items.length,
        onClick: () => reorderItems(id),
      })),
      /*
      <Button
        key="AddNew"
        // onClick={() => setAddQuestionModalVisible(true)}
        // XXX: Add an item without the dialog
        onClick={() => {
          const newItem = {
            topicId: demoTopicId,
            text: 'New item',
          };
          addNewItem(newItem);
        }}
        className="content-truncate flex items-center gap-2"
        variant="success"
        // size="sm"
      >
        <Icons.Plus className="size-4 shrink-0 opacity-50" />
        <span className="truncate">Add new</span>
      </Button>,

      <Button
        key="SelectAll"
        onClick={() =>
          setSelectedIds((selectedIds) => {
            return !selectedIds?.size ? new Set(items.map(({ id }) => id)) : undefined;
          })
        }
        className="content-truncate flex items-center gap-2"
        variant={items.length ? 'theme' : 'ghost'}
        disabled={!items.length}
      >
        {!selectedIds?.size ? (
          <Icons.SquareCheck className="size-4 shrink-0 opacity-50" />
        ) : (
          <Icons.Square className="size-4 shrink-0 opacity-50" />
        )}
        <span className="truncate">{!selectedIds?.size ? 'Select all' : 'Deselect all'}</span>
      </Button>,

      <Button
        key="ResetCompareTarget"
        onClick={() => setCompareTargetId(undefined)}
        className="content-truncate flex items-center gap-2"
        variant={compareTargetId ? 'theme' : 'ghost'}
        disabled={!compareTargetId}
      >
        <Icons.CircleSlash2 className="size-4 shrink-0 opacity-50" />
        <span className="truncate">Reset comparison target</span>
      </Button>,

      */
      {
        id: 'Reload',
        content: t('Reload'),
        icon: Icons.Refresh,
        visibleFor: 'xl',
        pending: isRefetching,
        onClick: confirmActionCallback(handleReload),
      },
      {
        id: 'GoToTheTopic',
        content: t('GoToTheTopic'),
        icon: Icons.ArrowRight,
        onClick: confirmGoToTheRouteCallback(topicRoutePath),
      },
      {
        id: 'ToTraining',
        content: t('ToTraining'),
        icon: Icons.Rocket,
        hidden: !allowedTraining,
        onClick: confirmGoToTheRouteCallback(`${availableTopicsRoute}/${topicId}/workout`),
      },
      {
        id: 'GenerateQuestions',
        content: t('GenerateQuestions'),
        icon: Icons.WandSparkles,
        disabled: !aiGenerationsAllowed || aiGenerationsLoading,
        onClick: confirmGoToTheRouteCallback(`${questionsListRoutePath}/generate`),
        variant: 'gr1',
      },
      /*
      {
        id: 'DeleteSelected',
        content: t('QuestionsEditor.DeleteSelected'),
        icon: Icons.Trash,
        hidden: !selectedQuestions.size,
        pending: deleteSelectedMutation.isPending,
        onClick: handleShowDeleteSelectedConfirm,
      },
      {
        id: 'AddNewQuestion',
        content: t('AddNewQuestion'),
        icon: Icons.Add,
        visibleFor: 'xl',
        onClick: confirmGoToTheRouteCallback(`${topicRoutePath}/questions/add`),
      },
      {
        id: 'AddNewTopic',
        content: t('AddNewTopic'),
        icon: Icons.Add,
        // visibleFor: 'xl',
        onClick: confirmGoToTheRouteCallback(`${topicsListRoutePath}/add`),
      },

      */
    ],
    [
      // deleteSelectedMutation.isPending,
      // handleShowDeleteSelectedConfirm,
      // selectedQuestions.size,
      // topicsListRoutePath,
      aiGenerationsAllowed,
      aiGenerationsLoading,
      onSaveData,
      allowedTraining,
      compareTargetId,
      confirmActionCallback,
      confirmGoToTheRouteCallback,
      goBack,
      handleReload,
      isRefetching,
      items,
      questionsListRoutePath,
      reorderItems,
      reorderTitles,
      restoreDefaults,
      selectedIds,
      setCompareTargetId,
      setSelectedIds,
      showNormalized,
      t,
      topicId,
      topicRoutePath,
      totalChangedCount,
    ],
  );

  const breadcrumbs = useQuestionsBreadcrumbsItems({
    scope: manageScope,
    topic: topic || undefined,
  });

  return (
    <>
      <DashboardHeader
        heading={t('QuestionsEditor.EditQuestions')}
        className={cn(
          isDev && '__QuestionsEditor_DashboardHeader', // DEBUG
          'mx-6',
        )}
        actions={actions}
        breadcrumbs={breadcrumbs}
        inactiveLastBreadcrumb
      />
      {/* TODO: Put expandable controls panel here? */}
      <RenderHeadlessEditorControls
        className={cn(
          isDev && '__QuestionsEditor_RenderHeadlessEditorControls', // DEBUG
          'mx-6',
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
            'mx-6 w-full',
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
          dialogTitle={t('You have unsaved changes')}
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
