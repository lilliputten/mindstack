import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { APIError } from '@/lib/types/api';
import { invalidateKeysByPrefixes, makeQueryKeyPrefix } from '@/lib/helpers/react-query';
import { getAbcHashString, getRandomHashString, truncateString } from '@/lib/helpers/strings';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
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
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { PageEmpty } from '@/components/pages/shared';
import * as Icons from '@/components/shared/Icons';
import { PageError } from '@/components/shared/PageError';
import { manageCategoriesRoute, rootAliasRoute, TRoutePath } from '@/config';
import { isDev } from '@/constants';
// import { useCategoriesFiltersContext } from '@/contexts/CategoriesFiltersContext';
import { deleteCategories, updateCategory } from '@/features/categories/actions';
import { useAvailableCategories } from '@/features/categories/query-hooks/useAvailableCategories';
// import { AvailableCategoriesFilters } from '@/features/categories/components/AvailableCategoriesFilters';
import { TAvailableCategory, TCategoryId } from '@/features/categories/types';
import { useGoBack } from '@/hooks';
import { useT } from '@/i18n';
import { Link } from '@/i18n/routing';

// import { useManageCategoriesStore } from '@/stores/ManageCategoriesStoreProvider';

import { ContentSkeletonTable } from './ContentSkeleton';

const sessionSaveScrollHash = getRandomHashString();

interface TManageCategoriesListProps {
  handleDeleteCategory: (categoryId: TCategoryId, from: string) => void;
  handleEditCategory: (categoryId: TCategoryId) => void;
  handleEditTopics: (categoryId: TCategoryId) => void;
  handleAddCategory: () => void;
  availableCategoriesQuery: ReturnType<typeof useAvailableCategories>;
}
interface TCategoriesTableContentProps extends TManageCategoriesListProps {
  className?: string;
  goBack: () => void;
  selectedCategories: Set<TCategoryId>;
  setSelectedCategories: React.Dispatch<React.SetStateAction<Set<TCategoryId>>>;
}

type TMemo = { allCategories: TAvailableCategory[] };

const useDarkHeader = true;

