'use client';

import React from 'react';

import { TQuestionId } from '@/features/questions/types';
import { TTopicId } from '@/features/topics/types';
import { useGoToTheRoute } from '@/hooks';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

import { ManageTopicQuestionsPageHolder } from './ManageTopicQuestionsPageHolder';

interface TTopicsListProps {
  topicId: TTopicId;
  showAddModal?: boolean;
  // showGenerateModal?: boolean;
  deleteQuestionId?: TQuestionId;
  editQuestionId?: TQuestionId;
  editAnswersQuestionId?: TQuestionId;
}

export function ManageTopicQuestionsPageModalsWrapper(props: TTopicsListProps) {
  const {
    topicId,
    showAddModal,
    // showGenerateModal,
    deleteQuestionId,
    editQuestionId,
    editAnswersQuestionId,
  } = props;

  const { manageScope } = useManageTopicsStore();
  const topicsListRoutePath = `/topics/${manageScope}`;
  const topicRoutePath = `${topicsListRoutePath}/${topicId}`;
  const questionsListRoutePath = `${topicRoutePath}/questions`;

  const goToTheRoute = useGoToTheRoute();

  // Add New Question Modal
  const openAddQuestionModal = React.useCallback(() => {
    goToTheRoute(`${questionsListRoutePath}/add`);
  }, [goToTheRoute, questionsListRoutePath]);
  React.useEffect(() => {
    if (showAddModal) {
      openAddQuestionModal();
    }
  }, [showAddModal, openAddQuestionModal]);

  /*
   * // Generate Questions Modal
   * const openGenerateQuestionsModal = React.useCallback(() => {
   *   goToTheRoute(`${questionsListRoutePath}/generate`);
   * }, [goToTheRoute, questionsListRoutePath]);
   * React.useEffect(() => {
   *   if (showGenerateModal) {
   *     openGenerateQuestionsModal();
   *   }
   * }, [showGenerateModal, openGenerateQuestionsModal]);
   */

  // Delete Question Modal
  const openDeleteQuestionModal = React.useCallback(
    (questionId: TQuestionId) => {
      goToTheRoute(`${questionsListRoutePath}/delete?questionId=${questionId}`);
    },
    [goToTheRoute, questionsListRoutePath],
  );
  React.useEffect(() => {
    if (deleteQuestionId) {
      openDeleteQuestionModal(deleteQuestionId);
    }
  }, [deleteQuestionId, openDeleteQuestionModal]);

  // Edit Question Card
  const openEditQuestionCard = React.useCallback(
    (questionId: TQuestionId) => {
      goToTheRoute(`${questionsListRoutePath}/${questionId}/edit`);
    },
    [goToTheRoute, questionsListRoutePath],
  );
  React.useEffect(() => {
    if (editQuestionId) {
      openEditQuestionCard(editQuestionId);
    }
  }, [editQuestionId, openEditQuestionCard]);

  // Edit Answers Page
  const openEditAnswersPage = React.useCallback(
    (questionId: TQuestionId) => {
      goToTheRoute(`${questionsListRoutePath}/${questionId}/answers`);
    },
    [goToTheRoute, questionsListRoutePath],
  );
  React.useEffect(() => {
    if (editAnswersQuestionId) {
      openEditAnswersPage(editAnswersQuestionId);
    }
  }, [editAnswersQuestionId, openEditAnswersPage]);

  return (
    <ManageTopicQuestionsPageHolder
      topicId={topicId}
      // handleDeleteQuestion={openDeleteQuestionModal}
      // handleEditQuestion={openEditQuestionCard}
      // handleAddQuestion={openAddQuestionModal}
      // handleEditAnswers={openEditAnswersPage}
    />
  );
}
