import React from 'react';

import { myTopicsRoute, rootRoute } from '@/config/routesConfig';
import { getRandomHashString } from '@/lib/helpers/strings';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/Button';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { ScrollAreaInfinite } from '@/components/ui/ScrollAreaInfinite';
import { PageEmpty } from '@/components/pages/shared';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { TTopicsManageScopeId } from '@/contexts/TopicsContext/TopicsContextDefinitions';
import { useAvailableTopicsByScope, useGoBack } from '@/hooks';
import { Link } from '@/i18n/routing';

import { AvailableTopicsListItem } from './AvailableTopicsListItem';
import { ContentListSkeleton } from './ContentSkeleton';

const saveScrollHash = getRandomHashString();

interface TProps extends TPropsWithClassName {
  availableTopicsQuery: ReturnType<typeof useAvailableTopicsByScope>;
  manageScope: TTopicsManageScopeId;
  isFiltersInited: boolean;
}

export function AvailableTopicsList(props: TProps) {
  const { className, availableTopicsQuery, isFiltersInited } = props;

  const goBack = useGoBack(rootRoute);

  const {
    // error,
    // isError,
    // refetch,
    allTopics,
    fetchNextPage,
    hasNextPage,
    hasTopics,
    isFetched,
    isFetchingNextPage,
    isLoading,
  } = availableTopicsQuery;

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
          title="No topics available"
          description="Change filters to allow displaying public topics (if there are any), or create your own ones."
          buttons={
            <>
              <Button variant="ghost" onClick={goBack} className="flex gap-2">
                <Icons.ArrowLeft className="hidden size-4 opacity-50 sm:flex" />
                Go Back
              </Button>
              <Link
                href={myTopicsRoute}
                className={cn(buttonVariants({ variant: 'default' }), 'flex gap-2')}
              >
                <Icons.Topics className="hidden size-4 opacity-50 sm:flex" />
                <span>Manage or create your own topics</span>
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
      {allTopics.map((topic, index) => (
        <AvailableTopicsListItem key={topic.id} index={index} topic={topic} />
      ))}
    </ScrollAreaInfinite>
  );
}
