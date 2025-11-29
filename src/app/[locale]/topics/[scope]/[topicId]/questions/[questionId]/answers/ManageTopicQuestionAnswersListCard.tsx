import React from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { APIError } from '@/lib/types/api';
import { generateArray } from '@/lib/helpers';
import { truncateMarkdown } from '@/lib/helpers/markdown';
import { invalidateKeysByPrefixes, makeQueryKeyPrefix } from '@/lib/helpers/react-query';
import { getRandomHashString } from '@/lib/helpers/strings';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
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
import { deleteAnswers, updateAnswer } from '@/features/answers/actions';
import { useAnswersBreadcrumbsItems } from '@/features/answers/components/AnswersBreadcrumbs';
import { TAnswer, TAnswerId, TAvailableAnswer } from '@/features/answers/types';
import { TQuestionId } from '@/features/questions/types';
import { TTopicId } from '@/features/topics/types';
import {
  useAvailableAnswers,
  useAvailableQuestionById,
  useAvailableTopicById,
  useGoBack,
  useGoToTheRoute,
  useSessionUser,
} from '@/hooks';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

const saveScrollHash = getRandomHashString();

export interface TManageTopicQuestionAnswersListCardProps {
  topicId: TTopicId;
  questionId: TQuestionId;
  availableTopicQuery: ReturnType<typeof useAvailableTopicById>;
  availableQuestionQuery: ReturnType<typeof useAvailableQuestionById>;
  availableAnswersQuery: ReturnType<typeof useAvailableAnswers>;
}

const useDarkHeader = true;

function AnswersTableHeader({
  isAdminMode,
  selectedAnswers,
  allAnswers,
  toggleAll,
}: {
  isAdminMode: boolean;
  selectedAnswers: Set<TAnswerId>;
  allAnswers: TAnswer[];
  toggleAll: () => void;
}) {
  const hasSelected = !!selectedAnswers.size;
  const isAllSelected = allAnswers.length > 0 && selectedAnswers.size === allAnswers.length;
  const isIndeterminate = hasSelected && !isAllSelected; // selectedAnswers.size > 0 && selectedAnswers.size < allAnswers.length;

  return (
    <TableHeader
      className={cn(
        isDev && '__ManageTopicQuestionAnswersListCard_AnswersTableHeader_Root', // DEBUG
        'sticky top-0 z-10',
        // Dark theme
        useDarkHeader && 'dark-theme bg-theme-500 text-white',
        useDarkHeader &&
          'before:absolute before:inset-0 before:z-0 before:bg-background before:opacity-40 before:content-[""]',
      )}
    >
      <TableRow className="z-1 relative">
        <TableHead
          id="select"
          className={cn(
            'w-[3em] cursor-pointer text-center transition',
            // NOTE: Those hovers with nested elements work only in tailwindcss 4
            'hover:[&>button]:ring-2 hover:[&>button]:ring-theme-500/50',
          )}
          onClick={toggleAll}
          title="Select/deselect all"
        >
          <Checkbox
            checked={hasSelected}
            aria-label="Select/deselect all"
            className={cn(
              'block',
              // Dark theme
              useDarkHeader &&
                'border-white/70 hover:!ring-white/70 data-[state=checked]:border-white',
              // isIndeterminate && 'opacity-70',
            )}
            indicatorClassName={cn(
              // Dark theme
              useDarkHeader && 'text-white',
            )}
            icon={isIndeterminate ? Icons.Dot : Icons.Check}
          />
        </TableHead>
        <TableHead id="no" className="truncate text-right max-lg:hidden">
          No
        </TableHead>
        {isAdminMode && isDev && (
          <TableHead id="topicId" className="truncate max-lg:hidden">
            ID
          </TableHead>
        )}
        <TableHead id="text" className="truncate">
          Answer Text
        </TableHead>
        <TableHead id="isCorrect" className="truncate max-lg:hidden">
          Correct
        </TableHead>
        <TableHead id="isGenerated" className="truncate max-lg:hidden">
          Generated
        </TableHead>
        <TableHead id="Actions"></TableHead>
      </TableRow>
    </TableHeader>
  );
}

