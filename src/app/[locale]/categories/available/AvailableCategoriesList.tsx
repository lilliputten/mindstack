import React from 'react';

import { getAbcHashString, getRandomHashString } from '@/lib/helpers/strings';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Link } from '@/i18n/routing';
import { Button, buttonVariants } from '@/components/ui/Button';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { ScrollAreaInfinite } from '@/components/ui/ScrollAreaInfinite';
import { PageEmpty } from '@/components/pages/shared';
import * as Icons from '@/components/shared/Icons';
import { manageCategoriesRoute, rootAliasRoute } from '@/config';
import { isDev } from '@/constants';
import { useAvailableCategories, useCategoriesFiltersContext } from '@/features/categories';
import { useGoBack } from '@/hooks';

import { AvailableCategoriesListItem } from './AvailableCategoriesListItem';
import { ContentListSkeleton } from './ContentSkeleton';

const sessionSaveScrollHash = getRandomHashString();

interface TProps extends TPropsWithClassName {
  availableCategoriesQuery: ReturnType<typeof useAvailableCategories>;
}

export function AvailableCategoriesList(props: TProps) {
  const t = useT();

  const { className, availableCategoriesQuery } = props;

  const goBack = useGoBack(rootAliasRoute);

  const {
    isInited: isFiltersInited,
    isExpanded: isFiltersExpanded,
    expandFilters,
  } = useCategoriesFiltersContext();

  const {
    // error,
    // isError,
    // refetch,
    queryUrlHash,
    allCategories,
    fetchNextPage,
    hasNextPage,
    hasCategories,
    isFetched,
    isFetchingNextPage,
    isLoading,
  } = availableCategoriesQuery;

  const saveScrollHash = React.useMemo(
    () => sessionSaveScrollHash + getAbcHashString(queryUrlHash),
    [queryUrlHash],
  );

  if (!isFetched || !isFiltersInited) {
    return <ContentListSkeleton className="px-6" />;
  }

  if (!hasCategories) {
    return (
      <ScrollArea
        className={cn(
          isDev && '__AvailableCategoriesList_PageEmpty', // DEBUG
          'flex flex-1 flex-col overflow-hidden',
          className,
        )}
        viewportClassName={cn(
          isDev && '__AvailableCategoriesList_ScrollViewport', // DEBUG
          'flex flex-1 flex-col',
          '[&>div]:!flex [&>div]:flex-col [&>div]:flex-1',
        )}
      >
        <PageEmpty
          className="mx-6"
          title={t('NoCategoriesAvailable')}
          description={t('AvailableCategoriesList.ChangeFiltersText')}
          // TODO: Add a button to open the filters pane (via context?)
          buttons={
            <>
              <Button variant="ghost" onClick={goBack} className="flex gap-2">
                <Icons.ArrowLeft className="hidden size-4 opacity-50 sm:flex" />
                {t('GoBack')}
              </Button>
              {!isFiltersExpanded && (
                <Button variant="outline" onClick={expandFilters} className="flex gap-2">
                  <Icons.Settings2 className="hidden size-4 opacity-50 sm:flex" />
                  {t('ChangeFilters')}
                </Button>
              )}
              <Link
                href={manageCategoriesRoute}
                className={cn(buttonVariants({ variant: 'default' }), 'flex gap-2')}
              >
                <Icons.Categories className="hidden size-4 opacity-50 sm:flex" />
                <span>{t('AvailableCategoriesList.ManageOrCreateYourOwnCategories')}</span>
              </Link>
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
      saveScrollKey="AvailableCategoriesList"
      saveScrollHash={saveScrollHash}
      className={cn(
        isDev && '__AvailableCategoriesList', // DEBUG
        'relative flex flex-1 flex-col overflow-hidden',
        className,
      )}
      viewportClassName={cn(
        isDev && '__AvailableCategoriesList_Viewport', // DEBUG
        'relative flex flex-1 flex-col',
        '[&>div]:gap-4 [&>div]:flex-col [&>div]:px-6',
      )}
      containerClassName={cn(
        isDev && '__AvailableCategoriesList_Container', // DEBUG
        'relative flex flex-col gap-4',
      )}
      // thumbClassName="bg-theme-600/40"
    >
      {allCategories.map((category, index) => (
        <AvailableCategoriesListItem key={category.id} index={index} category={category} />
      ))}
    </ScrollAreaInfinite>
  );
}
