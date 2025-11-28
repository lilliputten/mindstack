'use client';

import React from 'react';

import { getRandomHashString } from '@/lib/helpers';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { SignInBlock } from '@/components/blocks/SignInBlock';
import { WelcomeVisualBlock } from '@/components/blocks/WelcomeVisualBlock';
import { isDev } from '@/constants';
import { useMediaMinDevices } from '@/hooks';

const saveScrollHash = getRandomHashString();
const saveVisualScrollHash = getRandomHashString();
const saveSignInScrollHash = getRandomHashString();

export function WelcomeScreen(props: TPropsWithClassName & { isLogged: boolean }) {
  const { className, isLogged } = props;
  const { inited: isMediaInited, mediaWidths } = useMediaMinDevices();
  const isLg = isMediaInited && mediaWidths.includes('lg');
  return (
    <ScrollArea
      // suppressHydrationWarning
      disableScroll={isLg}
      saveScrollKey="WelcomeScreen"
      saveScrollHash={saveScrollHash}
      className={cn(
        isDev && '__WelcomeScreen_Scroll', // DEBUG
        'bg-theme-500/5',
        'flex flex-1 flex-col items-center',
        className,
      )}
      viewportClassName={cn(
        isDev && '__WelcomeScreen_ScrollViewport', // DEBUG
        'flex flex-1 flex-col',
        '[&>div]:items-stretch',
        '[&>div]:justify-stretch',
        '[&>div]:flex-col [&>div]:flex-1 [&>div]:justify-center [&>div]:items-center',
        '[&>div]:lg:flex-row',
        '[&>div]:lg:overflow-hidden',
        '[&>div]:lg:items-stretch',
        'lg:items-stretch',
        'max-w-6xl',
      )}
    >
      <ScrollArea
        saveScrollKey="WelcomeScreen_Visual_Scroll"
        saveScrollHash={saveVisualScrollHash}
        className={cn(
          isDev && '__WelcomeScreen_Visual_Scroll', // DEBUG
          'flex-1',
          'w-full',
          'p-6',
        )}
        viewportClassName={cn(
          isDev && '__WelcomeScreen_Visual_ScrollViewport', // DEBUG
          'decorative-card !rounded-xl shadow-sm',
          'border border-theme-600/20',
          'flex-1 flex',
          '[&>div]:!flex [&>div]:flex-col [&>div]:flex-1',
        )}
      >
        <WelcomeVisualBlock
          className={cn(
            isDev && '__WelcomeScreen_Visual_Content', // DEBUG
            'w-full',
            'bg-decorative-gradient',
          )}
        />
      </ScrollArea>
      {!isLogged && (
        <ScrollArea
          saveScrollKey="WelcomeScreen_SignIn_Scroll"
          saveScrollHash={saveSignInScrollHash}
          className={cn(
            isDev && '__WelcomeScreen_SignIn_Scroll', // DEBUG
            'flex-1 overflow-visible',
          )}
          viewportClassName={cn(
            isDev && '__WelcomeScreen_SignIn_ScrollViewport', // DEBUG
            'flex-1 flex',
            '[&>div]:!flex [&>div]:flex-col [&>div]:flex-1',
          )}
        >
          <SignInBlock
            className={cn(
              isDev && '__WelcomeScreen_SignIn_Content', // DEBUG
            )}
          />
        </ScrollArea>
      )}
    </ScrollArea>
  );
}
