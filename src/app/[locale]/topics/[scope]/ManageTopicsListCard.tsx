import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import { APIError } from '@/lib/types/api';
import { invalidateKeysByPrefixes, makeQueryKeyPrefix } from '@/lib/helpers/react-query';
import { getAbcHashString, getRandomHashString, truncateString } from '@/lib/helpers/strings';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Link } from '@/i18n/routing';
import { TCachedUsers, useCachedUsersForTopics } from '@/hooks/topics/useCachedUsersForTopics';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { ScrollAreaInfinite } from '@/components/ui/ScrollAreaInfinite';
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
import { useSignInModalContext } from '@/components/modals';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { PageEmpty } from '@/components/pages/shared';
import { LanguageName } from '@/components/shared';
import * as Icons from '@/components/shared/Icons';
import { PageError } from '@/components/shared/PageError';
import { myTopicsRoute, rootAliasRoute, TRoutePath, welcomeAliasRoute } from '@/config';
import { isDev } from '@/constants';
import { TopicsManageScopeIds, topicsNamespaces } from '@/contexts/TopicsContext';
import { useTopicsFiltersContext } from '@/contexts/TopicsFiltersContext';
import { PlainCategoriesListByCategoryIds } from '@/features/categories/components';
import { getUpdateTopicFromBroaderData } from '@/features/topics';
import { deleteTopics, updateTopic } from '@/features/topics/actions';
import { AvailableTopicsFilters } from '@/features/topics/components/AvailableTopicsFilters';
import { TAvailableTopic, TTopicId } from '@/features/topics/types';
import { SmallUserBlock } from '@/features/users';
import { useAvailableTopicsByScope, useGoBack } from '@/hooks';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

import { ContentSkeletonTable } from './ContentSkeleton';

const sessionSaveScrollHash = getRandomHashString();

const truncateLongTextsTo = 200;

interface TManageTopicsListCardProps {
  // handleDeleteTopic: (topicId: TTopicId, from: string) => void;
  // handleEditTopic: (topicId: TTopicId) => void;
  // handleEditQuestions: (topicId: TTopicId) => void;
  handleAddTopic: () => void;
  availableTopicsQuery: ReturnType<typeof useAvailableTopicsByScope>;
}
interface TTopicsTableContentProps extends TManageTopicsListCardProps {
  className?: string;
  goBack: () => void;
  selectedTopics: Set<TTopicId>;
  setSelectedTopics: React.Dispatch<React.SetStateAction<Set<TTopicId>>>;
}

type TMemo = { allTopics: TAvailableTopic[] };

const useDarkHeader = true;

function AddTopicBlock() {
  const t = useT();
  const addTopicRoute = `${myTopicsRoute}/add` as TRoutePath;
  const { showSignInModal } = useSignInModalContext();
  const {
    data: sessionData,
    // status: sessionStatus,
  } = useSession();
  const user = sessionData?.user;
  // const isAdmin = user?.role === 'ADMIN';

  return user?.id ? (
    <div className="flex items-center justify-center">
      <Link
        href={addTopicRoute}
        className={cn(buttonVariants({ variant: 'theme' }), 'flex w-full gap-2')}
      >
        <Icons.Plus className="size-5" />
        {t('AddNewTopic')}
      </Link>
    </div>
  ) : (
    <div
      className={cn(
        isDev && '__AvailableTopicsList_Info', // DEBUG
        'flex items-center gap-2 rounded-md border border-theme/10 p-2',
      )}
    >
      <Icons.Info className="size-6 flex-shrink-0 text-theme" />
      <p className="content-text flex-1 text-sm">
        {t.rich('UnauthorizedUsersCantAddTopicMessage', {
          SigninLink: (chunks) => (
            <Link
              onClick={(ev) => {
                ev.preventDefault();
                showSignInModal();
              }}
              href={welcomeAliasRoute}
            >
              {chunks}
            </Link>
          ),
        })}
      </p>
    </div>
  );
}

