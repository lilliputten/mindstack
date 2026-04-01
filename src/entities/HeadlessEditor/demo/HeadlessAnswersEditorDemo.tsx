import React from 'react';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/Select';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { AddAnswerModal } from '@/components/pages/ManageTopicQuestionAnswers';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';
import { TAnswerId, TNewOrOldAnswer } from '@/features/answers/types';

import { newItemIdPrefix } from '../constants';
import { getUniqueIdForSet, reorderByDate } from '../helpers';
import { TReorderModes, useHeadlessEditorState } from '../useHeadlessEditorState';
import { CmpAnswer } from './CmpAnswer';
import { demoAnswers, demoQuestionId, demoTopicId } from './demoAnswers';
import { T } from './typesAnswer';

interface TProps {
  className?: string;
  lang?: string;
  largeTexts?: boolean;
}

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
const reorderTitles: Record<TReorderKey, string> = {
  abc: 'By text',
  abcDesc: 'By text (descending)',
  date: 'By date',
  dateDesc: 'By date (descending)',
};

export function HeadlessAnswersEditorDemo(props: TProps) {
  const { className, lang = 'en', largeTexts = false } = props;

  const t = useT();

  const questionStub = React.useMemo(() => ({ id: demoQuestionId, topicId: demoTopicId }), []);

  const [defaultItems, setDefaultItems] = React.useState(() =>
    demoAnswers.map((a) => ({ ...a, question: questionStub })),
  );

  const [addAnswerModalVisible, setAddAnswerModalVisible] = React.useState(false);
  const [deleteSelectedConfirmVisible, setDeleteSelectedConfirmVisible] = React.useState(false);

  const [filterTargeted, setFilterTargeted] = React.useState(false);
  const [filterUpdated, setFilterUpdated] = React.useState(false);
  const [filterAdded, setFilterAdded] = React.useState(false);
  const [filterSelected, setFilterSelected] = React.useState(false);
  const [filterText, setFilterText] = React.useState<string | undefined>();
  const [filterTextSmart, setFilterTextSmart] = React.useState(false);

  const {
    items,
    compareTargetId,
    totalChangedCount,
    setItems,
    setCompareTargetId,
    setSelectedIds,
    setUpdatedIds,
    setDeletedIds,
    setAddedIds,
    setReorderedIds,
    addedIds,
    selectedIds,
    updatedIds,
    restoreDefaults,
    addNewItem,
    deleteSelected,
    reorderItems,
    RenderHeadlessEditor,
  } = useHeadlessEditorState({
    lang,
    largeTexts,
    reorderModes,
    filterText,
    filterTextSmart,
    filterTargeted,
    filterUpdated,
    filterAdded,
    filterSelected,
    defaultItems,
    getItemText,
    RenderItem: CmpAnswer,
  });

  const saveDefaults = React.useCallback(() => {
    const usedIds = new Set<TAnswerId>();
    const savedItems = items.map((it) => {
      const savedIt = { ...it, question: questionStub };
      if (savedIt.isNew) delete savedIt.isNew;
      let id = savedIt.id;
      if (!id || String(id).startsWith(newItemIdPrefix)) {
        id = getUniqueIdForSet(usedIds, '__saved');
        savedIt.id = id;
      }
      usedIds.add(id);
      return savedIt;
    });
    setDefaultItems(savedItems);
    setItems(savedItems);
    setUpdatedIds(undefined);
    setDeletedIds(undefined);
    setAddedIds(undefined);
    setReorderedIds(undefined);
  }, [items, questionStub, setUpdatedIds, setDeletedIds, setAddedIds, setReorderedIds, setItems]);

  const actions = React.useMemo(
    () => [
      <Button
        key="SaveDefaults"
        onClick={saveDefaults}
        className="content-truncate flex items-center gap-2"
        variant={totalChangedCount ? 'success' : 'ghost'}
        disabled={!totalChangedCount}
      >
        <Icons.Save className="size-4 shrink-0 opacity-50" />
        <span className="truncate">Save</span>
      </Button>,
      <Button
        key="UndoChanges"
        onClick={restoreDefaults}
        className="content-truncate flex items-center gap-2"
        variant={totalChangedCount ? 'theme' : 'ghost'}
        disabled={!totalChangedCount}
      >
        <Icons.Undo2 className="size-4 shrink-0 opacity-50" />
        <span className="truncate">
          Undo changes
          {!!totalChangedCount && (
            <span className="ml-1 font-thin opacity-50">({totalChangedCount})</span>
          )}
        </span>
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
      <div key="Filter" className="flex items-center text-sm font-bold opacity-50">
        <span>Filter:</span>
      </div>,
      <Label key="FilterTargeted" className="ml-1 flex select-none items-center gap-2">
        <Checkbox
          defaultChecked={filterTargeted}
          onCheckedChange={(checked) => setFilterTargeted(Boolean(checked))}
        />
        <span>Compared</span>
      </Label>,
      <Label key="FilterUpdated" className="ml-1 flex select-none items-center gap-2">
        <Checkbox
          defaultChecked={filterUpdated}
          onCheckedChange={(checked) => setFilterUpdated(Boolean(checked))}
        />
        <span>
          Updated
          <span className="ml-1 font-thin opacity-50">({updatedIds?.size || 0})</span>
        </span>
      </Label>,
      <Label key="FilterAdded" className="ml-1 flex select-none items-center gap-2">
        <Checkbox
          defaultChecked={filterAdded}
          onCheckedChange={(checked) => setFilterAdded(Boolean(checked))}
        />
        <span>
          Added
          <span className="ml-1 font-thin opacity-50">({addedIds?.size || 0})</span>
        </span>
      </Label>,
      <Label key="FilterSelected" className="ml-1 mr-2 flex select-none items-center gap-2">
        <Checkbox
          defaultChecked={filterSelected}
          onCheckedChange={(checked) => setFilterSelected(Boolean(checked))}
        />
        <span>
          Selected
          <span className="ml-1 font-thin opacity-50">({selectedIds?.size || 0})</span>
        </span>
      </Label>,
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
        key="AddNew"
        onClick={() => {
          addNewItem({
            questionId: demoQuestionId,
            text: 'New answer (quick add)',
            isCorrect: false,
          });
        }}
        className="content-truncate flex items-center gap-2"
        variant="success"
      >
        <Icons.Plus className="size-4 shrink-0 opacity-50" />
        <span className="truncate">Add new</span>
      </Button>,
      <Button
        key="AddViaModal"
        onClick={() => setAddAnswerModalVisible(true)}
        className="content-truncate flex items-center gap-2"
        variant="theme"
      >
        <Icons.Plus className="size-4 shrink-0 opacity-50" />
        <span className="truncate">Add via modal</span>
      </Button>,
      <Select key="Reorder" onValueChange={reorderItems}>
        <SelectTrigger
          className={cn(isDev && '__HeadlessAnswersEditorDemo__SelectReorder', 'flex-1')}
        >
          <span className="opacity-50">Reorder items</span>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(reorderTitles).map(([key, title]) => (
            <SelectItem key={key} value={key}>
              {title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>,
      <Button
        key="DeleteSelected"
        onClick={() => setDeleteSelectedConfirmVisible(true)}
        className="content-truncate flex items-center gap-2"
        variant={selectedIds?.size ? 'destructive' : 'ghost'}
        disabled={!selectedIds?.size}
      >
        <Icons.Trash className="size-4 shrink-0 opacity-50" />
        <span className="truncate">
          Delete selected
          {!!selectedIds?.size && (
            <span className="ml-1 font-thin opacity-50">({selectedIds.size})</span>
          )}
        </span>
      </Button>,
      <div className="relative flex gap-2" key="FilterByText">
        <Input
          name="FilterByText"
          className="inline pr-11"
          placeholder="Filter by text"
          value={filterText || ''}
          onChange={(ev) => {
            const { target } = ev;
            setFilterText(target.value);
          }}
        />
        {filterText && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setFilterText('')}
            className={cn(
              'absolute right-0 top-1/2 -translate-y-1/2',
              'rounded-sm',
              'opacity-30 transition hover:opacity-50',
            )}
            title={t('AvailableWorkoutsFilters.ClearText')}
          >
            <Icons.Close className="size-4" />
          </Button>
        )}
      </div>,
      <Label
        key="TextFilterSmart"
        className={cn('flex select-none items-center gap-2', !filterText && 'disabled')}
      >
        <Checkbox
          defaultChecked={filterTextSmart}
          onCheckedChange={(checked) => setFilterTextSmart(Boolean(checked))}
        />
        Smart text filter
      </Label>,
    ],
    [
      addNewItem,
      addedIds,
      compareTargetId,
      filterAdded,
      filterSelected,
      filterTargeted,
      filterText,
      filterTextSmart,
      filterUpdated,
      items,
      reorderItems,
      restoreDefaults,
      saveDefaults,
      selectedIds,
      setCompareTargetId,
      setSelectedIds,
      t,
      totalChangedCount,
      updatedIds,
    ],
  );

  return (
    <div className={cn(isDev && '__HeadlessAnswersEditorDemo', 'flex flex-col gap-6', className)}>
      <div
        className={cn(isDev && '__HeadlessAnswersEditorDemo_Actions', 'flex flex-wrap gap-2 px-6')}
      >
        {actions}
      </div>
      <ScrollArea
        className={cn(
          isDev && '__HeadlessAnswersEditorDemo_Scroll',
          'flex flex-1 flex-col overflow-hidden',
        )}
        viewportClassName={cn(
          isDev && '__HeadlessAnswersEditorDemo_ScrollViewport',
          '[&>div]:flex-col [&>div]:flex-1 [&>div]:justify-center [&>div]:items-center',
        )}
      >
        <RenderHeadlessEditor
          className={cn(isDev && '__HeadlessAnswersEditorDemo_HeadlessEditor', 'w-full px-6')}
        />
      </ScrollArea>
      {addAnswerModalVisible && (
        <AddAnswerModal
          variant="controlled"
          isVisible
          onClose={() => setAddAnswerModalVisible(false)}
          onDone={(formData) => {
            addNewItem({
              questionId: demoQuestionId,
              text: formData.text,
              isCorrect: formData.isCorrect,
            });
          }}
          topicId={demoTopicId}
          questionId={demoQuestionId}
          closeImmediatelly
        />
      )}
      <ConfirmModal
        dialogTitle={t('ConfirmDeleteAnswers')}
        confirmButtonVariant="destructive"
        confirmButtonText={t('Delete')}
        confirmButtonBusyText={t('ManageTopicQuestionAnswersListCard.Deleting')}
        cancelButtonText={t('Cancel')}
        handleClose={() => setDeleteSelectedConfirmVisible(false)}
        handleConfirm={() => {
          deleteSelected();
          setDeleteSelectedConfirmVisible(false);
        }}
        isVisible={deleteSelectedConfirmVisible}
      >
        {t('ConfirmDeleteAnswersMessage', {
          count: selectedIds?.size || 0,
        })}
      </ConfirmModal>
    </div>
  );
}
