'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';

import { formatDate, getRandomHashString } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { MarkdownText } from '@/components/ui/MarkdownText';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { ContentFooter, MaxWidthWrapper, PageError } from '@/components/shared';
import { TextPageSkeleton } from '@/components/shared/TextPageSkeleton';
import { contactEmail, effectiveTermsDate, publicAddr } from '@/config';
import { isDev, longStaleTime } from '@/constants';
import { defaultLocale, TLocale } from '@/i18n';

import { getContent } from './getContent';

const saveScrollHash = getRandomHashString();

const staleTime = longStaleTime;

interface TProps {
  locale: TLocale;
}

export function TermsContent(props: TProps) {
  const { locale = defaultLocale } = props;

  const contentQuery = useQuery({
    queryKey: ['TermsContent', locale],
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
      effectiveDate: formatDate(effectiveTermsDate, locale),
      contactEmail,
      publicAddr,
    }),
    [locale],
  );

  if (error) {
    return (
      <PageError
        className={cn(
          isDev && '__TermsContent_Error', // DEBUG
        )}
        error={error}
      />
    );
  }
  if (!isReady) {
    return <TextPageSkeleton className={cn(isDev && '__TermsContent_Loading')} />;
  }

  return (
    <ScrollArea
      saveScrollKey="TermsContent"
      saveScrollHash={saveScrollHash}
      className={cn(
        isDev && '__TermsContent_Scroll',
        'flex flex-1 flex-col overflow-hidden',
        'bg-theme-500/5',
      )}
      viewportClassName={cn(
        isDev && '__TermsContent_ScrollViewport',
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
