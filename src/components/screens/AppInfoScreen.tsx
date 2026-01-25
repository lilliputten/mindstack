'use client';

import React from 'react';

import { getRandomHashString } from '@/lib/helpers';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { AppInfoVisualBlock } from '@/components/blocks/AppInfoVisualBlock';
import { AppIntroBlock } from '@/components/content/AppIntroBlock';
import { isDev } from '@/constants';

const saveScrollHash = getRandomHashString();

export function AppInfoScreen(props: TPropsWithClassName & { isLogged: boolean }) {
  const { className } = props;
  const t = useT();
  return (
    <ScrollArea
      saveScrollKey="AppInfoScreen"
      saveScrollHash={saveScrollHash}
      className={cn(
        isDev && '__AppInfoScreen_Scroll', // DEBUG
        'flex flex-1 flex-col overflow-hidden',
        'bg-theme-500/5',
        className,
      )}
      viewportClassName={cn(
        isDev && '__AppInfoScreen_ScrollViewport', // DEBUG
        'flex flex-1 flex-col',
        'bg-decorative-gradient',
        '[&>div]:flex-col [&>div]:p-6 [&>div]:flex-1 [&>div]:justify-center [&>div]:items-center',
      )}
    >
      <AppInfoVisualBlock className="z-10" />
      <div
        className={cn(
          isDev && '__AppInfoScreen_IntroText', // DEBUG
          className,
          'flex flex-col gap-4',
          'w-full max-w-xl',
        )}
      >
        <h2 className="pt-6 text-center text-3xl text-theme">{t('NavLinks.About')}</h2>
        <AppIntroBlock />
      </div>
    </ScrollArea>
  );
}