function TopicsTableHeader({
  isAdminMode,
  selectedTopics,
  allTopics,
  toggleAll,
}: {
  isAdminMode: boolean;
  selectedTopics: Set<TTopicId>;
  allTopics: TAvailableTopic[];
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
        <TableHead
          id="no"
          className={cn('truncate text-right max-lg:hidden', isDev && 'debug-border')}
        >
          {t('NN')}
        </TableHead>
        {/*isDev && (
          <TableHead id="topicId" className="truncate max-xl:hidden">
            ID
          </TableHead>
          )*/}
        <TableHead id="name" className="truncate">
          {t('TopicName')}
        </TableHead>
        <TableHead id="categories" className="truncate max-md:hidden">
          {t('Categories')}
        </TableHead>
        <TableHead id="questions" className="truncate max-md:hidden">
          {t('Questions')}
        </TableHead>
        {isAdminMode && (
          <TableHead id="topicUser" className="truncate max-lg:hidden">
            {t('Author')}
          </TableHead>
        )}
        <TableHead id="language" className="truncate max-xl:hidden">
          {t('Language')}
        </TableHead>
        <TableHead id="keywords" className="truncate max-xl:hidden">
          {t('Keywords')}
        </TableHead>
        <TableHead id="isPublic" className="truncate max-md:hidden">
          {t('ManageTopicsListCard.Public')}
        </TableHead>
        <TableHead id="Actions"></TableHead>
      </TableRow>
    </TableHeader>
  );
}

interface TTopicsTableRowProps {
  topic: TAvailableTopic;
  idx: number;
  // handleDeleteTopic: TManageTopicsListCardProps['handleDeleteTopic'];
  // handleEditTopic: TManageTopicsListCardProps['handleEditTopic'];
  // handleEditQuestions: TManageTopicsListCardProps['handleEditQuestions'];
  isAdminMode: boolean;
  cachedUsers: TCachedUsers;
  isSelected: boolean;
  toggleSelected: (topicId: TTopicId) => void;
  availableTopicsQuery: ReturnType<typeof useAvailableTopicsByScope>;
}

