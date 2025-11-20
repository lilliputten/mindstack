'use client';

import React from 'react';
import Link from 'next/link';

import { myTopicsRoute, rootRoute } from '@/config/routesConfig';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/Button';
import { PageEmpty } from '@/components/pages/shared';
import * as Icons from '@/components/shared/Icons';
import { PageError } from '@/components/shared/PageError';
import { isDev } from '@/constants';
import { TopicsManageScopeIds, TTopicsManageScopeId } from '@/contexts/TopicsContext';
import { useAvailableTopicsByScope, useGoBack } from '@/hooks';

import { AvailableTopicsListPage } from './AvailableTopicsListPage';
import { ContentSkeleton } from './ContentSkeleton';

/** Used for tests below */
// const now = new Date();

export function AvailableTopicsListWrapper() {
  const manageScope: TTopicsManageScopeId = TopicsManageScopeIds.AVAILABLE_TOPICS;

  const availableTopicsQuery = useAvailableTopicsByScope({
    manageScope,
    // includeWorkout: true,
    // DEBUG: Test search options
    // searchText: 'test',
    // hasWorkoutStats: true,
    // hasActiveWorkouts: true,
    // hasQuestions: false,
    // minCreatedAt: createDateWithDaysDiff(-5, now),
    // maxCreatedAt: createDateWithDaysDiff(-5, now),
    // minUpdatedAt: createDateWithDaysDiff(-5, now),
    // maxUpdatedAt: createDateWithDaysDiff(-5, now),
    // langCode: 'za', // Exact language conde
    // langName: 'Zhuang; Chuang', // Exact language name
    // searchLang: 'Chua', // Fuzzy language name opr code
  });
  const { isFetched, isError, refetch, error, hasTopics } = availableTopicsQuery;

  /* console.log('[AvailableTopicsListWrapper:DEBUG]', {
   *   allTopics,
   * });
   */

  const goBack = useGoBack(rootRoute);

  if (!isFetched) {
    return <ContentSkeleton className="px-6" />;
  }

  if (isError) {
    return (
      <PageError
        className={cn(
          isDev && '__ManageTopicsListWrapper_Error', // DEBUG
          'my-0',
        )}
        error={error || 'Error loading available topics data'}
        reset={refetch}
        // extraActions={extraActions}
      />
    );
  }

  if (!hasTopics) {
    return (
      <PageEmpty
        className="mx-6 flex-1"
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
    );
  }

  return (
    <AvailableTopicsListPage
      availableTopicsQuery={availableTopicsQuery}
      manageScope={manageScope}
    />
  );
}
