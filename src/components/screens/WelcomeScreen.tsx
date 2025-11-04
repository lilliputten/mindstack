'use client';

import React from 'react';

import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { SignInBlock } from '@/components/blocks/SignInBlock';
import { WelcomeVisualBlock } from '@/components/blocks/WelcomeVisualBlock';
import { UseScrollableLayout } from '@/components/shared/ScrollableLayout';
import { isDev } from '@/constants';

import { ScrollArea } from '../ui/ScrollArea';

export function WelcomeScreen(props: TPropsWithClassName & { isLogged: boolean }) {
  const { className, isLogged } = props;
  return (
    <div
      className={cn(
        isDev && '__WelcomeScreen', // DEBUG
        className,
        'lg:layout-follow flex flex-1 flex-col items-stretch justify-stretch overflow-auto lg:flex-row lg:overflow-hidden',
      )}
    >
      <UseScrollableLayout type="clippable" />
      <div
        className={cn(
          isDev && '__WelcomeScreen_Info', // DEBUG
          'relative m-6 flex flex-1 flex-col rounded-xl',
          'bg-theme-500/10',
          'lg:overflow-auto',
        )}
      >
        <div
          className={cn(
            isDev && '__WelcomeScreen_Gradient', // DEBUG
            'absolute bottom-0 left-0 right-0 top-0 overflow-hidden rounded-xl',
            'bg-decorative-gradient',
          )}
        />
        <WelcomeVisualBlock className="z-10" />
      </div>
      {!isLogged && (
        <ScrollArea
          className={cn(
            isDev && '__WelcomeScreen_Scroll', // DEBUG
            'flex-1 overflow-visible',
          )}
          viewportClassName={cn(
            isDev && '__WelcomeScreen_ScrollViewport', // DEBUG
            '[&>div]:!flex [&>div]:flex-col [&>div]:flex-1',
          )}
        >
          <div
            className={cn(
              isDev && '__WelcomeScreen_SignIn', // DEBUG
              'flex flex-col lg:mr-6',
              // 'lg:overflow-auto',
            )}
          >
            <SignInBlock />
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
