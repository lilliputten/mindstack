'use client';

import { useContext } from 'react';
import { useSession } from 'next-auth/react';

import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ModalContext } from '@/components/modals/providers';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { useT } from '@/i18n';

import { NavUserAccount } from './NavUserAccount';
import { NavUserBlock } from './NavUserBlock';

interface TNavAuthButtonProps extends TPropsWithClassName {
  onPrimary?: boolean;
  onSidebar?: boolean;
  isUser?: boolean;
}

export function NavUserAuthButton(props: TNavAuthButtonProps) {
  const { onPrimary, onSidebar, isUser, className } = props;
  const { data: session, status } = useSession();
  const { setVisible: setSignInModalVisible } = useContext(ModalContext);
  const t = useT('NavAuthButton');
  const hasValidUser = !!isUser && !!session && status === 'authenticated';
  return (
    <div
      className={cn(
        isDev && '__NavAuthButton', // DEBUG
        'flex items-center truncate',
        onSidebar && 'flex w-full justify-start gap-2',
        className,
      )}
    >
      {hasValidUser && onSidebar ? (
        <NavUserBlock onPrimary={onPrimary} onSidebar={onSidebar} />
      ) : hasValidUser && !onSidebar ? (
        <NavUserAccount onPrimary={onPrimary} onSidebar={onSidebar} />
      ) : status === 'loading' ? (
        <Skeleton className="h-9 w-28 rounded-full lg:flex" />
      ) : (
        <Button
          className={cn(
            'flex gap-2 truncate px-2',
            onSidebar && 'hover:bg-theme-500 hover:text-white',
          )}
          variant={onPrimary && !onSidebar ? 'ghostOnTheme' : 'ghost'}
          size="sm"
          onClick={() => setSignInModalVisible(true)}
        >
          <span className="truncate">{t('sign-in')}</span>
          <Icons.ArrowRight className="size-4" />
        </Button>
      )}
    </div>
  );
}
