'use client';

import React from 'react';
import dynamic, { DynamicOptionsLoadingProps } from 'next/dynamic';
import { MDXProps } from 'mdx/types';
import ReactDOMServer from 'react-dom/server';

import { capitalizeString, formatDate, getErrorText, getRandomHashString } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { ContentFooter, MaxWidthWrapper, PageError } from '@/components/shared';
import * as Icons from '@/components/shared/Icons';
import { TextPageSkeleton } from '@/components/shared/TextPageSkeleton';
import { contactEmail, effectiveTermsDate, publicAddr } from '@/config';
import { isDev } from '@/constants';
import { defaultLocale, TLocale } from '@/i18n';

const saveScrollHash = getRandomHashString();

interface TProps {
  locale: TLocale;
}

function TermsContentSuspense(props: DynamicOptionsLoadingProps) {
  const { error, retry } = props;
  if (error) {
    return (
      <PageError
        className={cn(isDev && '__TermsContentSuspense_error')}
        error={error}
        reset={retry}
      />
    );
  }
  return <TextPageSkeleton className={cn(isDev && '__TermsContentSuspense_loading')} />;
}

export function TermsContent({ locale }: TProps) {
  const [localeId, setLocaleId] = React.useState<TLocale>(locale || defaultLocale);

  const componentCache = React.useMemo(() => new Map<string, React.ComponentType<MDXProps>>(), []);

  // Dynamically load the appropriate  language component
  const DynamicComponent = React.useMemo(() => {
    const contentId = capitalizeString(localeId);
    const cacheKey = `TermsContent${contentId}`;
    if (componentCache.has(cacheKey)) {
      return componentCache.get(cacheKey)!;
    }
    const component = dynamic(
      async () => {
        try {
          return await import(`./TermsContent${contentId}.mdx`);
        } catch (error) {
          const errMsg = getErrorText(error);
          // eslint-disable-next-line no-console
          console.error('[TermsContent:DynamicComponent]', errMsg, {
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
        loading: TermsContentSuspense,
      },
    );
    componentCache.set(cacheKey, component);
    return component;
  }, [localeId, componentCache]);

  const effectiveDate = formatDate(effectiveTermsDate, localeId);
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
        <DynamicComponent
          effectiveDate={effectiveDate}
          emailHtmlLink={emailHtmlLink}
          websiteHtmlLink={websiteHtmlLink}
        />
      </MaxWidthWrapper>
      <ContentFooter />
    </ScrollArea>
  );
}
