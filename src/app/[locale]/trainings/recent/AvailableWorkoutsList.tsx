'use client';

import React from 'react';

import { getAbcHashString, getRandomHashString } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Link } from '@/i18n/routing';
import { Button, buttonVariants } from '@/components/ui/Button';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { ScrollAreaInfinite } from '@/components/ui/ScrollAreaInfinite';
import { useSignInModalContext } from '@/components/modals';
import { PageEmpty } from '@/components/pages/shared';
import { PageError } from '@/components/shared';
import * as Icons from '@/components/shared/Icons';
import { availableTopicsRoute, startAliasRoute } from '@/config';
import { isDev } from '@/constants';
import { useWorkoutsFiltersContext } from '@/features/workouts/contexts';
import { useAvailableWorkouts } from '@/features/workouts/query-hooks';
import { useGoBack } from '@/hooks';

import { AvailableWorkoutsListItem } from './AvailableWorkoutsListItem';
import { ContentListSkeleton } from './ContentSkeleton';

interface TProps {
  className?: string;
  user?: {
    id: string;
  };
  availableWorkoutsQuery: ReturnType<typeof useAvailableWorkouts>;
}

const saveScrollKey = 'AvailableWorkoutsList';
const sessionSaveScrollHash = getRandomHashString();

export function AvailableWorkoutsList(props: TProps) {
  const { className, user, availableWorkoutsQuery } = props;
  const isUser = !!user?.id;

  const t = useT();

  const { showSignInModal } = useSignInModalContext();

  const {
    // isInited: isFiltersInited,
    isExpanded: isFiltersExpanded,
    expandFilters,
  } = useWorkoutsFiltersContext();

  const {
    // isRefetching,
    // queryClient,
    // queryKey,
    allWorkouts,
    error,
    fetchNextPage,
    hasNextPage,
    hasWorkouts,
    isError,
    isFetched,
    isLocal,
    isFetchingNextPage,
    isLoading,
    queryUrlHash,
    refetch,
  } = availableWorkoutsQuery;

  const isBusy = isLoading; // || isRefetching;

  const goBack = useGoBack(startAliasRoute);

  const saveScrollHash = React.useMemo(
    () => [sessionSaveScrollHash, getAbcHashString(queryUrlHash)].filter(Boolean).join('-'),
    [queryUrlHash],
  );

  if (!(isFetched || isLocal) || /* !isFiltersInited || */ isBusy) {
    return <ContentListSkeleton className="px-6" />;
  }

  if (isError) {
    return (
      <PageError
        className={cn(
          isDev && '__AvailableWorkoutsListPage_Error', // DEBUG
          'my-0',
        )}
        error={error || t('AvailableWorkouts.ErrorLoadingWorkoutsData')}
        reset={refetch}
      />
    );
  }

  if (!hasWorkouts) {
    return (
      <ScrollArea
        className={cn(
          isDev && '__AvailableWorkoutsListPage_PageEmpty', // DEBUG
          'flex flex-1 flex-col overflow-hidden',
          className,
        )}
        viewportClassName={cn(
          isDev && '__AvailableWorkoutsListPage_ScrollViewport', // DEBUG
          'flex flex-1 flex-col',
          '[&>div]:!flex [&>div]:flex-col [&>div]:flex-1',
        )}
      >
        <PageEmpty
          className={cn(
            isDev && '__AvailableWorkoutsListPage_PageEmpty', // DEBUG
            'mx-6',
          )}
          title={t('NoWorkoutsAvailable')}
          description={t('AvailableWorkouts.NoWorkoutsExplanation')}
          buttons={
            <>
              <Button variant="ghost" onClick={goBack} className="content-truncate flex gap-2">
                <Icons.ArrowLeft className="size-4 shrink-0 opacity-50" />
                <span className="truncate">{t('GoBack')}</span>
              </Button>
              <Link
                href={availableTopicsRoute}
                className={cn(
                  buttonVariants({ variant: 'default' }),
                  'content-truncate flex gap-2',
                )}
              >
                <Icons.Topics className="size-4 shrink-0 opacity-50" />
                <span className="truncate">
                  {t('AvailableWorkouts.SelectTopicToStartTraining')}
                </span>
              </Link>
              {!isFiltersExpanded && (
                <Button
                  variant="outline"
                  onClick={expandFilters}
                  className="content-truncate flex gap-2"
                >
                  <Icons.Settings2 className="size-4 shrink-0 opacity-50" />
                  <span className="truncate">{t('ChangeFilters')}</span>
                </Button>
              )}
            </>
          }
        />
      </ScrollArea>
    );
  }

  return (
    <ScrollAreaInfinite
      effectorData={allWorkouts}
      fetchNextPage={fetchNextPage}
      isLoading={isLoading}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      saveScrollKey={saveScrollKey}
      saveScrollHash={saveScrollHash}
      className={cn(
        isDev && '__AvailableWorkoutsList', // DEBUG
        'relative flex flex-1 flex-col overflow-hidden',
        className,
      )}
      viewportClassName={cn(
        isDev && '__AvailableWorkoutsList_Viewport', // DEBUG
        'relative flex flex-1 flex-col',
        '[&>div]:gap-4 [&>div]:flex-col [&>div]:px-6',
      )}
      containerClassName={cn(
        isDev && '__AvailableWorkoutsList_Container', // DEBUG
        'relative flex flex-col gap-4',
      )}
    >
      {allWorkouts.map((workout, index) => (
        <AvailableWorkoutsListItem
          key={`${workout.userId}_${workout.topicId}`}
          index={index}
          workout={workout}
        />
      ))}

      {isUser && (
        <div
          className={cn(
            isDev && '__AvailableWorkoutsList_BrowseButton', // DEBUG
            'flex items-center justify-center',
          )}
        >
          <Link
            href={availableTopicsRoute}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'content-truncate flex items-center gap-2',
            )}
          >
            <Icons.Plus className="size-4 shrink-0" />
            <span className="truncate">{t('AvailableWorkouts.BrowseMoreTopics')}</span>
          </Link>
        </div>
      )}

      {!isUser && (
        <div
          className={cn(
            isDev && '__AvailableWorkoutsList_Info', // DEBUG
            'flex items-center gap-2 rounded-md border border-theme/10 p-2',
          )}
        >
          <Icons.Info className="size-6 flex-shrink-0 text-theme" />
          <p className="content-text flex-1 text-sm">
            {t.rich('AvailableWorkouts.UnauthorizedUserSuggestionMessage', {
              SigninLink: (chunks) => (
                <Button
                  variant="link"
                  onClick={(ev) => {
                    ev.preventDefault();
                    showSignInModal();
                  }}
                  className="h-auto p-0 text-sm font-normal"
                >
                  {chunks}
                </Button>
              ),
            })}
          </p>
        </div>
      )}
    </ScrollAreaInfinite>
  );
}
