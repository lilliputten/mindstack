'use client';

import React from 'react';
import { toast } from 'sonner';

import { manageCategoriesRoute } from '@/config/routesConfig';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Card } from '@/components/ui/Card';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { TActionMenuItem } from '@/components/dashboard/DashboardActions';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { useAvailableCategoryById } from '@/features/categories/query-hooks';
import { TCategoryId } from '@/features/categories/types';
import { useGoBack, useGoToTheRoute } from '@/hooks';

import { ViewCategoryContentSummary } from './ViewCategoryContentSummary';

interface TViewCategoryPageProps extends TPropsWithClassName {
  categoryId: TCategoryId;
  availableCategoryQuery: ReturnType<typeof useAvailableCategoryById>;
}

export function ViewCategoryPage(props: TViewCategoryPageProps) {
  const { categoryId, availableCategoryQuery } = props;
  const goBack = useGoBack(manageCategoriesRoute);
  const goToTheRoute = useGoToTheRoute();
  const t = useT();

  const {
    category,
    // queryKey: availableCategoryQueryKey,
    // isFetched: isCategoryFetched,
    // isLoading: isCategoryLoading,
    // isCached: isCategoryCached,
  } = availableCategoryQuery;

  // Error: category hasn't been found
  if (!category) {
    throw new Error(t('ViewCategoryPage.NoCategoryFound'));
  }

  const categoriesListRoutePath = manageCategoriesRoute;
  // const categoryRoutePath = `${categoriesListRoutePath}/${categoryId}`;

  const handleReload = React.useCallback(() => {
    availableCategoryQuery.refetch().catch((error: unknown) => {
      const message = t('ViewCategoryPage.CannotUpdateCategoryData');
      // eslint-disable-next-line no-console
      console.error('[ViewCategoryPage:handleReload]', message, { error });
      debugger; // eslint-disable-line no-debugger
      toast.error(message);
    });
  }, [availableCategoryQuery, t]);

  const actions: TActionMenuItem[] = React.useMemo(
    () => [
      {
        id: 'Back',
        content: t('Back'),
        icon: Icons.ArrowLeft,
        visibleFor: 'sm',
        disabled: !goBack,
        onClick: goBack,
      },
      {
        id: 'Reload',
        content: t('Reload'),
        icon: Icons.Refresh,
        onClick: handleReload,
      },
      {
        id: 'Edit',
        content: t('Edit'),
        icon: Icons.Edit,
        visibleFor: 'lg',
        onClick: () =>
          goToTheRoute(
            `${categoriesListRoutePath}/edit?categoryId=${categoryId}&from=ViewCategoryPage`,
          ),
      },
    ],
    [t, goBack, handleReload, categoryId, goToTheRoute, categoriesListRoutePath],
  );

  return (
    <>
      <DashboardHeader
        heading={t('ViewCategoryPage.ViewCategory')}
        className={cn(
          isDev && '__ViewCategoryPage_DashboardHeader', // DEBUG
          'mx-6',
        )}
        actions={actions}
      />
      <Card
        className={cn(
          isDev && '__ViewCategoryCard', // DEBUG
          'relative mx-6 flex flex-1 flex-col overflow-hidden py-6 xl:col-span-2',
        )}
      >
        <ScrollArea>
          <ViewCategoryContentSummary availableCategoryQuery={availableCategoryQuery} />
        </ScrollArea>
      </Card>
    </>
  );
}
