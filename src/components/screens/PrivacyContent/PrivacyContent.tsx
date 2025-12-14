'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { MDXProps } from 'mdx/types';

import { capitalizeString, getErrorText, getRandomHashString } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { MaxWidthWrapper } from '@/components/shared';
import { TextPageSkeleton } from '@/components/shared/TextPageSkeleton';
import { isDev } from '@/constants';
import { defaultLocale, TLocale } from '@/i18n';

const saveScrollHash = getRandomHashString();

interface TProps {
  locale: TLocale;
}

const componentCache = new Map<string, React.ComponentType<MDXProps>>();

export function PrivacyContent({ locale }: TProps) {
  const [localeId, setLocaleId] = React.useState<TLocale>(locale || 'ru');

  const DynamicComponent = React.useMemo(() => {
    const contentId = capitalizeString(localeId);
    const cacheKey = `PrivacyContent${contentId}`;

    if (componentCache.has(cacheKey)) {
      return componentCache.get(cacheKey)!;
    }

    const component = dynamic(
      async () => {
        try {
          return await import(`./PrivacyContent${contentId}.mdx`);
        } catch (error) {
          const errMsg = getErrorText(error);
          // eslint-disable-next-line no-console
          console.error('[PrivacyContent:DynamicComponent:dynamic]', errMsg, {
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
        loading: () => <TextPageSkeleton />,
      },
    );

    componentCache.set(cacheKey, component);
    return component;
  }, [localeId]);

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
        <DynamicComponent locale={localeId} />
      </MaxWidthWrapper>
    </ScrollArea>
  );
}