function TopicsTableRow(props: TTopicsTableRowProps) {
  const {
    topic,
    // handleDeleteTopic\|handleEditTopic\|handleEditQuestions
    isAdminMode,
    cachedUsers,
    idx,
    isSelected,
    toggleSelected,
    availableTopicsQuery,
  } = props;
  const { id, name, langCode, langName, keywords, userId, _count, isPublic, categories } = topic;
  const t = useT();

  const [isPending, startTransition] = React.useTransition();
  const queryClient = useQueryClient();

  const updateAndInvalidateTopic = React.useCallback(
    async (updatedTopic: TAvailableTopic) => {
      // Extract only the fields needed for updateTopic
      const {
        id,
        name,
        description,
        isPublic,
        keywords,
        langCode,
        langName,
        langCustom,
        answersCountRandom,
        answersCountMin,
        answersCountMax,
      } = updatedTopic;
      await updateTopic({
        id,
        name,
        description,
        isPublic,
        keywords,
        langCode,
        langName,
        langCustom,
        answersCountRandom,
        answersCountMin,
        answersCountMax,
      });
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
            topicId: id,
          });
          debugger; // eslint-disable-line no-debugger
          toast.error(message);
        }
      });
    },
    [topic, updateAndInvalidateTopic, t, id],
  );

  const questionsCount = _count?.questions;
  const topicUser = isAdminMode ? cachedUsers[userId] : undefined;

  const categoryIds = categories?.map(({ id }) => id);

  const { manageScope } = useManageTopicsStore();
  const topicsListRoutePath = `/topics/${manageScope}`;

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
      {/*isDev && (
        <TableCell id="topicId" className="truncate max-xl:hidden" title={id}>
          <div className="truncate opacity-50">
            <span className="mr-[2px] opacity-30">#</span>
            {id}
          </div>
        </TableCell>
        )*/}
      <TableCell id="name" className="truncate">
        <Link
          className="text-ellipsis whitespace-normal hover:underline"
          href={`${topicsListRoutePath}/${id}` as TRoutePath}
        >
          {truncateString(name, truncateLongTextsTo)}
        </Link>
      </TableCell>
      <TableCell id="categories" className="truncate max-md:hidden">
        <PlainCategoriesListByCategoryIds categoryIds={categoryIds} />
      </TableCell>
      <TableCell id="questions" className="truncate max-md:hidden">
        <div className="truncate">
          {questionsCount ? (
            <span className="font-medium">{questionsCount}</span>
          ) : (
            <span className="opacity-30">—</span>
          )}
        </div>
      </TableCell>
      {isAdminMode && (
        <TableCell id="topicUser" className="truncate max-lg:hidden">
          <SmallUserBlock isLoading={!topicUser} user={topicUser} />
        </TableCell>
      )}
      <TableCell id="language" className="truncate max-xl:hidden">
        <div className="truncate">
          <LanguageName langCode={langCode} langName={langName} />
        </div>
      </TableCell>
      <TableCell id="keywords" className="truncate max-xl:hidden">
        <div className="truncate">{keywords}</div>
      </TableCell>
      <TableCell id="isPublic" className="max-md:hidden">
        <Switch
          checked={isPublic || false}
          onCheckedChange={handleTogglePublic}
          disabled={isPending}
        />
      </TableCell>
      <TableCell id="Actions" className="truncate text-right">
        <div className="flex justify-end gap-1 truncate">
          <Link
            href={`${topicsListRoutePath}/${topic.id}/questions` as TRoutePath}
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-9 shrink-0')}
            aria-label={t('ManageTopicsListCard.EditQuestions')}
            title={t('ManageTopicsListCard.EditQuestions')}
          >
            <Icons.Questions className="size-5" />
          </Link>
          <Link
            href={`${topicsListRoutePath}/${topic.id}/edit` as TRoutePath}
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-9 shrink-0')}
            aria-label={t('ManageTopicsListCard.Edit')}
            title={t('ManageTopicsListCard.Edit')}
          >
            <Icons.Edit className="size-4" />
          </Link>
          <Link
            href={
              `${topicsListRoutePath}/delete?topicId=${topic.id}&from=ManageTopicsListCard` as TRoutePath
            }
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-9 shrink-0')}
            aria-label={t('ManageTopicsListCard.Delete')}
            title={t('ManageTopicsListCard.Delete')}
          >
            <Icons.Trash className="size-4 text-destructive" />
          </Link>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function TopicsTableContent(props: TTopicsTableContentProps) {
  const {
    className,
    // handleDeleteTopic,
    // handleEditTopic,
    // handleEditQuestions,
    // handleAddTopic,
    availableTopicsQuery,
    goBack,
    selectedTopics,
    setSelectedTopics,
  } = props;
  const { manageScope } = useManageTopicsStore();
  const t = useT();
  const isAdminMode = manageScope === TopicsManageScopeIds.ALL_TOPICS; // || user?.role === 'ADMIN';

  const topicsListRoutePath = `/topics/${manageScope}`;

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
              <Button
                variant="ghost"
                onClick={goBack}
                className="content-truncate flex items-center gap-2"
              >
                <Icons.ArrowLeft className="hidden size-4 opacity-50 sm:flex" />
                <span className="truncate">{t('GoBack')}</span>
              </Button>
              {!isFiltersExpanded && (
                <Button
                  variant="outline"
                  onClick={expandFilters}
                  className="content-truncate flex items-center gap-2"
                >
                  <Icons.Settings2 className="hidden size-4 opacity-50 sm:flex" />
                  <span className="truncate">{t('ChangeFilters')}</span>
                </Button>
              )}
              <Link
                href={`${topicsListRoutePath}/add` as TRoutePath}
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'content-truncate flex items-center gap-2',
                )}
              >
                <Icons.Topics className="hidden size-4 opacity-50 sm:flex" />
                <span className="truncate">{t('AddTopic')}</span>
              </Link>
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
      <Table className="w-full table-fixed">
        <colgroup>
          <col id="select" className="w-10" />
          <col id="no" className="w-14 max-lg:hidden" />
          <col id="name" className="" />
          <col id="categories" className="w-[12%] max-md:hidden" />
          <col id="questions" className="w-16 max-md:hidden" />
          {isAdminMode && <col id="topicUser" className="w-[8%] max-lg:hidden" />}
          <col id="language" className="w-[8%] max-xl:hidden" />
          <col id="keywords" className="w-[8%] max-xl:hidden" />
          <col id="isPublic" className="w-24 max-md:hidden" />
          <col id="Actions" />
        </colgroup>
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
              // handleDeleteTopic={handleDeleteTopic}
              // handleEditTopic={handleEditTopic}
              // handleEditQuestions={handleEditQuestions}
              isAdminMode={isAdminMode}
              cachedUsers={cachedUsers}
              isSelected={selectedTopics.has(topic.id)}
              toggleSelected={toggleSelected}
              availableTopicsQuery={availableTopicsQuery}
            />
          ))}
        </TableBody>
      </Table>
      <AddTopicBlock />
    </ScrollAreaInfinite>
  );
}

