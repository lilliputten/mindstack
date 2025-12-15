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
import { contactEmail, effectivePrivacyDate, publicAddr } from '@/config';
import { isDev } from '@/constants';
import { defaultLocale, TLocale } from '@/i18n';

const saveScrollHash = getRandomHashString();

const contentCache = new Map<string, React.ComponentType<MDXProps>>();

interface TProps {
  locale: TLocale;
}

function PrivacyContentSuspense(props: DynamicOptionsLoadingProps) {
  const {
    error, // An Error object if the component failed to load, otherwise null.
    retry, // A function you can call to manually attempt to reload the component if an error occurred.
    // isLoading, // A boolean indicating if the component is currently loading.
    // pastDelay, // A boolean that becomes true if the import is still loading after a specified delay (which can be configured in the dynamic options).
    // timedOut, // A boolean that becomes true if the import request exceeded the specified timeout duration.
  } = props;
  if (error) {
    return (
      <PageError
        className={cn(
          isDev && '__PrivacyContentSuspense_error', // DEBUG
        )}
        error={error}
        reset={retry}
      />
    );
  }
  return (
    <TextPageSkeleton
      className={cn(
        isDev && '__PrivacyContentSuspense_loading', // DEBUG
      )}
    />
  );
}

export function PrivacyContent({ locale }: TProps) {
  const [localeId, setLocaleId] = React.useState<TLocale>(locale || defaultLocale);

  // Dynamically load the appropriate  language component
  const DynamicComponent = React.useMemo(() => {
    const contentId = capitalizeString(localeId);
    const cacheKey = `PrivacyContent${contentId}`;
    if (contentCache.has(cacheKey)) {
      return contentCache.get(cacheKey)!;
    }
    const component = dynamic(
      async () => {
        try {
          /* // DEBUG
           * if (isDev) {
           *   await new Promise((r) => setTimeout(r, 3000));
           * }
           */
          return await import(`./PrivacyContent${contentId}.mdx`);
        } catch (error) {
          const errMsg = getErrorText(error);
          // eslint-disable-next-line no-console
          console.error('[PrivacyContent:DynamicComponent]', errMsg, {
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
        loading: PrivacyContentSuspense,
      },
    );
    contentCache.set(cacheKey, component);
    return component;
  }, [localeId]);

  const effectiveDate = formatDate(effectivePrivacyDate, localeId);
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
      saveScrollKey="PrivacyContent"
      saveScrollHash={saveScrollHash}
      className={cn(
        isDev && '__PrivacyContent_Scroll', // DEBUG
        'flex flex-1 flex-col overflow-hidden',
        'bg-theme-500/5',
      )}
      viewportClassName={cn(
        isDev && '__PrivacyContent_ScrollViewport', // DEBUG
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
