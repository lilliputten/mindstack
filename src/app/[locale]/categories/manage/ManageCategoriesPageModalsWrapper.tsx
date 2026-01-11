'use client';

import React from 'react';

import { manageCategoriesRoute } from '@/config';
import { useAvailableCategories } from '@/features/categories/query-hooks/useAvailableCategories';
/* // TODO: Filters
 * import {
 *   convertAvailableFiltersToParams,
 *   TApplyFiltersData,
 *   TAvailableCategoriesFiltersParams,
 *   CategoriesFiltersProvider,
 * } from '@/contexts/CategoriesFiltersContext';
 */
import { TAvailableCategory, TCategoryId } from '@/features/categories/types';
import { useGoToTheRoute } from '@/hooks';

import { ManageCategoriesList } from './ManageCategoriesList';

interface TCategoriesListProps {
  showAddModal?: boolean;
  deleteCategoryId?: TCategoryId;
  editCategoryId?: TCategoryId;
  editTopicsCategoryId?: TCategoryId;
  from?: string;
}

interface TMemo {
  allCategories?: TAvailableCategory[];
  routePath?: string;
}

export function ManageCategoriesPageModalsWrapper(props: TCategoriesListProps) {
  const memo = React.useMemo<TMemo>(() => ({}), []);
  const { showAddModal, deleteCategoryId, editCategoryId, editTopicsCategoryId, from } = props;
  const routePath = manageCategoriesRoute; // `/categories/${manageScope}`;
  memo.routePath = routePath;

  /* // TODO: Filters
  const [filtersParams, setFiltersParams] = React.useState<
    TAvailableCategoriesFiltersParams | undefined
  >();
  */

  const availableCategoriesQuery = useAvailableCategories({
    /* // TODO: Filters
     * enabled: !!filtersParams,
     * showOnlyMyCategories: isOnlyMy,
     * ...filtersParams,
     */
  });
  const {
    allCategories,
    isFetched,
    /* // TODO: Filters
     * queryClient,
     * queryKey,
     */
  } = availableCategoriesQuery;
  memo.allCategories = allCategories;

  const goToTheRoute = useGoToTheRoute();

  // Add Category Modal
  const openAddCategoryModal = React.useCallback(() => {
    const { routePath } = memo;
    if (routePath) {
      const url = `${routePath}/add`;
      goToTheRoute(url);
    }
  }, [memo, goToTheRoute]);
  React.useEffect(() => {
    if (showAddModal) {
      openAddCategoryModal();
    }
  }, [showAddModal, openAddCategoryModal]);

  // Delete Category Modal
  const openDeleteCategoryModal = React.useCallback(
    (categoryId: TCategoryId, from: string) => {
      const url = `${routePath}/delete?categoryId=${categoryId}&from=${from}`;
      goToTheRoute(url);
    },
    [goToTheRoute, routePath],
  );
  React.useEffect(() => {
    if (deleteCategoryId && isFetched) {
      openDeleteCategoryModal(
        deleteCategoryId,
        from || 'Unknown_in_ManageCategorysPageModalsWrapper',
      );
    }
  }, [deleteCategoryId, openDeleteCategoryModal, from, isFetched]);

  // Edit Category Card
  const openEditCategoryModal = React.useCallback(
    (categoryId: TCategoryId, from: string) => {
      const url = `${routePath}/edit?categoryId=${categoryId}&from=${from}`;
      goToTheRoute(url);
    },
    [routePath, goToTheRoute],
  );
  React.useEffect(() => {
    if (editCategoryId && isFetched) {
      openEditCategoryModal(editCategoryId, from || 'Unknown_in_ManageCategorysPageModalsWrapper');
    }
  }, [editCategoryId, openEditCategoryModal, from, isFetched]);

  // Edit Topics Page
  const openEditTopicsPage = React.useCallback(
    (categoryId: TCategoryId) => {
      const url = `${routePath}/${categoryId}/topics`;
      goToTheRoute(url);
    },
    [routePath, goToTheRoute],
  );
  React.useEffect(() => {
    // Use another id (`editQuestionsCategoryId`)?
    if (editTopicsCategoryId) {
      openEditTopicsPage(editTopicsCategoryId);
    }
  }, [editTopicsCategoryId, openEditTopicsPage]);

  /* // TODO: Filters
  const applyFilters = React.useCallback(
    async (filtersData: TApplyFiltersData) => {
      const filtersParams = convertAvailableFiltersToParams(filtersData);
      setFiltersParams(filtersParams);
      queryClient.removeQueries({ queryKey });
    },
    [queryClient, queryKey],
  );
  */

  return (
    <>
      {/* // TODO: Filters
      <TopicsFiltersProvider
        storeId={`manage-topics-filters-${manageScope}`}
        applyFilters={applyFilters}
        // ignoreOnlyMy={isOnlyMy}
      >
      {filtersParams ? (
      */}
      <ManageCategoriesList
        // handleDeleteCategory={openDeleteCategoryModal}
        // handleEditCategory={openEditCategoryModal}
        // handleEditTopics={openEditTopicsPage}
        // handleAddCategory={openAddCategoryModal}
        availableCategoriesQuery={availableCategoriesQuery}
      />
      {/*
      ) : (
        <ContentSkeleton className="px-6 py-0" />
      )}
      </TopicsFiltersProvider>
      */}
    </>
  );
}
