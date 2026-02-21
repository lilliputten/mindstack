'use client';

import { useSession } from 'next-auth/react';

import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  DeleteAccountModalProvider,
  useSignInModalContext,
  // useDeleteAccountModalContext,
} from '@/components/modals';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';

import { NavUserAccount } from './NavUserAccount';
import { NavUserBlock } from './NavUserBlock';

interface TNavAuthButtonProps extends TPropsWithClassName {
  onPrimary?: boolean;
  onSidebar?: boolean;
  isUser?: boolean;
  onClickEffect?: () => void;
}

export function NavUserAuthButton(props: TNavAuthButtonProps) {
  const { onPrimary, onSidebar, isUser, className, onClickEffect } = props;
  const { data: session, status: sessionStatus } = useSession();
  const { showSignInModal } = useSignInModalContext();
  const t = useT();
  const hasValidUser = !!isUser && !!session && sessionStatus === 'authenticated';
  return (
    <DeleteAccountModalProvider>
      <div
        className={cn(
          isDev && '__NavAuthButton', // DEBUG
          'flex items-center truncate',
          onSidebar && 'flex w-full justify-start gap-2',
          className,
        )}
      >
        {hasValidUser && onSidebar ? (
          <NavUserBlock onPrimary={onPrimary} onSidebar={onSidebar} onClickEffect={onClickEffect} />
        ) : hasValidUser && !onSidebar ? (
          <NavUserAccount
            onPrimary={onPrimary}
            onSidebar={onSidebar}
            onClickEffect={onClickEffect}
          />
        ) : sessionStatus === 'loading' ? (
          <Skeleton className="h-9 w-28 rounded-full lg:flex" />
        ) : (
          <Button
            data-testid="__NavAuthButton_SignInButton"
            className={cn(
              isDev && '__NavAuthButton_SignInButton', // DEBUG
              'flex gap-2 truncate px-2',
              'text-theme-foreground',
              'hover:bg-theme-400/50',
              'hover:border-white/10',
              onSidebar && 'hover:bg-white hover:text-theme-700',
            )}
            variant="ghostOnTheme" // {onPrimary && !onSidebar ? 'ghostOnTheme' : 'ghost'}
            // size="sm"
            onClick={() => {
              onClickEffect?.();
              showSignInModal();
            }}
          >
            <span className="truncate">{t('NavAuthButton.SignIn')}</span>
            <Icons.ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </DeleteAccountModalProvider>
  );
}
