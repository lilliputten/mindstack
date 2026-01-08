'use client';

import React from 'react';
import { toast } from 'sonner';

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
import { useT } from '@/i18n';

// import { useManageCategoriesStore } from '@/stores/ManageCategoriesStoreProvider';

import { ContentSkeleton } from './ContentSkeleton';
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
  // isFetched?: boolean;
}

export function ManageCategoriesPageModalsWrapper(props: TCategoriesListProps) {
  const memo = React.useMemo<TMemo>(() => ({}), []);
  const { showAddModal, deleteCategoryId, editCategoryId, editTopicsCategoryId, from } = props;
  // const { manageScope } = useManageCategoriesStore();
  // const isOnlyMy = manageScope === CategoriesManageScopeIds.MY_CATEGORIES;
  const routePath = manageCategoriesRoute; // `/categories/${manageScope}`;
  memo.routePath = routePath;

  const t = useT();

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
  // memo.isFetched = isFetched;
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
      const { allCategories, routePath } = memo;
      if (allCategories && routePath) {
        const hasCategory = allCategories.find(({ id }) => id === categoryId);
        if (hasCategory) {
          const url = `${routePath}/delete?categoryId=${categoryId}&from=${from}`;
          goToTheRoute(url);
        } else {
          toast.error(t('ManageCategoriesPageModalsWrapper.RequestedCategoryNotExists'));
          goToTheRoute(routePath, true);
        }
      }
    },
    [memo, goToTheRoute, t],
  );
  React.useEffect(() => {
    if (deleteCategoryId && isFetched) {
      /* // UNUSED: Prevent opening the delete category midal with a browser url (but not with a programmatic router redirect)
       * if (from?.startsWith('SERVER:')) {
       *   // eslint-disable-next-line no-console
       *   console.warn('No url-invoked category deletions allowed!');
       *   router.replace(routePath);
       * } else {
       */
      openDeleteCategoryModal(
        deleteCategoryId,
        from || 'Unknown_in_ManageCategoriesPageModalsWrapper',
      );
    }
  }, [deleteCategoryId, openDeleteCategoryModal, from, isFetched]);

  // Edit Category Card
  const openEditCategoryCard = React.useCallback(
    (categoryId: TCategoryId) => {
      const { allCategories, routePath } = memo;
      if (allCategories && routePath) {
        const hasCategory = allCategories.find(({ id }) => id === categoryId);
        if (hasCategory) {
          const url = `${routePath}/${categoryId}/edit`;
          goToTheRoute(url);
        } else {
          toast.error(t('ManageCategoriesPageModalsWrapper.RequestedCategoryNotExists'));
          goToTheRoute(routePath, true);
        }
      }
    },
    [memo, goToTheRoute, t],
  );
  React.useEffect(() => {
    if (editCategoryId && isFetched) {
      openEditCategoryCard(editCategoryId);
    }
  }, [editCategoryId, openEditCategoryCard, isFetched]);

  // Edit Topics Page
  const openEditTopicsPage = React.useCallback(
    (categoryId: TCategoryId) => {
      const { allCategories, routePath } = memo;
      if (allCategories && routePath) {
        const hasCategory = allCategories.find(({ id }) => id === categoryId);
        if (hasCategory) {
          const url = `${routePath}/${categoryId}/topics`;
          goToTheRoute(url);
        } else {
          toast.error(t('ManageCategoriesPageModalsWrapper.RequestedCategoryNotExists'));
          goToTheRoute(routePath, true);
        }
      }
    },
    [memo, goToTheRoute, t],
  );

  React.useEffect(() => {
    // Use another id (`editTopicsCategoryId`)?
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
        handleDeleteCategory={openDeleteCategoryModal}
        handleEditCategory={openEditCategoryCard}
        handleEditTopics={openEditTopicsPage}
        handleAddCategory={openAddCategoryModal}
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
