import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import { APIError } from '@/lib/types/api';
import { truncateMarkdown } from '@/lib/helpers/markdown';
import { invalidateKeysByPrefixes, makeQueryKeyPrefix } from '@/lib/helpers/react-query';
import { getRandomHashString } from '@/lib/helpers/strings';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Link } from '@/i18n/routing';
import { useAvailableQuestions } from '@/hooks/react-query/useAvailableQuestions';
import { buttonVariants } from '@/components/ui/Button';
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
import { availableTopicsRoute, TRoutePath } from '@/config';
import { isDev } from '@/constants';
import { useAIGenerationsStatus } from '@/features/ai-generations/query-hooks';
import { deleteQuestions, updateQuestion } from '@/features/questions/actions';
import { useQuestionsBreadcrumbsItems } from '@/features/questions/components/QuestionsBreadcrumbs';
import { TQuestion, TQuestionData, TQuestionId } from '@/features/questions/types';
import { TTopicId } from '@/features/topics/types';
import { useAvailableTopicById, useGoBack, useSessionUser } from '@/hooks';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

const saveScrollHash = getRandomHashString();

const truncateLongMarkdownTextsTo = 200;

export interface TManageTopicQuestionsListCardProps {
  topicId: TTopicId;
  // handleDeleteQuestion: (questionId: TQuestionId) => void;
  // handleEditQuestion: (questionId: TQuestionId) => void;
  // handleAddQuestion: () => void;
  // handleEditAnswers: (questionId: TQuestionId) => void;
  availableQuestionsQuery: ReturnType<typeof useAvailableQuestions>;
  availableTopicQuery: ReturnType<typeof useAvailableTopicById>;
}

const useDarkHeader = true;

function AddQuestionBlock(props: { topicId: TTopicId }) {
  const { topicId } = props;
  const t = useT();
  const { manageScope } = useManageTopicsStore();
  const topicsListRoutePath = `/topics/${manageScope}`;
  const topicRoutePath = `${topicsListRoutePath}/${topicId}`;
  const questionsListRoutePath = `${topicRoutePath}/questions`;
  const addQuestionRoute = `${questionsListRoutePath}/add` as TRoutePath;
  const { data: sessionData } = useSession();
  const user = sessionData?.user;

  if (!user?.id) {
    return null;
  }

  return (
    <div className="flex items-center justify-center">
      <Link
        href={addQuestionRoute}
        className={cn(buttonVariants({ variant: 'theme' }), 'flex w-full gap-2')}
      >
        <Icons.Plus className="size-5" />
        {t('AddNewQuestion')}
      </Link>
    </div>
  );
}

function QuestionsTableHeader({
  selectedQuestions,
  allQuestions,
  toggleAll,
}: {
  isAdminMode: boolean;
  selectedQuestions: Set<TQuestionId>;
  allQuestions: TQuestion[];
  toggleAll: () => void;
}) {
  const t = useT();
  const hasSelected = !!selectedQuestions.size;
  const isAllSelected = allQuestions.length > 0 && selectedQuestions.size === allQuestions.length;
  const isIndeterminate = hasSelected && !isAllSelected;

  return (
    <TableHeader
      className={cn(
        isDev && '__ManageTopicQuestionsListCard_QuestionsTableHeader_Root', // DEBUG
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
            'hover:[&>button]:ring-2 hover:[&>button]:ring-theme-500/50',
          )}
          onClick={toggleAll}
          title={t('ManageTopicQuestionsListCard.SelectDeselectAll')}
        >
          <Checkbox
            checked={hasSelected}
            aria-label={t('ManageTopicQuestionsListCard.SelectDeselectAll')}
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
        <TableHead id="no" className="max-w-2 truncate text-right max-sm:hidden">
          {t('NN')}
        </TableHead>
        {/*isDev && (
          <TableHead id="questionId" className="truncate max-sm:hidden">
            ID
          </TableHead>
        )*/}
        <TableHead id="text" className="truncate">
          {t('QuestionText')}
        </TableHead>
        <TableHead id="answers" className="max-w-2 truncate max-sm:hidden">
          {t('Answers')}
        </TableHead>
        <TableHead id="isGenerated" className="truncate max-lg:hidden">
          {t('ManageTopicQuestionsListCard.Generated')}
        </TableHead>
        <TableHead id="Actions"></TableHead>
      </TableRow>
    </TableHeader>
  );
}

