'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { TActionMenuItem } from '@/components/dashboard/DashboardActions';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import * as Icons from '@/components/shared/Icons';
import { availableCategoriesRoute, manageCategoriesRoute } from '@/config';
import { isDev } from '@/constants';
import { useAvailableCategories } from '@/features/categories';
import { AvailableCategoriesFilters } from '@/features/categories/components/AvailableCategoriesFilters';
import { useGoToTheRoute, useSessionUser } from '@/hooks';

import { AvailableCategoriesList } from './AvailableCategoriesList';

interface TProps {
  availableCategoriesQuery: ReturnType<typeof useAvailableCategories>;
}

export function AvailableCategoriesListPage(props: TProps) {
  const { availableCategoriesQuery } = props;

  const t = useT();
  const user = useSessionUser();
  const goToTheRoute = useGoToTheRoute();
  // const goBack = useGoBack(rootAliasRoute);

  const {
    isFetched,
    isRefetching,
    refetch,
    // isLoading,
    // isError,
    // error,
    // hasCategories,
  } = availableCategoriesQuery;

  const actions = React.useMemo<TActionMenuItem[]>(
    () =>
      [
        {
          id: 'SuggestNewCategory',
          content: t('AvailableCategoriesList.SuggestNewCategory'),
          variant: 'ghost',
          icon: Icons.Plus,
          visibleFor: 'lg',
          hidden: !user?.id,
          onClick: () => goToTheRoute(`${availableCategoriesRoute}/suggest`),
        },
        {
          id: 'ManageYourCategoriesAction',
          content: t('AvailableCategoriesList.ManageYourCategoriesAction'),
          variant: 'ghost',
          icon: Icons.Edit,
          visibleFor: 'xl',
          hidden: user?.role !== 'ADMIN',
          onClick: () => goToTheRoute(manageCategoriesRoute),
        },
        {
          id: 'reload',
          content: t('Reload'),
          variant: 'ghost',
          icon: Icons.Refresh,
          pending: isRefetching,
          visibleFor: 'md',
          disabled: !isFetched,
          onClick: refetch,
        },
      ] satisfies TActionMenuItem[],
    [goToTheRoute, user, refetch, isFetched, isRefetching, t],
  );

  return (
    <>
      <DashboardHeader
        heading={t('Categories')}
        className={cn(
          isDev && '__AvailableCategoriesListPage_DashboardHeader', // DEBUG
          'mx-6',
        )}
        // breadcrumbs={breadcrumbs}
        actions={actions}
      />
      <AvailableCategoriesFilters
        className={cn(
          isDev && '__AvailableCategoriesListPage_Filters', // DEBUG
          'mx-6',
        )}
      />
      <AvailableCategoriesList
        className={cn(
          isDev && '__AvailableCategoriesListPage_Content', // DEBUG
          'relative flex flex-1 flex-col overflow-hidden',
        )}
        availableCategoriesQuery={availableCategoriesQuery}
      />
    </>
  );
}
