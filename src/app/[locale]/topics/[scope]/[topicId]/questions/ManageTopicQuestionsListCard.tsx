import React from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { APIError } from '@/lib/types/api';
import { truncateMarkdown } from '@/lib/helpers/markdown';
import { invalidateKeysByPrefixes, makeQueryKeyPrefix } from '@/lib/helpers/react-query';
import { getRandomHashString } from '@/lib/helpers/strings';
import { cn } from '@/lib/utils';
import { useAvailableQuestions } from '@/hooks/react-query/useAvailableQuestions';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { ScrollAreaInfinite } from '@/components/ui/ScrollAreaInfinite';
import { Skeleton } from '@/components/ui/Skeleton';
import { Switch } from '@/components/ui/Switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { TActionMenuItem } from '@/components/dashboard/DashboardActions';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { PageEmpty } from '@/components/pages/shared';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { useAIGenerationsStatus } from '@/features/ai-generations/query-hooks';
import { deleteQuestions, updateQuestion } from '@/features/questions/actions';
import { useQuestionsBreadcrumbsItems } from '@/features/questions/components/QuestionsBreadcrumbs';
import { TQuestion, TQuestionData, TQuestionId } from '@/features/questions/types';
import { TTopicId } from '@/features/topics/types';
import { useAvailableTopicById, useGoBack, useGoToTheRoute, useSessionUser } from '@/hooks';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

const saveScrollHash = getRandomHashString();

export interface TManageTopicQuestionsListCardProps {
  topicId: TTopicId;
  // questions: TQuestion[];
  handleDeleteQuestion: (questionId: TQuestionId) => void;
  handleEditQuestion: (questionId: TQuestionId) => void;
  handleAddQuestion: () => void;
  handleEditAnswers: (questionId: TQuestionId) => void;
  availableQuestionsQuery: ReturnType<typeof useAvailableQuestions>;
  availableTopicQuery: ReturnType<typeof useAvailableTopicById>;
}

