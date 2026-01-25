'use client';

import React from 'react';

import { getRandomHashString } from '@/lib/helpers';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { InfoVisualBlock } from '@/components/blocks/InfoVisualBlock';
import { AppIntroBlock } from '@/components/content/AppIntroBlock';
import { isDev } from '@/constants';

const saveScrollHash = getRandomHashString();

export function InfoScreen(props: TPropsWithClassName & { isLogged: boolean }) {
  const { className } = props;
  const t = useT();
  return (
    <ScrollArea
      saveScrollKey="InfoScreen"
      saveScrollHash={saveScrollHash}
      className={cn(
        isDev && '__InfoScreen_Scroll', // DEBUG
        'flex flex-1 flex-col overflow-hidden',
        'bg-theme-500/5',
        className,
      )}
      viewportClassName={cn(
        isDev && '__InfoScreen_ScrollViewport', // DEBUG
        'flex flex-1 flex-col',
        'bg-decorative-gradient',
        '[&>div]:flex-col [&>div]:p-6 [&>div]:flex-1 [&>div]:justify-center [&>div]:items-center',
      )}
    >
      <InfoVisualBlock className="z-10" />
      <div
        className={cn(
          isDev && '__InfoScreen_IntroText', // DEBUG
          className,
          'flex flex-col gap-4',
          'max-w-xl',
          'w-full',
          'content-text',
        )}
      >
        <h1 className="text-center">{t('NavLinks.Information')}</h1>
        <AppIntroBlock />
      </div>
    </ScrollArea>
  );
}
