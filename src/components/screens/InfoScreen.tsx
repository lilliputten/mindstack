'use client';

import React from 'react';

import { getRandomHashString } from '@/lib/helpers';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { InfoVisualBlock } from '@/components/blocks/InfoVisualBlock';
import { AppIntroBlock } from '@/components/content/AppIntroBlock';
import { isDev } from '@/constants';

const saveScrollHash = getRandomHashString();

export function InfoScreen(props: TPropsWithClassName & { isLogged: boolean }) {
  const { className } = props;
  return (
    <ScrollArea
      // disableScroll
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
          isDev && '__IntroText', // DEBUG
          className,
          'flex flex-col gap-4',
          'max-w-xl',
          'w-full',
          'text-content',
          // 'text-center', // Only for small texts
        )}
      >
        <h1 className="text-center">Information</h1>
        <AppIntroBlock />
        {/*
        {generateArray(20).map((n) => (
          <p key={n}>Text {n + 1}</p>
        ))}
        */}
      </div>
    </ScrollArea>
  );
}
