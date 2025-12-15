'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';

import { getRandomHashString } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { MarkdownText } from '@/components/ui/MarkdownText';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { ContentFooter, MaxWidthWrapper, PageError } from '@/components/shared';
import { TextPageSkeleton } from '@/components/shared/TextPageSkeleton';
import {
  contactEmail,
  cookiesRoute,
  docsRoute,
  privacyRoute,
  publicAddr,
  termsRoute,
  versionInfo,
} from '@/config';
import { isDev, longStaleTime } from '@/constants';
import { defaultLocale, TLocale } from '@/i18n';

import { getContent } from './getContent';

const saveScrollHash = getRandomHashString();

interface TProps {
  locale: TLocale;
}

const staleTime = longStaleTime;

export function DocsContent(props: TProps) {
  const { locale = defaultLocale } = props;

  const contentQuery = useQuery({
    queryKey: ['DocsContent', locale],
    queryFn: async () => {
      if (isDev) {
        await new Promise((r) => setTimeout(r, 1000));
      }
      const res = await getContent(locale);
      return res.content;
    },
    staleTime,
  });

  const { data, isLoading, isFetched, error } = contentQuery;
  const isReady = !isLoading && isFetched;

  const vars = React.useMemo(
    () => ({
      docsRoute,
      contactEmail,
      publicAddr,
      cookiesRoute,
      privacyRoute,
      termsRoute,
      versionInfo,
    }),
    [],
  );

  if (error) {
    return (
      <PageError
        className={cn(
          isDev && '__DocsContent_Error', // DEBUG
        )}
        error={error}
      />
    );
  }
  if (!isReady) {
    return <TextPageSkeleton className={cn(isDev && '__DocsContent_Loading')} />;
  }

  return (
    <ScrollArea
      saveScrollKey="DocsContent"
      saveScrollHash={saveScrollHash}
      className={cn(
        isDev && '__DocsContent_Scroll',
        'flex flex-1 flex-col overflow-hidden',
        'bg-theme-500/5',
      )}
      viewportClassName={cn(
        isDev && '__DocsContent_ScrollViewport',
        'flex flex-1 flex-col',
        'bg-decorative-gradient',
        '[&>div]:flex-col [&>div]:flex-1 [&>div]:justify-center [&>div]:items-center',
      )}
    >
      <MaxWidthWrapper className="text-content flex flex-col p-6">
        <MarkdownText vars={vars}>{data || ''}</MarkdownText>
      </MaxWidthWrapper>
      <ContentFooter />
    </ScrollArea>
  );
}
