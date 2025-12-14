'use client';

import React from 'react';
import { useSession } from 'next-auth/react';

import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import * as Icons from '@/components/shared/Icons';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { isDev } from '@/constants';

import { NavUserBlock } from './NavUserBlock';

interface TNavUserAccountProps extends TPropsWithClassName {
  onPrimary?: boolean;
  onSidebar?: boolean;
}

export function NavUserAccount(props: TNavUserAccountProps) {
  const { onPrimary, onSidebar, className } = props;
  const { data: session } = useSession();
  const user = session?.user;

  const [open, setOpen] = React.useState(false);
  const closeOuterMenu = React.useCallback(() => setOpen(false), []);

  if (!user) {
    return <div className="size-8 animate-pulse rounded-full border bg-muted" />;
  }

  const isAdmin = user.role === 'ADMIN';

  return (
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
          'truncate',
        )}
      >
        <UserAvatar
          user={user}
          className={cn(
            isDev && '__NavUserAccount_UserAvatar', // DEBUG
            // 'size-8 rounded-full bg-theme-700/25',
            // isAdmin && 'border-2 border-solid border-lime-400', // Indicate admin role
            // onSidebar && 'flex',
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
        closeOuterMenu={closeOuterMenu}
      />
    </DropdownMenu>
  );
}