function QuestionTableHeader({
  // isAdminMode,
  selectedQuestions,
  allQuestions,
  toggleAll,
}: {
  isAdminMode: boolean;
  selectedQuestions: Set<TQuestionId>;
  allQuestions: TQuestion[];
  toggleAll: () => void;
}) {
  const hasSelected = !!selectedQuestions.size;
  const isAllSelected = allQuestions.length > 0 && selectedQuestions.size === allQuestions.length;
  const isIndeterminate = hasSelected && !isAllSelected;

  return (
    <TableHeader>
      <TableRow>
        <TableHead
          id="select"
          className={cn(
            'w-[3em] cursor-pointer text-center transition',
            'hover:[&>button]:ring-2 hover:[&>button]:ring-theme-500/50',
          )}
          onClick={toggleAll}
          title="Select/deselect all"
        >
          <Checkbox
            checked={hasSelected}
            aria-label="Select/deselect all"
            className={cn('block', isIndeterminate && 'opacity-50')}
            icon={isIndeterminate ? Icons.Dot : Icons.Check}
          />
        </TableHead>
        <TableHead id="no" className="truncate text-right max-sm:hidden">
          No
        </TableHead>
        {isDev && (
          <TableHead id="questionId" className="truncate max-sm:hidden">
            ID
          </TableHead>
        )}
        <TableHead id="text" className="truncate">
          Question Text
        </TableHead>
        <TableHead id="answers" className="truncate">
          Answers
        </TableHead>
        <TableHead id="isGenerated" className="truncate max-lg:hidden">
          Generated
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}

interface TQuestionTableRowProps {
  question: TQuestion;
  idx: number;
  questionsListRoutePath: string;
  handleDeleteQuestion: TManageTopicQuestionsListCardProps['handleDeleteQuestion'];
  handleEditQuestion: TManageTopicQuestionsListCardProps['handleEditQuestion'];
  handleEditAnswers: TManageTopicQuestionsListCardProps['handleEditAnswers'];
  isAdminMode: boolean;
  isSelected: boolean;
  toggleSelected: (questionId: TQuestionId) => void;
  availableQuestionsQuery: ReturnType<typeof useAvailableQuestions>;
}

function QuestionTableRow(props: TQuestionTableRowProps) {
  const {
    question,
    questionsListRoutePath,
    handleDeleteQuestion,
    handleEditQuestion,
    handleEditAnswers,
    // isAdminMode,
    idx,
    isSelected,
    toggleSelected,
    availableQuestionsQuery,
  } = props;
  const { id, text, _count, isGenerated } = question;
  const questionRoutePath = `${questionsListRoutePath}/${id}`;
  const answersCount = _count?.answers;

  const [isPending, startTransition] = React.useTransition();
  const queryClient = useQueryClient();

  const updateAndInvalidateQuestion = React.useCallback(
    async (updatedQuestion: TQuestion) => {
      // Update via server function
      await updateQuestion(updatedQuestion as TQuestionData);
      // Update the item to the cached react-query data
      availableQuestionsQuery.updateQuestion(updatedQuestion);
      // Invalidate all other keys...
      availableQuestionsQuery.invalidateAllKeysExcept([availableQuestionsQuery.queryKey]);
      // Invalidate all other possible related cached data
      const invalidatePrefixes = [['available-question', question.id]].map(makeQueryKeyPrefix);
      invalidateKeysByPrefixes(queryClient, invalidatePrefixes, [availableQuestionsQuery.queryKey]);
    },
    [question.id, availableQuestionsQuery, queryClient],
  );

  const handleToggleGenerated = React.useCallback(
    (checked: boolean) => {
      startTransition(async () => {
        const updatedQuestion = { ...question, isGenerated: checked };
        try {
          // Update via server function
          await updateAndInvalidateQuestion(updatedQuestion);
        } catch (error) {
          const details = error instanceof APIError ? error.details : null;
          const message = 'Cannot update question generated status';
          // eslint-disable-next-line no-console
          console.error('[QuestionTableRow:handleToggleGenerated]', message, {
            details,
            error,
            questionId: question.id,
          });
          debugger; // eslint-disable-line no-debugger
          toast.error(message);
        }
      });
    },
    [question, updateAndInvalidateQuestion],
  );
  return (
    <TableRow className="truncate" data-question-id={id}>
      <TableCell
        id="select"
        className={cn(
          'w-[3em] cursor-pointer text-center transition',
          'hover:[&>button]:ring-2 hover:[&>button]:ring-theme-500/50',
        )}
        onClick={() => toggleSelected(id)}
        title="Select question"
      >
        <Checkbox checked={isSelected} className="block" aria-label="Select question" />
      </TableCell>
      <TableCell id="no" className="max-w-4 truncate text-right opacity-50 max-sm:hidden">
        <div className="truncate">{idx + 1}</div>
      </TableCell>
      {isDev && (
        <TableCell id="questionId" className="max-w-8 truncate max-sm:hidden" title={id}>
          <div className="truncate opacity-50">
            <span className="mr-1 opacity-30">#</span>
            {id}
          </div>
        </TableCell>
      )}
      <TableCell id="text" className="max-w-24 truncate" title={truncateMarkdown(text, 120)}>
        <Link className="text-ellipsis whitespace-normal hover:underline" href={questionRoutePath}>
          {truncateMarkdown(text, 80)}
        </Link>
      </TableCell>
      <TableCell id="answers" className="max-w-[8em] truncate">
        <div className="truncate">
          {answersCount ? (
            <span className="font-bold">{answersCount}</span>
          ) : (
            <span className="opacity-30">—</span>
          )}
        </div>
      </TableCell>
      <TableCell id="isGenerated" className="w-[8em] max-lg:hidden">
        <Switch
          checked={isGenerated}
          onCheckedChange={handleToggleGenerated}
          disabled={isPending}
        />
      </TableCell>
      <TableCell id="actions" className="w-[2em] text-right">
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-9 shrink-0"
            onClick={() => handleEditAnswers(question.id)}
            aria-label="Edit Answers"
            title="Edit Answers"
          >
            <Icons.Answers className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-9 shrink-0"
            onClick={() => handleEditQuestion(question.id)}
            aria-label="Edit"
            title="Edit"
          >
            <Icons.Edit className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-9 shrink-0 text-destructive"
            onClick={() => handleDeleteQuestion(question.id)}
            aria-label="Delete"
            title="Delete"
          >
            <Icons.Trash className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

type TMemo = { allQuestions: TQuestion[] };

export function ManageTopicQuestionsListCardContent(
  props: TManageTopicQuestionsListCardProps & {
    questionsListRoutePath: string;
    availableQuestionsQuery: ReturnType<typeof useAvailableQuestions>;
    selectedQuestions: Set<TQuestionId>;
    setSelectedQuestions: React.Dispatch<React.SetStateAction<Set<TQuestionId>>>;
    goToTheRoute: ReturnType<typeof useGoToTheRoute>;
  },
) {
  const {
    availableQuestionsQuery,
    questionsListRoutePath,
    handleDeleteQuestion,
    handleAddQuestion,
    handleEditQuestion,
    handleEditAnswers,
    selectedQuestions,
    setSelectedQuestions,
    goToTheRoute,
  } = props;

  const user = useSessionUser();
  const isAdmin = user?.role === 'ADMIN';

  const {
    allQuestions,
    hasQuestions,
    isFetched: isQuestionsFetched,
    isLoading: isQuestionsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = availableQuestionsQuery;

  const memo = React.useMemo<TMemo>(() => ({ allQuestions: [] }), []);
  memo.allQuestions = allQuestions;

  const toggleSelected = React.useCallback(
    (questionId: TQuestionId) => {
      setSelectedQuestions((set) => {
        const newSet = new Set(set);
        if (set.has(questionId)) {
          newSet.delete(questionId);
        } else {
          newSet.add(questionId);
        }
        return newSet;
      });
    },
    [setSelectedQuestions],
  );

  const toggleAll = React.useCallback(() => {
    setSelectedQuestions((set) => {
      if (set.size) {
        return new Set();
      } else {
        return new Set(memo.allQuestions.map((question) => question.id));
      }
    });
  }, [memo, setSelectedQuestions]);

  const { allowed: aiGenerationsAllowed, loading: aiGenerationsLoading } = useAIGenerationsStatus();

  if (!isQuestionsFetched) {
    return (
      <div
        className={cn(
          isDev && '__ManageTopicQuestionsListCard_Skeleton', // DEBUG
          'flex size-full flex-1 flex-col gap-4 px-6',
        )}
      >
        <Skeleton className="h-8 w-full rounded-lg" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  } else if (!hasQuestions) {
    return (
      <PageEmpty
        className="size-full flex-1"
        icon={Icons.Questions}
        title="No questions have been created yet"
        description="You dont have any questions yet. Add any question to your profile."
        framed={false}
        showAIInfo
        buttons={
          <>
            <Button onClick={handleAddQuestion} className="flex gap-2">
              <Icons.Add className="hidden size-4 opacity-50 sm:flex" />
              Add New Question
            </Button>
            <Button
              variant="secondary"
              onClick={() => goToTheRoute(`${questionsListRoutePath}/generate`)}
              className="flex gap-2"
              disabled={!aiGenerationsAllowed || aiGenerationsLoading}
            >
              <Icons.WandSparkles className="hidden size-4 opacity-50 sm:flex" />
              Generate Questions
            </Button>
          </>
        }
      />
    );
  }

  return (
    <ScrollAreaInfinite
      effectorData={allQuestions}
      fetchNextPage={fetchNextPage}
      isLoading={isQuestionsLoading}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      saveScrollKey="ManageTopicQuestionsListCardContent"
      saveScrollHash={saveScrollHash}
      className={cn(
        isDev && '__ManageTopicQuestionsListCardContent_Scroll', // DEBUG
        'relative flex flex-1 flex-col overflow-hidden',
      )}
      viewportClassName={cn(
        isDev && '__ManageTopicQuestionsListCardContent_Scroll_Viewport', // DEBUG
        'px-6',
      )}
      containerClassName={cn(
        isDev && '__ManageTopicQuestionsListCardContent_Scroll_Container', // DEBUG
        'relative w-full flex flex-col gap-4',
      )}
    >
      <Table>
        <QuestionTableHeader
          isAdminMode={isAdmin}
          selectedQuestions={selectedQuestions}
          allQuestions={allQuestions}
          toggleAll={toggleAll}
        />
        <TableBody>
          {allQuestions.map((question, idx) => (
            <QuestionTableRow
              key={question.id}
              idx={idx}
              question={question}
              questionsListRoutePath={questionsListRoutePath}
              handleDeleteQuestion={handleDeleteQuestion}
              handleEditQuestion={handleEditQuestion}
              handleEditAnswers={handleEditAnswers}
              isAdminMode={isAdmin}
              isSelected={selectedQuestions.has(question.id)}
              toggleSelected={toggleSelected}
              availableQuestionsQuery={availableQuestionsQuery}
            />
          ))}
        </TableBody>
      </Table>
    </ScrollAreaInfinite>
  );
}

export function ManageTopicQuestionsListCard(props: TManageTopicQuestionsListCardProps) {
  const { topicId, handleAddQuestion, availableQuestionsQuery, availableTopicQuery } = props;
  const { manageScope } = useManageTopicsStore();
  const [selectedQuestions, setSelectedQuestions] = React.useState<Set<TQuestionId>>(new Set());
  const [showDeleteSelectedConfirm, setShowDeleteSelectedConfirm] = React.useState(false);
  const queryClient = useQueryClient();

  const topicsListRoutePath = `/topics/${manageScope}`;
  const topicRoutePath = `${topicsListRoutePath}/${topicId}`;
  const questionsListRoutePath = `${topicRoutePath}/questions`;

  const { topic } = availableTopicQuery;
  const { refetch, isRefetching } = availableQuestionsQuery;

  const goBack = useGoBack(topicsListRoutePath);
  const goToTheRoute = useGoToTheRoute();

  const handleReload = React.useCallback(() => {
    refetch({ cancelRefetch: true });
  }, [refetch]);

  const deleteSelectedMutation = useMutation({
    mutationFn: deleteQuestions,
    onSuccess: () => {
      const selectedIds = Array.from(selectedQuestions);
      selectedIds.forEach((questionId) => {
        availableQuestionsQuery.deleteQuestion(questionId);
      });
      const invalidatePrefixes = [
        '["available-question',
        ['available-topic', topicId],
        ['available-topics'],
      ].map(makeQueryKeyPrefix);
      invalidateKeysByPrefixes(queryClient, invalidatePrefixes, [availableQuestionsQuery.queryKey]);
      setSelectedQuestions(new Set());
    },
    onError: (error) => {
      const details = error instanceof APIError ? error.details : null;
      const message = 'Cannot delete selected questions';
      // eslint-disable-next-line no-console
      console.error('[ManageTopicQuestionsListCard:deleteSelectedMutation]', message, {
        details,
        error,
        selectedQuestions: Array.from(selectedQuestions),
      });
      toast.error(message);
    },
  });

  const handleDeleteSelected = React.useCallback(() => {
    const selectedIds = Array.from(selectedQuestions);
    if (selectedIds.length === 0) return;

    const promise = deleteSelectedMutation.mutateAsync(selectedIds);
    toast.promise(promise, {
      loading: 'Deleting selected questions...',
      success: 'Successfully deleted selected questions',
      error: 'Cannot delete selected questions',
    });
    setShowDeleteSelectedConfirm(false);
  }, [selectedQuestions, deleteSelectedMutation]);

  const handleShowDeleteSelectedConfirm = React.useCallback(() => {
    setShowDeleteSelectedConfirm(true);
  }, []);

  const handleHideDeleteSelectedConfirm = React.useCallback(() => {
    setShowDeleteSelectedConfirm(false);
  }, []);

  const { allowed: aiGenerationsAllowed, loading: aiGenerationsLoading } = useAIGenerationsStatus();

  const actions: TActionMenuItem[] = React.useMemo(
    () => [
      {
        id: 'Back',
        content: 'Back',
        variant: 'ghost',
        icon: Icons.ArrowLeft,
        visibleFor: 'sm',
        onClick: goBack,
      },
      {
        id: 'Reload',
        content: 'Reload',
        variant: 'ghost',
        icon: Icons.Refresh,
        visibleFor: 'lg',
        pending: isRefetching,
        onClick: handleReload,
      },
      {
        id: 'Delete Selected',
        content: 'Delete Selected',
        variant: 'destructive',
        icon: Icons.Trash,
        visibleFor: 'lg',
        hidden: !selectedQuestions.size,
        pending: deleteSelectedMutation.isPending,
        onClick: handleShowDeleteSelectedConfirm,
      },
      {
        id: 'Add New Question',
        content: 'Add New Question',
        variant: 'success',
        icon: Icons.Add,
        visibleFor: 'lg',
        onClick: handleAddQuestion,
      },
      {
        id: 'Generate Questions',
        content: 'Generate Questions',
        variant: 'secondary',
        icon: Icons.WandSparkles,
        visibleFor: 'lg',
        disabled: !aiGenerationsAllowed || aiGenerationsLoading,
        onClick: () => goToTheRoute(`${questionsListRoutePath}/generate`),
      },
    ],
    [
      goBack,
      isRefetching,
      handleReload,
      selectedQuestions.size,
      deleteSelectedMutation.isPending,
      handleShowDeleteSelectedConfirm,
      handleAddQuestion,
      aiGenerationsAllowed,
      aiGenerationsLoading,
      goToTheRoute,
      questionsListRoutePath,
    ],
  );

  const breadcrumbs = useQuestionsBreadcrumbsItems({
    scope: manageScope,
    topic,
  });

  return (
    <>
      <DashboardHeader
        heading="Manage Questions"
        className={cn(
          isDev && '__ManageTopicQuestionsListCard_DashboardHeader', // DEBUG
          'mx-6',
        )}
        actions={actions}
        breadcrumbs={breadcrumbs}
        inactiveLastBreadcrumb
      />
      <Card
        className={cn(
          isDev && '__ManageTopicQuestionsListCard_Card', // DEBUG
          'relative mx-6 flex flex-1 flex-col overflow-hidden py-6 xl:col-span-2',
        )}
      >
        <ManageTopicQuestionsListCardContent
          {...props}
          questionsListRoutePath={questionsListRoutePath}
          availableQuestionsQuery={availableQuestionsQuery}
          selectedQuestions={selectedQuestions}
          setSelectedQuestions={setSelectedQuestions}
          goToTheRoute={goToTheRoute}
        />
      </Card>
      <ConfirmModal
        dialogTitle="Confirm delete questions"
        confirmButtonVariant="destructive"
        confirmButtonText="Delete"
        confirmButtonBusyText="Deleting"
        cancelButtonText="Cancel"
        handleClose={handleHideDeleteSelectedConfirm}
        handleConfirm={handleDeleteSelected}
        isPending={deleteSelectedMutation.isPending}
        isVisible={showDeleteSelectedConfirm}
      >
        Do you confirm deleting {selectedQuestions.size} selected question
        {selectedQuestions.size > 1 ? 's' : ''}?
      </ConfirmModal>
    </>
  );
}
