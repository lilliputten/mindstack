'use client';

import React from 'react';
import { useSession } from 'next-auth/react';

import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import { Icons } from '@/components/shared';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { isDev } from '@/constants';

import { DeleteAccountModalProvider } from '../modals/DeleteAccountModalProvider';
import { NavUserBlock } from './NavUserBlock';

interface TNavUserAccountProps extends TPropsWithClassName {
  onPrimary?: boolean;
  onSidebar?: boolean;
  onClickEffect?: () => void;
}

export function NavUserAccount(props: TNavUserAccountProps) {
  const { onPrimary, onSidebar, className, onClickEffect } = props;
  const { data: session } = useSession();
  const user = session?.user;

  const [open, setOpen] = React.useState(false);
  const closeOuterMenu = React.useCallback(() => setOpen(false), []);

  if (!user) {
    return <div className="size-8 animate-pulse rounded-full border bg-muted" />;
  }

  const isAdmin = user.role === 'ADMIN';

  return (
    <DeleteAccountModalProvider>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          className={cn(
            isDev && '__NavUserAccount_DropdownMenuTrigger', // DEBUG
            className,
            'rounded-full',
            'transition-all',
            'text-theme-foreground/80',
            'opacity-100',
            'hover:opacity-80',
          )}
        >
          <UserAvatar
            user={user}
            className={cn(
              isDev && '__NavUserAccount_UserAvatar', // DEBUG
              className,
            )}
          />
          {onSidebar && (
            <span className="flex items-center gap-2">
              <span
                className="flex gap-2 font-medium"
                title={isAdmin ? 'Is Administrator' : undefined}
              >
                {user.name || 'anonymous'}
                {isAdmin && <Icons.ShieldAlert className="size-4 opacity-50" />}
              </span>
              {user.email && <span className="truncate text-muted-foreground">{user.email}</span>}
            </span>
          )}
        </DropdownMenuTrigger>
        <NavUserBlock
          align="end"
          onPrimary={onPrimary}
          onSidebar={onSidebar}
          onClickEffect={() => {
            onClickEffect?.();
            closeOuterMenu();
          }}
        />
      </DropdownMenu>
    </DeleteAccountModalProvider>
  );
}
