import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { APIError } from '@/lib/types/api';
import { invalidateKeysByPrefixes, makeQueryKeyPrefix } from '@/lib/helpers/react-query';
import { getAbcHashString, getRandomHashString, truncateString } from '@/lib/helpers/strings';
import { cn } from '@/lib/utils';
import { TCachedUsers, useCachedUsersForTopics } from '@/hooks/topics/useCachedUsersForTopics';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { ScrollArea } from '@/components/ui/ScrollArea';
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
import { PageError } from '@/components/shared/PageError';
import { rootAliasRoute, TRoutePath } from '@/config';
import { isDev } from '@/constants';
import { TopicsManageScopeIds, topicsNamespaces } from '@/contexts/TopicsContext';
import { useTopicsFiltersContext } from '@/contexts/TopicsFiltersContext';
import { deleteTopics, updateTopic } from '@/features/topics/actions';
import { AvailableTopicsFilters } from '@/features/topics/components/AvailableTopicsFilters';
import { TTopic, TTopicId } from '@/features/topics/types';
import { useAvailableTopicsByScope, useGoBack } from '@/hooks';
import { useT } from '@/i18n';
import { Link } from '@/i18n/routing';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

import { ContentSkeletonTable } from './ContentSkeleton';

const sessionSaveScrollHash = getRandomHashString();

interface TManageTopicsListCardProps {
  handleDeleteTopic: (topicId: TTopicId, from: string) => void;
  handleEditTopic: (topicId: TTopicId) => void;
  handleEditQuestions: (topicId: TTopicId) => void;
  handleAddTopic: () => void;
  availableTopicsQuery: ReturnType<typeof useAvailableTopicsByScope>;
}
interface TTopicsTableContentProps extends TManageTopicsListCardProps {
  className?: string;
  goBack: () => void;
  selectedTopics: Set<TTopicId>;
  setSelectedTopics: React.Dispatch<React.SetStateAction<Set<TTopicId>>>;
}

type TMemo = { allTopics: TTopic[] };

const useDarkHeader = true;