interface TAnswersTableRowProps {
  answer: TAnswer;
  idx: number;
  answersListRoutePath: string;
  isAdminMode: boolean;
  availableAnswersQuery: ReturnType<typeof useAvailableAnswers>;
  isSelected: boolean;
  toggleSelected: (answerId: TAnswerId) => void;
}

function AnswersTableRow(props: TAnswersTableRowProps) {
  const {
    answer,
    answersListRoutePath,
    isAdminMode,
    idx,
    availableAnswersQuery,
    isSelected,
    toggleSelected,
  } = props;
  const answerId = answer.id;
  const answerRoutePath = `${answersListRoutePath}/${answerId}`;
  const { id, text, isCorrect, isGenerated } = answer;

  const [isPending, startTransition] = React.useTransition();

  const queryClient = useQueryClient();

  const updateAndInvalidateAnswer = React.useCallback(
    async (updatedAnswer: TAnswer) => {
      // Update via server function
      await updateAnswer(updatedAnswer);
      // Update the item to the cached react-query data
      availableAnswersQuery.updateAnswer(updatedAnswer);
      // Invalidate all other keys...
      availableAnswersQuery.invalidateAllKeysExcept([availableAnswersQuery.queryKey]);
      // Invalidate all other possible related cached data
      const invalidatePrefixes = [['available-answer', answer.id]].map(makeQueryKeyPrefix);
      invalidateKeysByPrefixes(queryClient, invalidatePrefixes, [availableAnswersQuery.queryKey]);
    },
    [answer.id, availableAnswersQuery, queryClient],
  );

  const handleToggleCorrect = React.useCallback(
    (checked: boolean) => {
      startTransition(async () => {
        const updatedAnswer = { ...answer, isCorrect: checked };
        try {
          // Update via server function
          await updateAndInvalidateAnswer(updatedAnswer);
        } catch (error) {
          const details = error instanceof APIError ? error.details : null;
          const message = 'Cannot update answer status';
          // eslint-disable-next-line no-console
          console.error('[AnswersTableRow:handleToggleCorrect]', message, {
            details,
            error,
            answerId: answer.id,
          });
          debugger; // eslint-disable-line no-debugger
          toast.error(message);
        }
      });
    },
    [answer, updateAndInvalidateAnswer],
  );

  const handleToggleGenerated = React.useCallback(
    (checked: boolean) => {
      startTransition(async () => {
        const updatedAnswer = { ...answer, isGenerated: checked };
        try {
          // Update via server function
          await updateAndInvalidateAnswer(updatedAnswer);
        } catch (error) {
          const details = error instanceof APIError ? error.details : null;
          const message = 'Cannot update answer generated status';
          // eslint-disable-next-line no-console
          console.error('[AnswersTableRow:handleToggleGenerated]', message, {
            details,
            error,
            answerId: answer.id,
          });
          debugger; // eslint-disable-line no-debugger
          toast.error(message);
        }
      });
    },
    [answer, updateAndInvalidateAnswer],
  );

  return (
    <TableRow
      className={cn(
        isDev && '__ManageTopicQuestionAnswersListCard_AnswersTableRow_Root', // DEBUG
        'truncate',
        'bg-background/10',
        'hover:bg-theme-500/5',
        isSelected && 'bg-theme-500/10 hover:bg-theme-500/15',
      )}
      data-answer-id={id}
    >
      <TableCell
        id="select"
        className={cn(
          'w-[3em] cursor-pointer text-center transition',
          // NOTE: Those hovers with nested elements work only in tailwindcss 4
          'hover:[&>button]:ring-2 hover:[&>button]:ring-theme-500/50',
        )}
        onClick={() => toggleSelected(id)}
        title="Select answer"
      >
        <Checkbox checked={isSelected} className="block" aria-label="Select answer" />
      </TableCell>
      <TableCell id="no" className="max-w-[1em] truncate text-right opacity-50 max-lg:hidden">
        <div className="truncate">{idx + 1}</div>
      </TableCell>
      {isAdminMode && isDev && (
        <TableCell id="answerId" className="max-w-[8em] truncate max-lg:hidden" title={id}>
          <div className="truncate">
            <span className="mr-[2px] opacity-30">#</span>
            {id}
          </div>
        </TableCell>
      )}
      <TableCell id="text" className="max-w-[20em] truncate" title={truncateMarkdown(text, 120)}>
        <Link className="text-ellipsis whitespace-normal hover:underline" href={answerRoutePath}>
          {truncateMarkdown(text, 80)}
        </Link>
      </TableCell>
      <TableCell id="isCorrect" className="w-[8em] max-lg:hidden">
        <Switch
          checked={isCorrect}
          onCheckedChange={handleToggleCorrect}
          disabled={isPending}
          className="data-[state=checked]:bg-green-500"
        />
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
            // onClick={() => handleEditAnswer(answer.id)}
            aria-label="Edit"
            title="Edit"
          >
            <Link className="flex" href={`${answerRoutePath}/edit`}>
              <Icons.Edit className="size-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-9 shrink-0 text-destructive"
            // onClick={() => handleDeleteAnswer(answer.id)}
            aria-label="Delete"
            title="Delete"
          >
            <Link
              className="flex"
              href={`${answersListRoutePath}/delete?answerId=${answer.id}&from=ManageTopicQuestionAnswersListCard`}
            >
              <Icons.Trash className="size-4" />
            </Link>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

interface TAnswersTableContentProps extends TManageTopicQuestionAnswersListCardProps {
  availableAnswersQuery: ReturnType<typeof useAvailableAnswers>;
  answersListRoutePath: string;
  selectedAnswers: Set<TAnswerId>;
  setSelectedAnswers: React.Dispatch<React.SetStateAction<Set<TAnswerId>>>;
}

type TMemo = { allAnswers: TAvailableAnswer[] };

export function AnswersTableContent(props: TAnswersTableContentProps & { className?: string }) {
  const {
    className,
    availableAnswersQuery,
    answersListRoutePath,
    selectedAnswers,
    setSelectedAnswers,
  } = props;

  const user = useSessionUser();
  // const isLogged = !!user;
  const isAdmin = user?.role === 'ADMIN';
  const { allowed: aiGenerationsAllowed, loading: aiGenerationsLoading } = useAIGenerationsStatus();

  const {
    allAnswers,
    hasAnswers,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isAnswersLoading,
    isFetched: isAnswersFetched,
    // queryKey: availableAnswersQueryKey,
    // queryProps: availableAnswersQueryProps,
  } = availableAnswersQuery;

  const memo = React.useMemo<TMemo>(() => ({ allAnswers: [] }), []);
  memo.allAnswers = allAnswers;

  const isOverallLoading = !isAnswersFetched || isAnswersLoading;

  const toggleSelected = React.useCallback(
    (answerId: TAnswerId) => {
      setSelectedAnswers((set) => {
        const newSet = new Set(set);
        if (set.has(answerId)) {
          newSet.delete(answerId);
        } else {
          newSet.add(answerId);
        }
        return newSet;
      });
    },
    [setSelectedAnswers],
  );

  const toggleAll = React.useCallback(() => {
    setSelectedAnswers((set) => {
      if (set.size) {
        return new Set();
      } else {
        return new Set(memo.allAnswers.map((answer) => answer.id));
      }
    });
  }, [memo, setSelectedAnswers]);

  if (isOverallLoading) {
    return (
      <div
        className={cn(
          isDev && '__AnswersTableContent_Skeleton', // DEBUG
          'flex flex-col gap-4 px-6',
        )}
      >
        <Skeleton className="h-8 w-full rounded-lg" />
        {generateArray(3).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!hasAnswers) {
    return (
      <PageEmpty
        className="size-full flex-1"
        icon={Icons.Answers}
        title="No answers have been created yet"
        description="You dont have any answers yet. Add any answer to your profile."
        framed={false}
        buttons={
          <>
            <Button>
              <Link href={`${answersListRoutePath}/add`} className="flex gap-2">
                <Icons.Add className="hidden size-4 opacity-50 sm:flex" />
                Add New Answer
              </Link>
            </Button>
            <Button disabled={!aiGenerationsAllowed || aiGenerationsLoading} variant="secondary">
              <Link href={`${answersListRoutePath}/generate`} className="flex gap-2">
                <Icons.WandSparkles className="hidden size-4 opacity-50 sm:flex" />
                Generate Answers
              </Link>
            </Button>
          </>
        }
      />
    );
  }

  // TODO: Use ScrollAreaInfinite
  return (
    <ScrollAreaInfinite
      effectorData={allAnswers}
      fetchNextPage={fetchNextPage}
      isLoading={isAnswersLoading}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      saveScrollKey="ManageTopicQuestionAnswersListCard"
      saveScrollHash={saveScrollHash}
      className={cn(
        isDev && '__AnswersTableContent', // DEBUG
        'relative flex flex-1 flex-col overflow-hidden',
        'mx-6',
        className,
      )}
      viewportClassName={cn(
        isDev && '__AnswersTableContent_Viewport', // DEBUG
      )}
      containerClassName={cn(
        isDev && '__AnswersTableContent_Container', // DEBUG
        'relative w-full flex flex-col gap-4',
      )}
    >
      <Table>
        <AnswersTableHeader
          isAdminMode={isAdmin}
          selectedAnswers={selectedAnswers}
          allAnswers={allAnswers}
          toggleAll={toggleAll}
        />
        <TableBody>
          {allAnswers.map((answer, idx) => (
            <AnswersTableRow
              key={answer.id}
              idx={idx}
              answer={answer}
              answersListRoutePath={answersListRoutePath}
              isAdminMode={isAdmin}
              availableAnswersQuery={availableAnswersQuery}
              isSelected={selectedAnswers.has(answer.id)}
              toggleSelected={toggleSelected}
            />
          ))}
        </TableBody>
      </Table>
    </ScrollAreaInfinite>
  );
}

export function ManageTopicQuestionAnswersListCard(
  props: TManageTopicQuestionAnswersListCardProps,
) {
  const {
    topicId,
    questionId,
    availableTopicQuery,
    availableQuestionQuery,
    availableAnswersQuery,
  } = props;

  const { manageScope } = useManageTopicsStore();
  const [selectedAnswers, setSelectedAnswers] = React.useState<Set<TAnswerId>>(new Set());
  const [showDeleteSelectedConfirm, setShowDeleteSelectedConfirm] = React.useState(false);
  const queryClient = useQueryClient();

  // Calculate paths...
  const topicsListRoutePath = `/topics/${manageScope}`;
  const topicRoutePath = `${topicsListRoutePath}/${topicId}`;
  const questionsListRoutePath = `${topicRoutePath}/questions`;
  const questionRoutePath = `${questionsListRoutePath}/${questionId}`;
  const answersListRoutePath = `${questionRoutePath}/answers`;
  // const answerRoutePath = `${answersListRoutePath}/${answerId}`;

  const {
    topic,
    // isFetched: isTopicFetched,
    // isLoading: isTopicLoading,
  } = availableTopicQuery;
  if (!topic) {
    throw new Error('No topic found');
  }

  const {
    question,
    // isFetched: isQuestionFetched,
    // isLoading: isQuestionLoading,
  } = availableQuestionQuery;
  if (!question) {
    throw new Error('No question found');
  }

  const goToTheRoute = useGoToTheRoute();
  const goBack = useGoBack(questionsListRoutePath);

  const {
    refetch: refetchAnswers,
    isRefetching: isAnswersRefetching,
    // isLoading: isAnswersLoading,
    // isFetched: isAnswersFetched,
  } = availableAnswersQuery;

  const deleteSelectedMutation = useMutation({
    mutationFn: deleteAnswers,
    onSuccess: () => {
      // Remove deleted answers from cache
      const selectedIds = Array.from(selectedAnswers);
      selectedIds.forEach((answerId) => {
        availableAnswersQuery.deleteAnswer(answerId);
      });
      // Invalidate all related answers' queries (except current)
      const invalidatePrefixes = [
        '["available-answer',
        // ['available-answers-for-question', questionId],
        ['available-question', questionId],
      ].map(makeQueryKeyPrefix);
      invalidateKeysByPrefixes(queryClient, invalidatePrefixes, [availableAnswersQuery.queryKey]);
      // Clear selection
      setSelectedAnswers(new Set());
    },
    onError: (error) => {
      const details = error instanceof APIError ? error.details : null;
      const message = 'Cannot delete selected answers';
      // eslint-disable-next-line no-console
      console.error('[ManageTopicQuestionAnswersListCard:deleteSelectedMutation]', message, {
        details,
        error,
        selectedAnswers: Array.from(selectedAnswers),
      });
      toast.error(message);
    },
  });

  const handleDeleteSelected = React.useCallback(() => {
    const selectedIds = Array.from(selectedAnswers);
    if (selectedIds.length === 0) return;

    const promise = deleteSelectedMutation.mutateAsync(selectedIds);
    toast.promise(promise, {
      loading: 'Deleting selected answers...',
      success: 'Successfully deleted selected answers',
      error: 'Cannot delete selected answers',
    });
    setShowDeleteSelectedConfirm(false);
  }, [selectedAnswers, deleteSelectedMutation]);

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
        // variant: 'ghost',
        icon: Icons.ArrowLeft,
        visibleFor: 'sm',
        onClick: goBack,
      },
      {
        id: 'Reload',
        content: 'Reload',
        // variant: 'ghost',
        icon: Icons.Refresh,
        visibleFor: 'lg',
        pending: isAnswersRefetching,
        onClick: () => refetchAnswers(),
      },
      {
        id: 'Delete Selected',
        content: 'Delete Selected',
        // variant: 'destructive',
        icon: Icons.Trash,
        // visibleFor: 'xl',
        hidden: !selectedAnswers.size,
        pending: deleteSelectedMutation.isPending,
        onClick: handleShowDeleteSelectedConfirm,
      },
      {
        id: 'Add New Answer',
        content: 'Add New Answer',
        // variant: 'success',
        icon: Icons.Add,
        visibleFor: 'xl',
        onClick: () => goToTheRoute(`${answersListRoutePath}/add`),
      },
      {
        id: 'Generate Answers',
        content: 'Generate Answers',
        // variant: 'secondary',
        icon: Icons.WandSparkles,
        // visibleFor: 'lg',
        disabled: !aiGenerationsAllowed || aiGenerationsLoading,
        onClick: () => goToTheRoute(`${answersListRoutePath}/generate`),
      },
    ],
    [
      goBack,
      isAnswersRefetching,
      selectedAnswers.size,
      deleteSelectedMutation.isPending,
      handleShowDeleteSelectedConfirm,
      aiGenerationsAllowed,
      aiGenerationsLoading,
      refetchAnswers,
      goToTheRoute,
      answersListRoutePath,
    ],
  );

  const breadcrumbs = useAnswersBreadcrumbsItems({
    scope: manageScope,
    // isLoading: !topic || !question,
    topic: topic,
    question: question,
  });

  return (
    <>
      <DashboardHeader
        heading={truncateMarkdown(question.text, 100)} // "Manage Answers"
        title={truncateMarkdown(question.text, 200)}
        className={cn(
          isDev && '__ManageTopicQuestionAnswersListCard_DashboardHeader', // DEBUG
          'mx-6',
        )}
        actions={actions}
        breadcrumbs={breadcrumbs}
        inactiveLastBreadcrumb
      />
      <AnswersTableContent
        {...props}
        className={cn(
          isDev && '__ManageTopicQuestionAnswersListCard_CardContent', // DEBUG
          // 'relative flex flex-1 flex-col px-0',
          'flex flex-row flex-wrap items-start',
          'overflow-hidden rounded-md transition',
        )}
        answersListRoutePath={answersListRoutePath}
        availableAnswersQuery={availableAnswersQuery}
        selectedAnswers={selectedAnswers}
        setSelectedAnswers={setSelectedAnswers}
      />
      <ConfirmModal
        dialogTitle="Confirm delete selected answers"
        confirmButtonVariant="destructive"
        confirmButtonText="Delete"
        confirmButtonBusyText="Deleting"
        cancelButtonText="Cancel"
        handleClose={handleHideDeleteSelectedConfirm}
        handleConfirm={handleDeleteSelected}
        isPending={deleteSelectedMutation.isPending}
        isVisible={showDeleteSelectedConfirm}
      >
        <div className="flex flex-col gap-2">
          <p>Do you confirm deleting selected answers?</p>
          <p>Selected answers count: {selectedAnswers.size}.</p>
        </div>
      </ConfirmModal>
    </>
  );
}
