'use client';

import React from 'react';
import dynamic, { DynamicOptionsLoadingProps } from 'next/dynamic';
import { MDXProps } from 'mdx/types';
import ReactDOMServer from 'react-dom/server';

import { capitalizeString, getErrorText, getRandomHashString } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { ContentFooter, MaxWidthWrapper, PageError } from '@/components/shared';
import * as Icons from '@/components/shared/Icons';
import { TextPageSkeleton } from '@/components/shared/TextPageSkeleton';
import { contactEmail, publicAddr, versionInfo } from '@/config';
import { isDev } from '@/constants';
import { defaultLocale, TLocale } from '@/i18n';

const saveScrollHash = getRandomHashString();

interface TProps {
  locale: TLocale;
}

function DocsContentSuspense(props: DynamicOptionsLoadingProps) {
  const { error, retry } = props;
  if (error) {
    return (
      <PageError
        className={cn(isDev && '__DocsContentSuspense_error')}
        error={error}
        reset={retry}
      />
    );
  }
  return <TextPageSkeleton className={cn(isDev && '__DocsContentSuspense_loading')} />;
}

export function DocsContent({ locale }: TProps) {
  const [localeId, setLocaleId] = React.useState<TLocale>(locale || defaultLocale);

  const componentCache = React.useMemo(() => new Map<string, React.ComponentType<MDXProps>>(), []);

  const DynamicComponent = React.useMemo(() => {
    const contentId = capitalizeString(localeId);
    const cacheKey = `DocsContent${contentId}`;
    if (componentCache.has(cacheKey)) {
      return componentCache.get(cacheKey)!;
    }
    const component = dynamic(
      async () => {
        try {
          return await import(`./DocsContent${contentId}.mdx`);
        } catch (error) {
          const errMsg = getErrorText(error);
          // eslint-disable-next-line no-console
          console.error('[DocsContent:DynamicComponent]', errMsg, {
            error,
            localeId,
            contentId,
          });
          debugger; // eslint-disable-line no-debugger
          if (localeId !== defaultLocale) {
            setLocaleId(defaultLocale);
          }
          throw error;
        }
      },
      {
        ssr: true,
        loading: DocsContentSuspense,
      },
    );
    componentCache.set(cacheKey, component);
    return component;
  }, [localeId, componentCache]);

  const emailHtmlLink = ReactDOMServer.renderToString(
    <a href={`mailto:${contactEmail}`}>{contactEmail}</a>,
  );
  const websiteHtmlLink = ReactDOMServer.renderToString(
    <a href={publicAddr} target="_blank" rel="noreferrer">
      {publicAddr} <Icons.ExternalLink className="inline size-3" />
    </a>,
  );

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
        <DynamicComponent
          emailHtmlLink={emailHtmlLink}
          websiteHtmlLink={websiteHtmlLink}
          versionInfo={versionInfo}
        />
      </MaxWidthWrapper>
      <ContentFooter />
    </ScrollArea>
  );
}