interface TQuestionsTableRowProps {
  // handleDeleteQuestion: TManageTopicQuestionsListCardProps['handleDeleteQuestion'];
  // handleEditAnswers: TManageTopicQuestionsListCardProps['handleEditAnswers'];
  // handleEditQuestion: TManageTopicQuestionsListCardProps['handleEditQuestion'];
  // questionsListRoutePath: string;
  availableQuestionsQuery: ReturnType<typeof useAvailableQuestions>;
  idx: number;
  isAdminMode: boolean;
  isSelected: boolean;
  question: TQuestion;
  toggleSelected: (questionId: TQuestionId) => void;
}

function QuestionsTableRow(props: TQuestionsTableRowProps) {
  const {
    question,
    // questionsListRoutePath,
    // handleDeleteQuestion,
    // handleEditQuestion,
    // handleEditAnswers,
    // isAdminMode,
    idx,
    isSelected,
    toggleSelected,
    availableQuestionsQuery,
  } = props;
  const { id, text, _count, isGenerated, topicId } = question;
  const answersCount = _count?.answers;
  const t = useT();

  const { manageScope } = useManageTopicsStore();
  const topicsListRoutePath = `/topics/${manageScope}`;
  const topicRoutePath = `${topicsListRoutePath}/${topicId}`;
  const questionsListRoutePath = `${topicRoutePath}/questions`;
  const questionRoutePath = `${questionsListRoutePath}/${id}`;

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
          const message = t('ManageTopicQuestionsListCard.CannotUpdateQuestionGeneratedStatus');
          // eslint-disable-next-line no-console
          console.error('[QuestionsTableRow:handleToggleGenerated]', message, {
            details,
            error,
            questionId: question.id,
          });
          debugger; // eslint-disable-line no-debugger
          toast.error(message);
        }
      });
    },
    [question, t, updateAndInvalidateQuestion],
  );
  return (
    <TableRow
      className={cn(
        isDev && '__ManageTopicQuestionsListCard_QuestionsTableRow_Root', // DEBUG
        'truncate',
        'bg-background/10',
        'hover:bg-theme-500/5',
        isSelected && 'bg-theme-500/10 hover:bg-theme-500/15',
      )}
      data-question-id={id}
    >
      <TableCell
        id="select"
        className={cn(
          'w-[3em] cursor-pointer text-center transition',
          'hover:[&>button]:ring-2 hover:[&>button]:ring-theme-500/50',
        )}
        onClick={() => toggleSelected(id)}
        title={t('ManageTopicQuestionsListCard.SelectQuestion')}
      >
        <Checkbox
          checked={isSelected}
          className="block"
          aria-label={t('ManageTopicQuestionsListCard.SelectQuestion')}
        />
      </TableCell>
      <TableCell id="no" className="max-w-2 truncate text-right opacity-50 max-sm:hidden">
        <div className="truncate">{idx + 1}</div>
      </TableCell>
      {/*isDev && (
        <TableCell id="questionId" className="max-w-8 truncate max-sm:hidden" title={id}>
          <div className="truncate opacity-50">
            <span className="mr-1 opacity-30">#</span>
            {id}
          </div>
        </TableCell>
      )*/}
      <TableCell
        id="text"
        className="max-w-24 truncate"
        title={truncateMarkdown(text, truncateLongMarkdownTextsTo)}
      >
        <Link
          className="text-ellipsis whitespace-normal hover:underline"
          href={questionRoutePath as TRoutePath}
        >
          {truncateMarkdown(text, truncateLongMarkdownTextsTo)}
        </Link>
      </TableCell>
      <TableCell id="answers" className="max-w-2 truncate max-sm:hidden">
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
          <Link
            href={`${questionRoutePath}/answers` as TRoutePath}
            className={cn(buttonVariants({ size: 'icon', variant: 'ghost' }), 'size-9 shrink-0')}
            aria-label={t('EditAnswers')}
            title={t('EditAnswers')}
          >
            <Icons.Answers className="size-5" />
          </Link>
          <Link
            href={`${questionRoutePath}/edit` as TRoutePath}
            className={cn(buttonVariants({ size: 'icon', variant: 'ghost' }), 'size-9 shrink-0')}
            aria-label={t('ManageTopicQuestionsListCard.Edit')}
            title={t('ManageTopicQuestionsListCard.Edit')}
          >
            <Icons.Edit className="size-4" />
          </Link>
          <Link
            href={`${questionsListRoutePath}/delete?questionId=${question.id}` as TRoutePath}
            className={cn(buttonVariants({ size: 'icon', variant: 'ghost' }), 'size-9 shrink-0')}
            aria-label={t('ManageTopicQuestionsListCard.Delete')}
            title={t('ManageTopicQuestionsListCard.Delete')}
          >
            <Icons.Trash className="size-4 text-destructive" />
          </Link>
        </div>
      </TableCell>
    </TableRow>
  );
}

