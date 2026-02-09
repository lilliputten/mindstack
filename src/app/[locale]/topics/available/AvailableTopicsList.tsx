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
import * as Icons from '@/components/shared/Icons';
import { myTopicsRoute, rootAliasRoute, TRoutePath, welcomeAliasRoute } from '@/config';
import { isDev } from '@/constants';
import { TTopicsManageScopeId } from '@/contexts/TopicsContext/TopicsContextDefinitions';
import { useTopicsFiltersContext } from '@/contexts/TopicsFiltersContext';
import { useAvailableTopicsByScope, useGoBack } from '@/hooks';

import { AvailableTopicsListItem } from './AvailableTopicsListItem';
import { ContentListSkeleton } from './ContentSkeleton';

const sessionSaveScrollHash = getRandomHashString();

interface TProps extends TPropsWithClassName {
  availableTopicsQuery: ReturnType<typeof useAvailableTopicsByScope>;
  manageScope: TTopicsManageScopeId;
}

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

export function AvailableTopicsList(props: TProps) {
  const t = useT();

  const { className, availableTopicsQuery } = props;

  const goBack = useGoBack(rootAliasRoute);

  const {
    isInited: isFiltersInited,
    isExpanded: isFiltersExpanded,
    expandFilters,
  } = useTopicsFiltersContext();

  const {
    // error,
    // isError,
    // refetch,
    queryUrlHash,
    allTopics,
    fetchNextPage,
    hasNextPage,
    hasTopics,
    isFetched,
    isFetchingNextPage,
    isLoading,
  } = availableTopicsQuery;

  const saveScrollHash = React.useMemo(
    () => sessionSaveScrollHash + getAbcHashString(queryUrlHash),
    [queryUrlHash],
  );

  if (!isFetched || !isFiltersInited) {
    return <ContentListSkeleton className="px-6" />;
  }

  if (!hasTopics) {
    return (
      <ScrollArea
        className={cn(
          isDev && '__AvailableTopicsList_PageEmpty', // DEBUG
          'flex flex-1 flex-col overflow-hidden',
          className,
        )}
        viewportClassName={cn(
          isDev && '__AvailableTopicsList_ScrollViewport', // DEBUG
          'flex flex-1 flex-col',
          '[&>div]:!flex [&>div]:flex-col [&>div]:flex-1',
        )}
      >
        <PageEmpty
          className="mx-6"
          title={t('NoTopicsAvailable')}
          description={t('AvailableTopicsList.ChangeFiltersText')}
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
                href={myTopicsRoute}
                className={cn(buttonVariants({ variant: 'default' }), 'flex gap-2')}
              >
                <Icons.Topics className="hidden size-4 opacity-50 sm:flex" />
                <span>{t('ManageOrCreateYourOwnTopics')}</span>
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
      saveScrollKey="AvailableTopicsList"
      saveScrollHash={saveScrollHash}
      className={cn(
        isDev && '__AvailableTopicsList', // DEBUG
        'relative flex flex-1 flex-col overflow-hidden',
        className,
      )}
      viewportClassName={cn(
        isDev && '__AvailableTopicsList_Viewport', // DEBUG
        'relative flex flex-1 flex-col',
        '[&>div]:gap-4 [&>div]:flex-col [&>div]:px-6',
      )}
      containerClassName={cn(
        isDev && '__AvailableTopicsList_Container', // DEBUG
        'relative flex flex-col gap-4',
      )}
      // thumbClassName="bg-theme-600/40"
    >
      {allTopics.map((topic) => (
        <AvailableTopicsListItem key={topic.id} topic={topic} />
      ))}
      <AddTopicBlock />
    </ScrollAreaInfinite>
  );
}