function CategoriesTableHeader({
  selectedCategories,
  allCategories,
  toggleAll,
}: {
  // isAdminMode: boolean;
  selectedCategories: Set<TCategoryId>;
  allCategories: TAvailableCategory[];
  toggleAll: () => void;
}) {
  const t = useT();
  const hasSelected = !!selectedCategories.size;
  const isAllSelected =
    allCategories.length > 0 && selectedCategories.size === allCategories.length;
  const isIndeterminate = hasSelected && !isAllSelected;

  return (
    <TableHeader
      className={cn(
        isDev && '__ManageCategoriesList_CategoriesTableHeader_Root', // DEBUG
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
          title={t('ManageCategoriesList.SelectDeselectAll')}
        >
          <Checkbox
            checked={hasSelected}
            aria-label={t('ManageCategoriesList.SelectDeselectAll')}
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
          {t('ManageCategoriesList.No')}
        </TableHead>
        {isDev && (
          <TableHead id="categoryId" className="truncate max-xl:hidden">
            ID
          </TableHead>
        )}
        <TableHead id="name" className="truncate">
          {t('ManageCategoriesList.CategoryName')}
        </TableHead>
        <TableHead id="topics" className="truncate max-lg:hidden">
          {t('ManageCategoriesList.Topics')}
        </TableHead>
        {/*
        {isAdminMode && (
          <TableHead id="categoryUser" className="truncate max-lg:hidden">
            {t('ManageCategoriesList.Author')}
          </TableHead>
          )}
        <TableHead id="language" className="truncate max-xl:hidden">
          {t('ManageCategoriesList.Language')}
        </TableHead>
        <TableHead id="keywords" className="truncate max-xl:hidden">
          {t('ManageCategoriesList.Keywords')}
        </TableHead>
        <TableHead id="isPublic" className="truncate max-lg:hidden">
          {t('ManageCategoriesList.Public')}
        </TableHead>
        */}
        <TableHead id="Actions"></TableHead>
      </TableRow>
    </TableHeader>
  );
}

interface TCategoriesTableRowProps {
  category: TAvailableCategory;
  idx: number;
  handleDeleteCategory: TManageCategoriesListProps['handleDeleteCategory'];
  handleEditCategory: TManageCategoriesListProps['handleEditCategory'];
  handleEditTopics: TManageCategoriesListProps['handleEditTopics'];
  // isAdminMode: boolean;
  // cachedUsers: TCachedUsers;
  isSelected: boolean;
  toggleSelected: (categoryId: TCategoryId) => void;
  availableCategoriesQuery: ReturnType<typeof useAvailableCategories>;
}

function CategoriesTableRow(props: TCategoriesTableRowProps) {
  const {
    category,
    handleDeleteCategory,
    handleEditCategory,
    handleEditTopics,
    // isAdminMode,
    // cachedUsers,
    idx,
    isSelected,
    toggleSelected,
    availableCategoriesQuery,
  } = props;
  const { id, userId, status, _count, translations } = category;
  // TODO: Fetch translated fields
  const name = `Category ${id}`;
  const t = useT();

  const [isPending, startTransition] = React.useTransition();
  const queryClient = useQueryClient();

  const updateAndInvalidateCategory = React.useCallback(
    async (updatedCategory: TAvailableCategory) => {
      await updateCategory(updatedCategory);
      availableCategoriesQuery.updateCategory(updatedCategory);
      const invalidatePrefixes = [
        ['available-category', category.id],
        ['available-categories'],
      ].map(makeQueryKeyPrefix);
      invalidateKeysByPrefixes(queryClient, invalidatePrefixes, [
        availableCategoriesQuery.queryKey,
      ]);
    },
    [category.id, availableCategoriesQuery, queryClient],
  );

  /* // TODO: Use handleStatus instead
   * const handleTogglePublic = React.useCallback(
   *   (checked: boolean) => {
   *     startTransition(async () => {
   *       const updatedCategory = { ...category, isPublic: checked };
   *       try {
   *         await updateAndInvalidateCategory(updatedCategory);
   *       } catch (error) {
   *         const details = error instanceof APIError ? error.details : null;
   *         const message = t('ManageCategoriesList.CannotUpdateCategoryPublicStatus');
   *         // eslint-disable-next-line no-console
   *         console.error('[CategoriesTableRow:handleTogglePublic]', message, {
   *           details,
   *           error,
   *           categoryId: category.id,
   *         });
   *         debugger; // eslint-disable-line no-debugger
   *         toast.error(message);
   *       }
   *     });
   *   },
   *   [t, category, updateAndInvalidateCategory],
   * );
   */
  const topicsCount = _count?.topics;
  // const categoryUser = isAdminMode ? cachedUsers[userId] : undefined;
  // const { manageScope } = useManageCategoriesStore();
  const routePath = manageCategoriesRoute; // `/categories/manage`;
  return (
    <TableRow
      className={cn(
        isDev && '__ManageCategoriesList_CategoriesTableRow_Root', // DEBUG
        'truncate',
        'bg-background/10',
        'hover:bg-theme-500/5',
        isSelected && 'bg-theme-500/10 hover:bg-theme-500/15',
      )}
      data-category-id={id}
    >
      <TableCell
        id="select"
        className={cn(
          'w-[3em] cursor-pointer text-center transition',
          'hover:[&>button]:ring-2 hover:[&>button]:ring-theme-500/50',
        )}
        onClick={() => toggleSelected(id)}
        title={t('ManageCategoriesList.SelectCategory')}
      >
        <Checkbox
          checked={isSelected}
          className="block"
          aria-label={t('ManageCategoriesList.SelectCategory')}
        />
      </TableCell>
      <TableCell id="no" className="truncate text-right opacity-50 max-lg:hidden">
        <div className="truncate">{idx + 1}</div>
      </TableCell>
      {isDev && (
        <TableCell id="categoryId" className="max-w-6 truncate max-xl:hidden" title={id}>
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
      <TableCell id="topics" className="max-w-[8em] truncate max-lg:hidden">
        <div className="truncate">
          {topicsCount ? (
            <span className="font-medium">{topicsCount}</span>
          ) : (
            <span className="opacity-30">—</span>
          )}
        </div>
      </TableCell>
      {/*
      {isAdminMode && (
        <TableCell id="categoryUser" className="max-w-[8em] truncate max-lg:hidden">
          {categoryUser ? (
            <div className="truncate" title={categoryUser?.name || undefined}>
              {categoryUser?.name}
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
      */}
      <TableCell id="Actions" className="text-right">
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-9 shrink-0"
            onClick={() => handleEditTopics(category.id)}
            aria-label={t('ManageCategoriesList.EditTopics')}
            title={t('ManageCategoriesList.EditTopics')}
          >
            <Icons.Topics className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-9 shrink-0"
            onClick={() => handleEditCategory(category.id)}
            aria-label={t('ManageCategoriesList.Edit')}
            title={t('ManageCategoriesList.Edit')}
          >
            <Icons.Edit className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-9 shrink-0 text-destructive"
            onClick={() => handleDeleteCategory(category.id, 'ManageCategoriesList')}
            aria-label={t('ManageCategoriesList.Delete')}
            title={t('ManageCategoriesList.Delete')}
          >
            <Icons.Trash className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function CategoriesTableContent(props: TCategoriesTableContentProps) {
  const {
    className,
    handleDeleteCategory,
    handleEditCategory,
    handleEditTopics,
    handleAddCategory,
    availableCategoriesQuery,
    goBack,
    selectedCategories,
    setSelectedCategories,
  } = props;
  // const { manageScope } = useManageCategoriesStore();
  const t = useT();
  // const isAdminMode = true; // manageScope === CategoriesManageScopeIds.ALL_CATEGORIES; // || user?.role === 'ADMIN';

  // const { isExpanded: isFiltersExpanded, expandFilters } = useCategoriesFiltersContext();

  const {
    isLoading,
    hasCategories,
    allCategories,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isError,
    error,
    queryUrlHash,
  } = availableCategoriesQuery;

  const saveScrollHash = React.useMemo(
    () => sessionSaveScrollHash + getAbcHashString(queryUrlHash),
    [queryUrlHash],
  );

  /* // UNUSED: CachedUsers
   * const cachedUsers = useCachedUsersForCategories({
   *   categories: allCategories,
   *   bypass: !isAdminMode, // Do not use users data if not admin user role
   * });
   */

  const memo = React.useMemo<TMemo>(() => ({ allCategories: [] }), []);
  memo.allCategories = allCategories;

  const toggleSelected = React.useCallback(
    (categoryId: TCategoryId) => {
      setSelectedCategories((set) => {
        const newSet = new Set(set);
        if (set.has(categoryId)) {
          newSet.delete(categoryId);
        } else {
          newSet.add(categoryId);
        }
        return newSet;
      });
    },
    [setSelectedCategories],
  );

  const toggleAll = React.useCallback(() => {
    setSelectedCategories((set) => {
      if (set.size) {
        return new Set();
      } else {
        return new Set(memo.allCategories.map((category) => category.id));
      }
    });
  }, [memo, setSelectedCategories]);

  if (isError) {
    return (
      <PageError
        className={cn(
          isDev && '__ManageCategoriesList_CategoriesTableContent_Error', // DEBUG
          className,
        )}
        error={error || t('ManageCategoriesList.ErrorLoadingCategoriesData')}
        reset={refetch}
        // extraActions={extraActions}
      />
    );
  }

  if (!hasCategories) {
    return (
      <ScrollArea
        className={cn(
          isDev && '__ManageCategoriesList_CategoriesTableContent_PageEmpty_Scroll', // DEBUG
          'flex flex-1 flex-col overflow-hidden',
          'mx-6',
          className,
        )}
        viewportClassName={cn(
          isDev && '__ManageCategoriesList_CategoriesTableContent_ScrollViewport', // DEBUG
          'flex flex-1 flex-col',
          '[&>div]:!flex [&>div]:flex-col [&>div]:flex-1',
        )}
      >
        <PageEmpty
          className={cn(
            isDev && '__ManageCategoriesList_CategoriesTableContent_PageEmpty', // DEBUG
          )}
          icon={Icons.Categories}
          title={t('ManageCategoriesList.NoCategoriesFound')}
          description={t('ManageCategoriesList.NoCategoriesFoundDescription')}
          buttons={
            <>
              <Button variant="ghost" onClick={goBack} className="flex gap-2">
                <Icons.ArrowLeft className="hidden size-4 opacity-50 sm:flex" />
                {t('ManageCategoriesList.GoBack')}
              </Button>
              {/* // TODO: Filters
              {!isFiltersExpanded && (
                <Button variant="outline" onClick={expandFilters} className="flex gap-2">
                  <Icons.Settings2 className="hidden size-4 opacity-50 sm:flex" />
                  {t('ManageCategoriesList.ChangeFilters')}
                </Button>
              )}
              */}
              <Button onClick={handleAddCategory} className="flex gap-2">
                <Icons.Categories className="hidden size-4 opacity-50 sm:flex" />
                {t('ManageCategoriesList.AddCategory')}
              </Button>
            </>
          }
        />
      </ScrollArea>
    );
  }

  return (
    <ScrollAreaInfinite
      effectorData={allCategories}
      fetchNextPage={fetchNextPage}
      isLoading={isLoading}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      saveScrollKey="ManageCategoriesList"
      saveScrollHash={saveScrollHash}
      className={cn(
        isDev && '__ManageCategoriesList_CategoriesTableContent_Scroll', // DEBUG
        'relative flex flex-1 flex-col overflow-hidden',
        'mx-6',
        className,
      )}
      viewportClassName={cn(
        isDev && '__ManageCategoriesList_CategoriesTableContent_Scroll_Viewport', // DEBUG
      )}
      containerClassName={cn(
        isDev && '__ManageCategoriesList_CategoriesTableContent_Scroll_Container', // DEBUG
        'relative w-full flex flex-col gap-4',
      )}
    >
      <Table>
        <CategoriesTableHeader
          // isAdminMode={isAdminMode}
          selectedCategories={selectedCategories}
          allCategories={allCategories}
          toggleAll={toggleAll}
        />
        <TableBody>
          {allCategories.map((category, idx) => (
            <CategoriesTableRow
              key={category.id}
              idx={idx}
              category={category}
              handleDeleteCategory={handleDeleteCategory}
              handleEditCategory={handleEditCategory}
              handleEditTopics={handleEditTopics}
              // isAdminMode={isAdminMode}
              // cachedUsers={cachedUsers}
              isSelected={selectedCategories.has(category.id)}
              toggleSelected={toggleSelected}
              availableCategoriesQuery={availableCategoriesQuery}
            />
          ))}
        </TableBody>
      </Table>
    </ScrollAreaInfinite>
  );
}

export function ManageCategoriesList(props: TManageCategoriesListProps) {
  const { handleAddCategory, availableCategoriesQuery } = props;
  // const { manageScope } = useManageCategoriesStore();
  // const namespace = categoriesNamespaces[manageScope];
  const t = useT();
  const [selectedCategories, setSelectedCategories] = React.useState<Set<TCategoryId>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const queryClient = useQueryClient();

  const { refetch, isFetched, isRefetching, isLoading } = availableCategoriesQuery;

  /* // // TODO: Filters
   * const { isInited: isFiltersInited, isPending: isFiltersPending } = useCategoriesFiltersContext();
   */

  const isDataInited = isFetched; /* && isFiltersInited */

  const isDataLoading = isRefetching || isLoading; /* || isFiltersPending */

  const goBack = useGoBack(rootAliasRoute);

  const handleReload = React.useCallback(() => {
    refetch({ cancelRefetch: true });
  }, [refetch]);

  const deleteSelectedMutation = useMutation({
    mutationFn: deleteCategories,
    onSuccess: () => {
      const selectedIds = Array.from(selectedCategories);
      selectedIds.forEach((categoryId) => {
        availableCategoriesQuery.deleteCategory(categoryId);
      });
      const invalidatePrefixes = [
        // Invalidate all the other category related queries
        '["available-category',
      ].map(makeQueryKeyPrefix);
      invalidateKeysByPrefixes(queryClient, invalidatePrefixes, [
        availableCategoriesQuery.queryKey,
      ]);
      setSelectedCategories(new Set());
    },
    onError: (error) => {
      const details = error instanceof APIError ? error.details : null;
      const message = t('ManageCategoriesList.CannotDeleteSelectedCategories');
      // eslint-disable-next-line no-console
      console.error('[ManageCategoriesList:deleteSelectedMutation]', message, {
        details,
        error,
        selectedCategories: Array.from(selectedCategories),
      });
      debugger; // eslint-disable-line no-debugger
      toast.error(message);
    },
  });

  const handleDeleteSelected = React.useCallback(() => {
    const selectedIds = Array.from(selectedCategories);
    if (selectedIds.length === 0) return;

    const promise = deleteSelectedMutation.mutateAsync({ ids: selectedIds });
    toast.promise(promise, {
      loading: t('ManageCategoriesList.DeletingSelectedCategories'),
      success: t('ManageCategoriesList.SuccessfullyDeletedSelectedCategories'),
      error: t('ManageCategoriesList.CannotDeleteSelectedCategories'),
    });
    setShowDeleteConfirm(false);
  }, [selectedCategories, deleteSelectedMutation, t]);

  const handleShowDeleteConfirm = React.useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleHideDeleteConfirm = React.useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  const makeSelectedPublicMutation = useMutation({
    mutationFn: async (categoryIds: TCategoryId[]) => {
      const categories = availableCategoriesQuery.allCategories.filter((category) =>
        categoryIds.includes(category.id),
      );
      await Promise.all(categories.map((category) => updateCategory(category)));
      return categories;
    },
    onSuccess: (categories) => {
      categories.forEach((category) => {
        availableCategoriesQuery.updateCategory(category);
      });
      const invalidatePrefixes = [['available-categories']].map(makeQueryKeyPrefix);
      invalidateKeysByPrefixes(queryClient, invalidatePrefixes, [
        availableCategoriesQuery.queryKey,
      ]);
      setSelectedCategories(new Set());
    },
    onError: (error) => {
      const message = t('ManageCategoriesList.CannotMakeSelectedCategoriesPublic');
      // eslint-disable-next-line no-console
      console.error('[ManageCategoriesList:makeSelectedPublicMutation]', message, {
        error,
      });
      debugger; // eslint-disable-line no-debugger
      toast.error(message);
    },
  });

  const resetSelectedPublicMutation = useMutation({
    mutationFn: async (categoryIds: TCategoryId[]) => {
      const categories = availableCategoriesQuery.allCategories.filter((category) =>
        categoryIds.includes(category.id),
      );
      await Promise.all(categories.map((category) => updateCategory(category)));
      return categories;
    },
    onSuccess: (categories) => {
      categories.forEach((category) => {
        availableCategoriesQuery.updateCategory(category);
      });
      const invalidatePrefixes = [['available-categories']].map(makeQueryKeyPrefix);
      invalidateKeysByPrefixes(queryClient, invalidatePrefixes, [
        availableCategoriesQuery.queryKey,
      ]);
      setSelectedCategories(new Set());
    },
    onError: (error) => {
      const message = t('ManageCategoriesList.CannotResetPublicStatusForSelectedCategories');
      // eslint-disable-next-line no-console
      console.error('[ManageCategoriesList:resetSelectedPublicMutation]', message, {
        error,
      });
      debugger; // eslint-disable-line no-debugger
      toast.error(message);
    },
  });

  const handleMakeSelectedPublic = React.useCallback(() => {
    const selectedIds = Array.from(selectedCategories);
    if (selectedIds.length === 0) return;
    const promise = makeSelectedPublicMutation.mutateAsync(selectedIds);
    toast.promise(promise, {
      loading: t('ManageCategoriesList.MakingSelectedCategoriesPublic'),
      success: t('ManageCategoriesList.SuccessfullyMadeSelectedCategoriesPublic'),
      error: t('ManageCategoriesList.CannotMakeSelectedCategoriesPublic'),
    });
  }, [selectedCategories, makeSelectedPublicMutation, t]);

  const handleResetSelectedPublic = React.useCallback(() => {
    const selectedIds = Array.from(selectedCategories);
    if (selectedIds.length === 0) return;
    const promise = resetSelectedPublicMutation.mutateAsync(selectedIds);
    toast.promise(promise, {
      loading: t('ManageCategoriesList.ResettingPublicStatusForSelectedCategories'),
      success: t('ManageCategoriesList.SuccessfullyResetPublicStatusForSelectedCategories'),
      error: t('ManageCategoriesList.CannotResetPublicStatusForSelectedCategories'),
    });
  }, [selectedCategories, resetSelectedPublicMutation, t]);

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
        content: t('ManageCategoriesList.Reload'),
        icon: Icons.Refresh,
        visibleFor: 'lg',
        pending: isRefetching,
        onClick: handleReload,
      },
      {
        id: 'Mark Public',
        content: t('ManageCategoriesList.MarkSelectedAsPublic'),
        icon: Icons.Eye,
        hidden: !selectedCategories.size,
        pending: makeSelectedPublicMutation.isPending,
        onClick: handleMakeSelectedPublic,
      },
      {
        id: 'Mark Private',
        content: t('ManageCategoriesList.MarkSelectedAsPrivate'),
        icon: Icons.EyeOff,
        hidden: !selectedCategories.size,
        pending: resetSelectedPublicMutation.isPending,
        onClick: handleResetSelectedPublic,
      },
      {
        id: 'Delete Selected',
        content: t('ManageCategoriesList.DeleteSelected'),
        icon: Icons.Trash,
        hidden: !selectedCategories.size,
        pending: deleteSelectedMutation.isPending,
        onClick: handleShowDeleteConfirm,
      },
      {
        id: 'Add',
        content: t('ManageCategoriesList.AddNewCategory'),
        icon: Icons.Add,
        visibleFor: 'md',
        onClick: handleAddCategory,
      },
    ],
    [
      t,
      goBack,
      handleAddCategory,
      handleReload,
      isRefetching,
      selectedCategories.size,
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
        heading={t(`Pages.ManageCategoriesListTitle`)}
        className={cn(
          isDev && '__ManageCategoriesList_DashboardHeader', // DEBUG
          'mx-6',
        )}
        // breadcrumbs={breadcrumbs}
        actions={actions}
      />
      {/*
      <AvailableCategoriesFilters
        className={cn(
          isDev && '__ManageCategoriesList_Filters', // DEBUG
          'mx-6 transition',
          isFiltersPending && 'opacity-50',
        )}
      />
      */}
      {isDataInited ? (
        <CategoriesTableContent
          {...props}
          className={cn(
            isDev && '__ManageCategoriesList_CardContent', // DEBUG
            'flex flex-col flex-wrap items-start',
            'overflow-hidden rounded-md transition',
            isDataLoading && 'opacity-50',
          )}
          goBack={goBack}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
        />
      ) : (
        <ContentSkeletonTable className="px-6" />
      )}
      <ConfirmModal
        dialogTitle={t('ManageCategoriesList.ConfirmDeleteCategories')}
        confirmButtonVariant="destructive"
        confirmButtonText={t('ManageCategoriesList.Delete')}
        confirmButtonBusyText={t('ManageCategoriesList.Deleting')}
        cancelButtonText={t('Cancel')}
        handleClose={handleHideDeleteConfirm}
        handleConfirm={handleDeleteSelected}
        isPending={deleteSelectedMutation.isPending}
        isVisible={showDeleteConfirm}
      >
        {t('ManageCategoriesList.ConfirmDeleteCategoriesMessage', {
          count: selectedCategories.size,
        })}
      </ConfirmModal>
    </>
  );
}