type TMemo = { allQuestions: TQuestion[] };

export function QuestionsTableContent(
  props: TManageTopicQuestionsListCardProps & {
    className?: string;
    availableQuestionsQuery: ReturnType<typeof useAvailableQuestions>;
    selectedQuestions: Set<TQuestionId>;
    setSelectedQuestions: React.Dispatch<React.SetStateAction<Set<TQuestionId>>>;
  },
) {
  const {
    // goToTheRoute,
    // handleAddQuestion,
    // handleDeleteQuestion,
    // handleEditAnswers,
    // handleEditQuestion,
    // questionsListRoutePath,
    availableQuestionsQuery,
    className,
    selectedQuestions,
    setSelectedQuestions,
    topicId,
  } = props;

  const { manageScope } = useManageTopicsStore();
  const topicsListRoutePath = `/topics/${manageScope}`;
  const topicRoutePath = `${topicsListRoutePath}/${topicId}`;
  const questionsListRoutePath = `${topicRoutePath}/questions`;
  // const questionRoutePath = `${questionsListRoutePath}/${questionId}`;
  // const answersListRoutePath = `${questionRoutePath}/answers`;
  // const answerRoutePath = `${answersListRoutePath}/${answerId}`;

  const user = useSessionUser();
  const isAdmin = user?.role === 'ADMIN';
  const t = useT();

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

  const { allowed: aiGenerationsAllowed, loading: aiGenerationsLoading } = useAIGenerationsStatus({
    traceId: 'ManageTopicsListCard:QuestionsTableContent',
  });

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
        title={t('NoQuestionsCreatedYet')}
        description={t('ManageTopicQuestionsListCard.NoQuestionsDescription')}
        framed={false}
        showAIInfo
        buttons={
          <>
            <Link
              href={`${questionsListRoutePath}/add` as TRoutePath}
              className={cn(
                buttonVariants({ variant: 'theme' }),
                'content-truncate flex items-center gap-2',
                (!aiGenerationsAllowed || aiGenerationsLoading) && 'disabled',
              )}
            >
              <Icons.Add className="hidden size-4 opacity-50 sm:flex" />
              <span className="truncate">{t('AddNewQuestion')}</span>
            </Link>
            <Link
              href={`${questionsListRoutePath}/generate` as TRoutePath}
              className={cn(
                buttonVariants({ variant: 'gr1' }),
                'content-truncate flex items-center gap-2',
                (!aiGenerationsAllowed || aiGenerationsLoading) && 'disabled',
              )}
            >
              <Icons.WandSparkles className="hidden size-4 opacity-50 sm:flex" />
              <span className="truncate">{t('GenerateQuestions')}</span>
            </Link>
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
      saveScrollKey="QuestionsTableContent"
      saveScrollHash={saveScrollHash}
      className={cn(
        isDev && '__QuestionsTableContent_Scroll', // DEBUG
        'relative flex flex-1 flex-col overflow-hidden',
        'mx-6',
        className,
      )}
      viewportClassName={cn(
        isDev && '__QuestionsTableContent_Scroll_Viewport', // DEBUG
      )}
      containerClassName={cn(
        isDev && '__QuestionsTableContent_Scroll_Container', // DEBUG
        'relative w-full flex flex-col gap-4',
      )}
    >
      <Table>
        <QuestionsTableHeader
          isAdminMode={isAdmin}
          selectedQuestions={selectedQuestions}
          allQuestions={allQuestions}
          toggleAll={toggleAll}
        />
        <TableBody>
          {allQuestions.map((question, idx) => (
            <QuestionsTableRow
              key={question.id}
              idx={idx}
              question={question}
              availableQuestionsQuery={availableQuestionsQuery}
              isAdminMode={isAdmin}
              isSelected={selectedQuestions.has(question.id)}
              toggleSelected={toggleSelected}
              // handleDeleteQuestion={handleDeleteQuestion}
              // handleEditAnswers={handleEditAnswers}
              // handleEditQuestion={handleEditQuestion}
              // questionsListRoutePath={questionsListRoutePath}
            />
          ))}
        </TableBody>
      </Table>
      <AddQuestionBlock topicId={topicId} />
    </ScrollAreaInfinite>
  );
}

