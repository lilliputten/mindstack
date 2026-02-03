'use client';

import React from 'react';

import { TopicsManageScopeIds } from '@/contexts/TopicsContext';
import {
  convertAvailableFiltersToParams,
  TApplyFiltersData,
  TAvailableTopicsFiltersParams,
  TopicsFiltersProvider,
} from '@/contexts/TopicsFiltersContext';
import { TAvailableTopic, TTopicId } from '@/features/topics/types';
import { useAvailableTopicsByScope, useGoToTheRoute } from '@/hooks';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

import { ContentSkeleton } from './ContentSkeleton';
import { ManageTopicsListCard } from './ManageTopicsListCard';

interface TTopicsListProps {
  showAddModal?: boolean;
  deleteTopicId?: TTopicId;
  editTopicId?: TTopicId;
  editQuestionsTopicId?: TTopicId;
  from?: string;
}

interface TMemo {
  allTopics?: TAvailableTopic[];
  routePath?: string;
}

export function ManageTopicsPageModalsWrapper(props: TTopicsListProps) {
  const memo = React.useMemo<TMemo>(() => ({}), []);
  const { showAddModal, deleteTopicId, editTopicId, editQuestionsTopicId, from } = props;
  const { manageScope } = useManageTopicsStore();
  const isOnlyMy = manageScope === TopicsManageScopeIds.MY_TOPICS;
  const routePath = `/topics/${manageScope}`;

  const [filtersParams, setFiltersParams] = React.useState<
    TAvailableTopicsFiltersParams | undefined
  >();

  const availableTopicsQuery = useAvailableTopicsByScope({
    manageScope,
    enabled: !!filtersParams,
    showOnlyMyTopics: isOnlyMy,
    ...filtersParams,
  });
  const { allTopics, isFetched, queryClient, queryKey } = availableTopicsQuery;
  memo.routePath = routePath;
  memo.allTopics = allTopics;

  const goToTheRoute = useGoToTheRoute();

  // Add Topic Modal
  const openAddTopicModal = React.useCallback(() => {
    const { routePath } = memo;
    if (routePath) {
      const url = `${routePath}/add`;
      goToTheRoute(url);
    }
  }, [memo, goToTheRoute]);
  React.useEffect(() => {
    if (showAddModal) {
      openAddTopicModal();
    }
  }, [showAddModal, openAddTopicModal]);

  // Delete Topic Modal
  const openDeleteTopicModal = React.useCallback(
    (topicId: TTopicId, from: string) => {
      const url = `${routePath}/delete?topicId=${topicId}&from=${from}`;
      goToTheRoute(url);
    },
    [routePath, goToTheRoute],
  );
  React.useEffect(() => {
    if (deleteTopicId && isFetched) {
      /* // UNUSED: Prevent opening the delete topic modal with a browser url (but not with a programmatic router redirect)
       * if (from?.startsWith('SERVER:')) {
       *   // eslint-disable-next-line no-console
       *   console.warn('No url-invoked topic deletions allowed!');
       *   router.replace(routePath);
       * } else {
       */
      openDeleteTopicModal(deleteTopicId, from || 'Unknown_in_ManageTopicsPageModalsWrapper');
    }
  }, [deleteTopicId, openDeleteTopicModal, from, isFetched]);

  // Edit Topic Card
  const openEditTopicCard = React.useCallback(
    (topicId: TTopicId) => {
      const url = `${routePath}/${topicId}/edit`;
      goToTheRoute(url);
    },
    [routePath, goToTheRoute],
  );
  React.useEffect(() => {
    if (editTopicId && isFetched) {
      openEditTopicCard(editTopicId);
    }
  }, [editTopicId, openEditTopicCard, isFetched]);

  // Edit Questions Page
  const openEditQuestionsPage = React.useCallback(
    (topicId: TTopicId) => {
      const url = `${routePath}/${topicId}/questions`;
      goToTheRoute(url);
    },
    [routePath, goToTheRoute],
  );
  React.useEffect(() => {
    // Use another id (`editQuestionsTopicId`)?
    if (editQuestionsTopicId) {
      openEditQuestionsPage(editQuestionsTopicId);
    }
  }, [editQuestionsTopicId, openEditQuestionsPage]);

  const applyFilters = React.useCallback(
    async (filtersData: TApplyFiltersData) => {
      const filtersParams = convertAvailableFiltersToParams(filtersData);
      setFiltersParams(filtersParams);
      queryClient.removeQueries({ queryKey });
    },
    [queryClient, queryKey],
  );

  return (
    <TopicsFiltersProvider
      storeId={`manage-topics-filters-${manageScope}`}
      applyFilters={applyFilters}
      ignoreOnlyMy={isOnlyMy}
    >
      {filtersParams ? (
        <ManageTopicsListCard
          // handleDeleteTopic={openDeleteTopicModal}
          // handleEditTopic={openEditTopicCard}
          // handleEditQuestions={openEditQuestionsPage}
          handleAddTopic={openAddTopicModal}
          availableTopicsQuery={availableTopicsQuery}
        />
      ) : (
        <ContentSkeleton className="px-6 py-0" />
      )}
    </TopicsFiltersProvider>
  );
}
