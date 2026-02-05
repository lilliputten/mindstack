'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { Link, useT } from '@/i18n';
import { buttonVariants } from '@/components/ui/Button';
import * as Icons from '@/components/shared/Icons';
import { availableTopicsRoute, isDev, myTopicsRoute, TRoutePath } from '@/config';
import { useLandingPageContext } from '@/contexts/LandingPageContext';
import { useSessionData } from '@/hooks';

import { RecentTopicsSectionItem } from './RecentTopicsSectionItem';

export function RecentTopicsSection() {
  const t = useT();
  const { user /* loading: isUserLoading */ } = useSessionData();
  const { recentTopics } = useLandingPageContext();
  const topics = recentTopics.slice(0, 3);
  return (
    <section
      className={cn(
        isDev && '__RecentTopicsSection', // DEBUG
        'flex flex-col gap-6 py-8 pb-8',
      )}
    >
      <div className="flex max-w-2xl flex-col">
        <h2 className="content-truncate mb-4 mt-0 text-3xl font-semibold leading-tight tracking-tight lg:text-4xl">
          <div className="content-truncate text-gr2 py-2">
            {t('Landing.RecentTopicsSection.Title')}
          </div>
        </h2>
        <p className="content-truncate">{t('Landing.RecentTopicsSection.Description')}</p>
      </div>
      {true && !!topics?.length ? (
        <div
          className={cn(
            isDev && '__RecentTopicsSection_Topics', // DEBUG
            'flex flex-col gap-4',
          )}
        >
          <h3 className="content-truncate mb-3 mt-0 text-xl font-semibold text-theme">
            {t('Landing.RecentTopicsSection.IntroduceTopics')}
          </h3>
          <div
            className={cn(
              'mt-0 grid gap-2 gap-x-6',
              // Render in grid only if there are more than one topic
              // topics.length > 1 && 'lg:grid-cols-2',
            )}
          >
            {topics.map((topic) => (
              <RecentTopicsSectionItem
                key={topic.id}
                topic={topic}
                className={cn(
                  isDev && '__RecentTopicsSection_Topic', // DEBUG
                )}
              />
            ))}
          </div>
        </div>
      ) : (
        <p className="content-truncate">{t('Landing.RecentTopicsSection.NoTopics')}</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={availableTopicsRoute}
          className={cn(
            buttonVariants({ variant: 'gr1' }),
            'content-truncate flex items-center gap-2',
          )}
        >
          <Icons.Topics className="size-4 shrink-0 opacity-50" />
          <span className="truncate">{t('Landing.RecentTopicsSection.ViewAllTopicsText')}</span>
        </Link>
        <Link
          href={`${myTopicsRoute}/add` as TRoutePath}
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'content-truncate flex items-center gap-2',
            !user?.id && 'disabled',
          )}
        >
          <Icons.Plus className="size-4 shrink-0 opacity-50" />
          <span className="truncate">{t('Landing.RecentTopicsSection.SuggestTopic')}</span>
        </Link>
      </div>
    </section>
  );
}