export function ManageTopicQuestionsListCard(props: TManageTopicQuestionsListCardProps) {
  const { topicId, availableQuestionsQuery, availableTopicQuery } = props;
  const { manageScope } = useManageTopicsStore();
  const [selectedQuestions, setSelectedQuestions] = React.useState<Set<TQuestionId>>(new Set());
  const [showDeleteSelectedConfirm, setShowDeleteSelectedConfirm] = React.useState(false);
  const queryClient = useQueryClient();
  const t = useT();

  const topicsListRoutePath = `/topics/${manageScope}`;
  const topicRoutePath = `${topicsListRoutePath}/${topicId}`;
  const questionsListRoutePath = `${topicRoutePath}/questions`;
  // const questionRoutePath = `${questionsListRoutePath}/${questionId}`;
  // const answersListRoutePath = `${questionRoutePath}/answers`;
  // const answerRoutePath = `${answersListRoutePath}/${answerId}`;

  const { topic } = availableTopicQuery;
  const { refetch, isRefetching } = availableQuestionsQuery;

  const questionsCount = topic?._count?.questions;
  const allowedTraining = !!questionsCount;

  const goBack = useGoBack(topicsListRoutePath);
  // const goToTheRoute = useGoToTheRoute();

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
      const message = t('ManageTopicQuestionsListCard.CannotDeleteSelectedQuestions');
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
      loading: t('ManageTopicQuestionsListCard.DeletingSelectedQuestions'),
      success: t('ManageTopicQuestionsListCard.SuccessfullyDeletedSelectedQuestions'),
      error: t('ManageTopicQuestionsListCard.CannotDeleteSelectedQuestions'),
    });
    setShowDeleteSelectedConfirm(false);
  }, [selectedQuestions, deleteSelectedMutation, t]);

  const handleShowDeleteSelectedConfirm = React.useCallback(() => {
    setShowDeleteSelectedConfirm(true);
  }, []);

  const handleHideDeleteSelectedConfirm = React.useCallback(() => {
    setShowDeleteSelectedConfirm(false);
  }, []);

  const { allowed: aiGenerationsAllowed, loading: aiGenerationsLoading } = useAIGenerationsStatus({
    traceId: 'ManageTopicQuestionsListCard:ManageTopicQuestionsListCard',
  });

  const actions: TActionMenuItem[] = React.useMemo(
    () => [
      {
        id: 'Back',
        content: t('Back'),
        icon: Icons.ArrowLeft,
        visibleFor: 'sm',
        onClick: goBack,
      },
      {
        id: 'Reload',
        content: t('Reload'),
        icon: Icons.Refresh,
        visibleFor: 'lg',
        pending: isRefetching,
        onClick: handleReload,
      },
      {
        id: 'DeleteSelected',
        content: t('ManageTopicQuestionsListCard.DeleteSelected'),
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
        href: `${topicRoutePath}/questions/add`,
      },
      {
        id: 'GenerateQuestions',
        content: t('GenerateQuestions'),
        icon: Icons.WandSparkles,
        disabled: !aiGenerationsAllowed || aiGenerationsLoading,
        href: `${questionsListRoutePath}/generate`,
      },
      {
        id: 'AddNewTopic',
        content: t('AddNewTopic'),
        icon: Icons.Add,
        // visibleFor: 'xl',
        href: `${topicsListRoutePath}/add`,
      },
      {
        id: 'GoToTheTopic',
        content: t('GoToTheTopic'),
        icon: Icons.ArrowRight,
        href: topicRoutePath,
      },
      {
        id: 'ToTraining',
        content: t('ToTraining'),
        icon: Icons.Rocket,
        href: `${availableTopicsRoute}/${topicId}/workout`,
        hidden: !allowedTraining,
      },
    ],
    [
      t,
      goBack,
      isRefetching,
      handleReload,
      selectedQuestions.size,
      deleteSelectedMutation.isPending,
      handleShowDeleteSelectedConfirm,
      topicRoutePath,
      aiGenerationsAllowed,
      aiGenerationsLoading,
      questionsListRoutePath,
      topicsListRoutePath,
      topicId,
      allowedTraining,
    ],
  );

  const breadcrumbs = useQuestionsBreadcrumbsItems({
    scope: manageScope,
    topic: topic || undefined,
  });

  return (
    <>
      <DashboardHeader
        heading={t('ManageTopicQuestionsListCard.ManageQuestions')}
        className={cn(
          isDev && '__ManageTopicQuestionsListCard_DashboardHeader', // DEBUG
          'mx-6',
        )}
        actions={actions}
        breadcrumbs={breadcrumbs}
        inactiveLastBreadcrumb
      />
      <QuestionsTableContent
        {...props}
        className={cn(
          isDev && '__ManageTopicQuestionsListCard_CardContent', // DEBUG
          'flex flex-col flex-wrap items-start',
          'overflow-hidden rounded-md transition',
          // isDataLoading && 'opacity-50',
        )}
        availableQuestionsQuery={availableQuestionsQuery}
        selectedQuestions={selectedQuestions}
        setSelectedQuestions={setSelectedQuestions}
        // questionsListRoutePath={questionsListRoutePath}
        // goToTheRoute={goToTheRoute}
      />
      <ConfirmModal
        dialogTitle={t('ManageTopicQuestionsListCard.ConfirmDeleteQuestions')}
        confirmButtonVariant="destructive"
        confirmButtonText={t('Delete')}
        confirmButtonBusyText={t('ManageTopicQuestionsListCard.Deleting')}
        cancelButtonText={t('Cancel')}
        handleClose={handleHideDeleteSelectedConfirm}
        handleConfirm={handleDeleteSelected}
        isPending={deleteSelectedMutation.isPending}
        isVisible={showDeleteSelectedConfirm}
      >
        {t('ManageTopicQuestionsListCard.ConfirmDeleteQuestionsMessage', {
          count: selectedQuestions.size,
        })}
      </ConfirmModal>
    </>
  );
}
