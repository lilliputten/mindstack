import React from 'react';
import { useSession } from 'next-auth/react';

import { getAbcHashString, getRandomHashString } from '@/lib/helpers/strings';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Link } from '@/i18n/routing';
import { Button, buttonVariants } from '@/components/ui/Button';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { ScrollAreaInfinite } from '@/components/ui/ScrollAreaInfinite';
import { useSignInModalContext } from '@/components/modals';
import { PageEmpty } from '@/components/pages/shared';
import { Icons } from '@/components/shared';
import { manageCategoriesRoute, rootAliasRoute, TRoutePath, welcomeAliasRoute } from '@/config';
import { isDev } from '@/constants';
import { useCategoriesFiltersContext } from '@/features/categories/contexts';
import { useAvailableCategories } from '@/features/categories/query-hooks';
import { useGoBack } from '@/hooks';

import { AvailableCategoriesListItem } from './AvailableCategoriesListItem';
import { ContentListSkeleton } from './ContentSkeleton';

const sessionSaveScrollHash = getRandomHashString();

interface TProps extends TPropsWithClassName {
  availableCategoriesQuery: ReturnType<typeof useAvailableCategories>;
}

function AddCategoryBlock() {
  const t = useT();
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
        href={'/categories/available/suggest' as TRoutePath}
        className={cn(buttonVariants({ variant: 'theme' }), 'flex w-full gap-2')}
      >
        <Icons.Plus className="size-5" />
        {t('SuggestNewCategory')}
      </Link>
    </div>
  ) : (
    <div
      className={cn(
        isDev && '__AvailableCategoriesList_Info', // DEBUG
        'flex items-center gap-2 rounded-md border border-theme/10 p-2',
      )}
    >
      <Icons.Info className="size-6 flex-shrink-0 text-theme" />
      <p className="content-text flex-1 text-sm">
        {t.rich('AvailableCategoriesList.UnauthorizedUserSuggestionMessage', {
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

export function AvailableCategoriesList(props: TProps) {
  const t = useT();

  const { className, availableCategoriesQuery } = props;

  const {
    data: sessionData,
    // status: sessionStatus,
  } = useSession();
  const user = sessionData?.user;
  const isAdmin = user?.role === 'ADMIN';

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
          description={t('AvailableCategoriesList.NoCategoriesExplanation')}
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
              {/* NOTE: Allow management only for admins */}
              {isAdmin && (
                <Link
                  href={manageCategoriesRoute}
                  className={cn(buttonVariants({ variant: 'default' }), 'flex gap-2')}
                >
                  <Icons.Categories className="hidden size-4 opacity-50 sm:flex" />
                  <span>{t('AvailableCategoriesList.ManageCategories')}</span>
                </Link>
              )}
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
      {allCategories.map((category) => (
        <AvailableCategoriesListItem key={category.id} category={category} />
      ))}
      <AddCategoryBlock />
    </ScrollAreaInfinite>
  );
}