export function ManageTopicsListCard(props: TManageTopicsListCardProps) {
  const { availableTopicsQuery } = props;
  const { manageScope } = useManageTopicsStore();
  const namespace = topicsNamespaces[manageScope];
  const t = useT();
  const [selectedTopics, setSelectedTopics] = React.useState<Set<TTopicId>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const queryClient = useQueryClient();

  const topicsListRoutePath = `/topics/${manageScope}`;
  // const topicRoutePath = `${topicsListRoutePath}/${topicId}`;
  // const questionsListRoutePath = `${topicRoutePath}/questions`;
  // const questionRoutePath = `${questionsListRoutePath}/${questionId}`;
  // const answersListRoutePath = `${questionRoutePath}/answers`;
  // const answerRoutePath = `${answersListRoutePath}/${answerId}`;

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
      await Promise.all(
        topics.map((topic) =>
          updateTopic(getUpdateTopicFromBroaderData({ ...topic, isPublic: true })),
        ),
      );
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
      await Promise.all(
        topics.map((topic) =>
          updateTopic(getUpdateTopicFromBroaderData({ ...topic, isPublic: false })),
        ),
      );
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
        content: t('Reload'),
        icon: Icons.Refresh,
        visibleFor: 'lg',
        pending: isRefetching,
        onClick: handleReload,
      },
      {
        id: 'MarkSelectedAsPublic',
        content: t('ManageTopicsListCard.MarkSelectedAsPublic'),
        icon: Icons.Eye,
        hidden: !selectedTopics.size,
        pending: makeSelectedPublicMutation.isPending,
        onClick: handleMakeSelectedPublic,
      },
      {
        id: 'MarkSelectedAsPrivate',
        content: t('ManageTopicsListCard.MarkSelectedAsPrivate'),
        icon: Icons.EyeOff,
        hidden: !selectedTopics.size,
        pending: resetSelectedPublicMutation.isPending,
        onClick: handleResetSelectedPublic,
      },
      {
        id: 'DeleteSelected',
        content: t('ManageTopicsListCard.DeleteSelected'),
        icon: Icons.Trash,
        hidden: !selectedTopics.size,
        pending: deleteSelectedMutation.isPending,
        onClick: handleShowDeleteConfirm,
      },
      {
        id: 'AAddNewTopicd',
        content: t('AddNewTopic'),
        icon: Icons.Add,
        visibleFor: 'md',
        href: `${topicsListRoutePath}/add`,
      },
    ],
    [
      t,
      goBack,
      handleReload,
      isRefetching,
      selectedTopics.size,
      makeSelectedPublicMutation.isPending,
      handleMakeSelectedPublic,
      resetSelectedPublicMutation.isPending,
      handleResetSelectedPublic,
      deleteSelectedMutation.isPending,
      handleShowDeleteConfirm,
      topicsListRoutePath,
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