function TopicsTableHeader({
  isAdminMode,
  selectedTopics,
  allTopics,
  toggleAll,
}: {
  isAdminMode: boolean;
  selectedTopics: Set<TTopicId>;
  allTopics: TTopic[];
  toggleAll: () => void;
}) {
  const t = useT();
  const hasSelected = !!selectedTopics.size;
  const isAllSelected = allTopics.length > 0 && selectedTopics.size === allTopics.length;
  const isIndeterminate = hasSelected && !isAllSelected;

  return (
    <TableHeader
      className={cn(
        isDev && '__ManageTopicsListCard_TopicsTableHeader_Root', // DEBUG
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
          title={t('ManageTopicsListCard.SelectDeselectAll')}
        >
          <Checkbox
            checked={hasSelected}
            aria-label={t('ManageTopicsListCard.SelectDeselectAll')}
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
          {t('ManageTopicsListCard.No')}
        </TableHead>
        {isDev && (
          <TableHead id="topicId" className="truncate max-xl:hidden">
            ID
          </TableHead>
        )}
        <TableHead id="name" className="truncate">
          {t('ManageTopicsListCard.TopicName')}
        </TableHead>
        <TableHead id="questions" className="truncate max-lg:hidden">
          {t('ManageTopicsListCard.Questions')}
        </TableHead>
        {isAdminMode && (
          <TableHead id="topicUser" className="truncate max-lg:hidden">
            {t('ManageTopicsListCard.Author')}
          </TableHead>
        )}
        <TableHead id="language" className="truncate max-xl:hidden">
          {t('ManageTopicsListCard.Language')}
        </TableHead>
        <TableHead id="keywords" className="truncate max-xl:hidden">
          {t('ManageTopicsListCard.Keywords')}
        </TableHead>
        <TableHead id="isPublic" className="truncate max-lg:hidden">
          {t('ManageTopicsListCard.Public')}
        </TableHead>
        <TableHead id="Actions"></TableHead>
      </TableRow>
    </TableHeader>
  );
}

interface TTopicsTableRowProps {
  topic: TTopic;
  idx: number;
  handleDeleteTopic: TManageTopicsListCardProps['handleDeleteTopic'];
  handleEditTopic: TManageTopicsListCardProps['handleEditTopic'];
  handleEditQuestions: TManageTopicsListCardProps['handleEditQuestions'];
  isAdminMode: boolean;
  cachedUsers: TCachedUsers;
  isSelected: boolean;
  toggleSelected: (topicId: TTopicId) => void;
  availableTopicsQuery: ReturnType<typeof useAvailableTopicsByScope>;
}

function TopicsTableRow(props: TTopicsTableRowProps) {
  const {
    topic,
    handleDeleteTopic,
    handleEditTopic,
    handleEditQuestions,
    isAdminMode,
    cachedUsers,
    idx,
    isSelected,
    toggleSelected,
    availableTopicsQuery,
  } = props;
  const { id, name, langCode, langName, keywords, userId, _count, isPublic } = topic;
  const t = useT();

  const [isPending, startTransition] = React.useTransition();
  const queryClient = useQueryClient();

  const updateAndInvalidateTopic = React.useCallback(
    async (updatedTopic: TTopic) => {
      await updateTopic(updatedTopic);
      availableTopicsQuery.updateTopic(updatedTopic);
      const invalidatePrefixes = [['available-topic', topic.id], ['available-topics']].map(
        makeQueryKeyPrefix,
      );
      invalidateKeysByPrefixes(queryClient, invalidatePrefixes, [availableTopicsQuery.queryKey]);
    },
    [topic.id, availableTopicsQuery, queryClient],
  );

  const handleTogglePublic = React.useCallback(
    (checked: boolean) => {
      startTransition(async () => {
        const updatedTopic = { ...topic, isPublic: checked };
        try {
          await updateAndInvalidateTopic(updatedTopic);
        } catch (error) {
          const details = error instanceof APIError ? error.details : null;
          const message = t('ManageTopicsListCard.CannotUpdateTopicPublicStatus');
          // eslint-disable-next-line no-console
          console.error('[TopicsTableRow:handleTogglePublic]', message, {
            details,
            error,
            topicId: topic.id,
          });
          debugger; // eslint-disable-line no-debugger
          toast.error(message);
        }
      });
    },
    [t, topic, updateAndInvalidateTopic],
  );
  const questionsCount = _count?.questions;
  const topicUser = isAdminMode ? cachedUsers[userId] : undefined;
  const { manageScope } = useManageTopicsStore();
  const routePath = `/topics/${manageScope}`;
  return (
    <TableRow
      className={cn(
        isDev && '__ManageTopicsListCard_TopicsTableRow_Root', // DEBUG
        'truncate',
        'bg-background/10',
        'hover:bg-theme-500/5',
        isSelected && 'bg-theme-500/10 hover:bg-theme-500/15',
      )}
      data-topic-id={id}
    >
      <TableCell
        id="select"
        className={cn(
          'w-[3em] cursor-pointer text-center transition',
          'hover:[&>button]:ring-2 hover:[&>button]:ring-theme-500/50',
        )}
        onClick={() => toggleSelected(id)}
        title={t('ManageTopicsListCard.SelectTopic')}
      >
        <Checkbox
          checked={isSelected}
          className="block"
          aria-label={t('ManageTopicsListCard.SelectTopic')}
        />
      </TableCell>
      <TableCell id="no" className="truncate text-right opacity-50 max-lg:hidden">
        <div className="truncate">{idx + 1}</div>
      </TableCell>
      {isDev && (
        <TableCell id="topicId" className="max-w-6 truncate max-xl:hidden" title={id}>
          <div className="truncate opacity-50">
            <span className="mr-[2px] opacity-30">#</span>
            {id}
          </div>
        </TableCell>
      )}
      <TableCell id="name" className="max-w-24 truncate">
        <Link
          className="text-ellipsis whitespace-normal hover:underline"
          href={`${routePath}/${id}` as TRoutePath}
        >
          {truncateString(name, 40)}
        </Link>
      </TableCell>
      <TableCell id="questions" className="max-w-[8em] truncate max-lg:hidden">
        <div className="truncate">
          {questionsCount ? (
            <span className="font-medium">{questionsCount}</span>
          ) : (
            <span className="opacity-30">—</span>
          )}
        </div>
      </TableCell>
      {isAdminMode && (
        <TableCell id="topicUser" className="max-w-[8em] truncate max-lg:hidden">
          {topicUser ? (
            <div className="truncate" title={topicUser?.name || undefined}>
              {topicUser?.name}
            </div>
          ) : (
            <Skeleton className="h-[2em] w-full rounded-sm" />
          )}
        </TableCell>
      )}
      <TableCell id="language" className="max-w-[8em] truncate max-xl:hidden">
        <div className="truncate">
          {[langName, langCode && `(${langCode})`].filter(Boolean).join(' ')}
        </div>
      </TableCell>
      <TableCell id="keywords" className="max-w-[8em] truncate max-xl:hidden">
        <div className="truncate">{keywords}</div>
      </TableCell>
      <TableCell id="isPublic" className="w-[8em] max-lg:hidden">
        <Switch
          checked={isPublic || false}
          onCheckedChange={handleTogglePublic}
          disabled={isPending}
        />
      </TableCell>
      <TableCell id="Actions" className="text-right">
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-9 shrink-0"
            onClick={() => handleEditQuestions(topic.id)}
            aria-label={t('ManageTopicsListCard.EditQuestions')}
            title={t('ManageTopicsListCard.EditQuestions')}
          >
            <Icons.Questions className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-9 shrink-0"
            onClick={() => handleEditTopic(topic.id)}
            aria-label={t('ManageTopicsListCard.Edit')}
            title={t('ManageTopicsListCard.Edit')}
          >
            <Icons.Edit className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-9 shrink-0 text-destructive"
            onClick={() => handleDeleteTopic(topic.id, 'ManageTopicsListCard')}
            aria-label={t('ManageTopicsListCard.Delete')}
            title={t('ManageTopicsListCard.Delete')}
          >
            <Icons.Trash className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function TopicsTableContent(props: TTopicsTableContentProps) {
  const {
    className,
    handleDeleteTopic,
    handleEditTopic,
    handleEditQuestions,
    handleAddTopic,
    availableTopicsQuery,
    goBack,
    selectedTopics,
    setSelectedTopics,
  } = props;
  const { manageScope } = useManageTopicsStore();
  const t = useT();
  const isAdminMode = manageScope === TopicsManageScopeIds.ALL_TOPICS; // || user?.role === 'ADMIN';

  const { isExpanded: isFiltersExpanded, expandFilters } = useTopicsFiltersContext();

  const {
    isLoading,
    hasTopics,
    allTopics,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isError,
    error,
    queryUrlHash,
  } = availableTopicsQuery;

  const saveScrollHash = React.useMemo(
    () => sessionSaveScrollHash + getAbcHashString(queryUrlHash),
    [queryUrlHash],
  );

  const cachedUsers = useCachedUsersForTopics({
    topics: allTopics,
    bypass: !isAdminMode, // Do not use users data if not admin user role
  });

  const memo = React.useMemo<TMemo>(() => ({ allTopics: [] }), []);
  memo.allTopics = allTopics;

  const toggleSelected = React.useCallback(
    (topicId: TTopicId) => {
      setSelectedTopics((set) => {
        const newSet = new Set(set);
        if (set.has(topicId)) {
          newSet.delete(topicId);
        } else {
          newSet.add(topicId);
        }
        return newSet;
      });
    },
    [setSelectedTopics],
  );

  const toggleAll = React.useCallback(() => {
    setSelectedTopics((set) => {
      if (set.size) {
        return new Set();
      } else {
        return new Set(memo.allTopics.map((topic) => topic.id));
      }
    });
  }, [memo, setSelectedTopics]);

  if (isError) {
    return (
      <PageError
        className={cn(
          isDev && '__ManageTopicsListCard_TopicsTableContent_Error', // DEBUG
          className,
        )}
        error={error || t('ManageTopicsListCard.ErrorLoadingTopicsData')}
        reset={refetch}
        // extraActions={extraActions}
      />
    );
  }

  if (!hasTopics) {
    return (
      <ScrollArea
        className={cn(
          isDev && '__ManageTopicsListCard_TopicsTableContent_PageEmpty_Scroll', // DEBUG
          'flex flex-1 flex-col overflow-hidden',
          'mx-6',
          className,
        )}
        viewportClassName={cn(
          isDev && '__ManageTopicsListCard_TopicsTableContent_ScrollViewport', // DEBUG
          'flex flex-1 flex-col',
          '[&>div]:!flex [&>div]:flex-col [&>div]:flex-1',
        )}
      >
        <PageEmpty
          className={cn(
            isDev && '__ManageTopicsListCard_TopicsTableContent_PageEmpty', // DEBUG
          )}
          icon={Icons.Topics}
          title={t('ManageTopicsListCard.NoTopicsFound')}
          description={t('ManageTopicsListCard.NoTopicsFoundDescription')}
          buttons={
            <>
              <Button variant="ghost" onClick={goBack} className="flex gap-2">
                <Icons.ArrowLeft className="hidden size-4 opacity-50 sm:flex" />
                {t('ManageTopicsListCard.GoBack')}
              </Button>
              {!isFiltersExpanded && (
                <Button variant="outline" onClick={expandFilters} className="flex gap-2">
                  <Icons.Settings2 className="hidden size-4 opacity-50 sm:flex" />
                  {t('ManageTopicsListCard.ChangeFilters')}
                </Button>
              )}
              <Button onClick={handleAddTopic} className="flex gap-2">
                <Icons.Topics className="hidden size-4 opacity-50 sm:flex" />
                {t('ManageTopicsListCard.AddTopic')}
              </Button>
            </>
          }
        />
      </ScrollArea>
    );
  }

  return (
    <ScrollAreaInfinite
      effectorData={allTopics}
      fetchNextPage={fetchNextPage}
      isLoading={isLoading}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      saveScrollKey="ManageTopicsListCard"
      saveScrollHash={saveScrollHash}
      className={cn(
        isDev && '__ManageTopicsListCard_TopicsTableContent_Scroll', // DEBUG
        'relative flex flex-1 flex-col overflow-hidden',
        'mx-6',
        className,
      )}
      viewportClassName={cn(
        isDev && '__ManageTopicsListCard_TopicsTableContent_Scroll_Viewport', // DEBUG
      )}
      containerClassName={cn(
        isDev && '__ManageTopicsListCard_TopicsTableContent_Scroll_Container', // DEBUG
        'relative w-full flex flex-col gap-4',
      )}
    >
      <Table>
        <TopicsTableHeader
          isAdminMode={isAdminMode}
          selectedTopics={selectedTopics}
          allTopics={allTopics}
          toggleAll={toggleAll}
        />
        <TableBody>
          {allTopics.map((topic, idx) => (
            <TopicsTableRow
              key={topic.id}
              idx={idx}
              topic={topic}
              handleDeleteTopic={handleDeleteTopic}
              handleEditTopic={handleEditTopic}
              handleEditQuestions={handleEditQuestions}
              isAdminMode={isAdminMode}
              cachedUsers={cachedUsers}
              isSelected={selectedTopics.has(topic.id)}
              toggleSelected={toggleSelected}
              availableTopicsQuery={availableTopicsQuery}
            />
          ))}
        </TableBody>
      </Table>
    </ScrollAreaInfinite>
  );
}

export function ManageTopicsListCard(props: TManageTopicsListCardProps) {
  const { handleAddTopic, availableTopicsQuery } = props;
  const { manageScope } = useManageTopicsStore();
  const namespace = topicsNamespaces[manageScope];
  const t = useT();
  const [selectedTopics, setSelectedTopics] = React.useState<Set<TTopicId>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const queryClient = useQueryClient();

  const { refetch, isFetched, isRefetching, isLoading } = availableTopicsQuery;

  const { isInited: isFiltersInited, isPending: isFiltersPending } = useTopicsFiltersContext();

  const isDataInited = isFetched && isFiltersInited;

  const isDataLoading = isRefetching || isLoading || isFiltersPending;

  const goBack = useGoBack(rootAliasRoute);

  const handleReload = React.useCallback(() => {
    refetch({ cancelRefetch: true });
  }, [refetch]);

  const deleteSelectedMutation = useMutation({
    mutationFn: deleteTopics,
    onSuccess: () => {
      const selectedIds = Array.from(selectedTopics);
      selectedIds.forEach((topicId) => {
        availableTopicsQuery.deleteTopic(topicId);
      });
      const invalidatePrefixes = [
        // Invalidate all the other topic related queries
        '["available-topic',
      ].map(makeQueryKeyPrefix);
      invalidateKeysByPrefixes(queryClient, invalidatePrefixes, [availableTopicsQuery.queryKey]);
      setSelectedTopics(new Set());
    },
    onError: (error) => {
      const details = error instanceof APIError ? error.details : null;
      const message = t('ManageTopicsListCard.CannotDeleteSelectedTopics');
      // eslint-disable-next-line no-console
      console.error('[ManageTopicsListCard:deleteSelectedMutation]', message, {
        details,
        error,
        selectedTopics: Array.from(selectedTopics),
      });
      debugger; // eslint-disable-line no-debugger
      toast.error(message);
    },
  });

  const handleDeleteSelected = React.useCallback(() => {
    const selectedIds = Array.from(selectedTopics);
    if (selectedIds.length === 0) return;

    const promise = deleteSelectedMutation.mutateAsync(selectedIds);
    toast.promise(promise, {
      loading: t('ManageTopicsListCard.DeletingSelectedTopics'),
      success: t('ManageTopicsListCard.SuccessfullyDeletedSelectedTopics'),
      error: t('ManageTopicsListCard.CannotDeleteSelectedTopics'),
    });
    setShowDeleteConfirm(false);
  }, [selectedTopics, deleteSelectedMutation, t]);

  const handleShowDeleteConfirm = React.useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleHideDeleteConfirm = React.useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  const makeSelectedPublicMutation = useMutation({
    mutationFn: async (topicIds: TTopicId[]) => {
      const topics = availableTopicsQuery.allTopics.filter((topic) => topicIds.includes(topic.id));
      await Promise.all(topics.map((topic) => updateTopic({ ...topic, isPublic: true })));
      return topics;
    },
    onSuccess: (topics) => {
      topics.forEach((topic) => {
        availableTopicsQuery.updateTopic({ ...topic, isPublic: true });
      });
      const invalidatePrefixes = [['available-topics']].map(makeQueryKeyPrefix);
      invalidateKeysByPrefixes(queryClient, invalidatePrefixes, [availableTopicsQuery.queryKey]);
      setSelectedTopics(new Set());
    },
    onError: (error) => {
      const message = t('ManageTopicsListCard.CannotMakeSelectedTopicsPublic');
      // eslint-disable-next-line no-console
      console.error('[ManageTopicsListCard:makeSelectedPublicMutation]', message, {
        error,
      });
      debugger; // eslint-disable-line no-debugger
      toast.error(message);
    },
  });

  const resetSelectedPublicMutation = useMutation({
    mutationFn: async (topicIds: TTopicId[]) => {
      const topics = availableTopicsQuery.allTopics.filter((topic) => topicIds.includes(topic.id));
      await Promise.all(topics.map((topic) => updateTopic({ ...topic, isPublic: false })));
      return topics;
    },
    onSuccess: (topics) => {
      topics.forEach((topic) => {
        availableTopicsQuery.updateTopic({ ...topic, isPublic: false });
      });
      const invalidatePrefixes = [['available-topics']].map(makeQueryKeyPrefix);
      invalidateKeysByPrefixes(queryClient, invalidatePrefixes, [availableTopicsQuery.queryKey]);
      setSelectedTopics(new Set());
    },
    onError: (error) => {
      const message = t('ManageTopicsListCard.CannotResetPublicStatusForSelectedTopics');
      // eslint-disable-next-line no-console
      console.error('[ManageTopicsListCard:resetSelectedPublicMutation]', message, {
        error,
      });
      debugger; // eslint-disable-line no-debugger
      toast.error(message);
    },
  });

  const handleMakeSelectedPublic = React.useCallback(() => {
    const selectedIds = Array.from(selectedTopics);
    if (selectedIds.length === 0) return;
    const promise = makeSelectedPublicMutation.mutateAsync(selectedIds);
    toast.promise(promise, {
      loading: t('ManageTopicsListCard.MakingSelectedTopicsPublic'),
      success: t('ManageTopicsListCard.SuccessfullyMadeSelectedTopicsPublic'),
      error: t('ManageTopicsListCard.CannotMakeSelectedTopicsPublic'),
    });
  }, [selectedTopics, makeSelectedPublicMutation, t]);

  const handleResetSelectedPublic = React.useCallback(() => {
    const selectedIds = Array.from(selectedTopics);
    if (selectedIds.length === 0) return;
    const promise = resetSelectedPublicMutation.mutateAsync(selectedIds);
    toast.promise(promise, {
      loading: t('ManageTopicsListCard.ResettingPublicStatusForSelectedTopics'),
      success: t('ManageTopicsListCard.SuccessfullyResetPublicStatusForSelectedTopics'),
      error: t('ManageTopicsListCard.CannotResetPublicStatusForSelectedTopics'),
    });
  }, [selectedTopics, resetSelectedPublicMutation, t]);

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
        content: t('ManageTopicsListCard.Reload'),
        icon: Icons.Refresh,
        visibleFor: 'lg',
        pending: isRefetching,
        onClick: handleReload,
      },
      {
        id: 'Mark Public',
        content: t('ManageTopicsListCard.MarkSelectedAsPublic'),
        icon: Icons.Eye,
        hidden: !selectedTopics.size,
        pending: makeSelectedPublicMutation.isPending,
        onClick: handleMakeSelectedPublic,
      },
      {
        id: 'Mark Private',
        content: t('ManageTopicsListCard.MarkSelectedAsPrivate'),
        icon: Icons.EyeOff,
        hidden: !selectedTopics.size,
        pending: resetSelectedPublicMutation.isPending,
        onClick: handleResetSelectedPublic,
      },
      {
        id: 'Delete Selected',
        content: t('ManageTopicsListCard.DeleteSelected'),
        icon: Icons.Trash,
        hidden: !selectedTopics.size,
        pending: deleteSelectedMutation.isPending,
        onClick: handleShowDeleteConfirm,
      },
      {
        id: 'Add',
        content: t('ManageTopicsListCard.AddNewTopic'),
        icon: Icons.Add,
        visibleFor: 'md',
        onClick: handleAddTopic,
      },
    ],
    [
      t,
      goBack,
      handleAddTopic,
      handleReload,
      isRefetching,
      selectedTopics.size,
      makeSelectedPublicMutation.isPending,
      handleMakeSelectedPublic,
      resetSelectedPublicMutation.isPending,
      handleResetSelectedPublic,
      deleteSelectedMutation.isPending,
      handleShowDeleteConfirm,
    ],
  );

  return (
    <>
      <DashboardHeader
        heading={t(`Pages.${namespace}Title`)}
        className={cn(
          isDev && '__ManageTopicsListCard_DashboardHeader', // DEBUG
          'mx-6',
        )}
        // breadcrumbs={breadcrumbs}
        actions={actions}
      />
      <AvailableTopicsFilters
        className={cn(
          isDev && '__ManageTopicsListCard_Filters', // DEBUG
          'mx-6 transition',
          isFiltersPending && 'opacity-50',
        )}
      />
      {isDataInited ? (
        <TopicsTableContent
          {...props}
          className={cn(
            isDev && '__ManageTopicsListCard_CardContent', // DEBUG
            'flex flex-col flex-wrap items-start',
            'overflow-hidden rounded-md transition',
            isDataLoading && 'opacity-50',
          )}
          goBack={goBack}
          selectedTopics={selectedTopics}
          setSelectedTopics={setSelectedTopics}
        />
      ) : (
        <ContentSkeletonTable className="px-6" />
      )}
      <ConfirmModal
        dialogTitle={t('ManageTopicsListCard.ConfirmDeleteTopics')}
        confirmButtonVariant="destructive"
        confirmButtonText={t('ManageTopicsListCard.Delete')}
        confirmButtonBusyText={t('ManageTopicsListCard.Deleting')}
        cancelButtonText={t('Cancel')}
        handleClose={handleHideDeleteConfirm}
        handleConfirm={handleDeleteSelected}
        isPending={deleteSelectedMutation.isPending}
        isVisible={showDeleteConfirm}
      >
        {t('ManageTopicsListCard.ConfirmDeleteTopicsMessage', {
          count: selectedTopics.size,
        })}
      </ConfirmModal>
    </>
  );
}
