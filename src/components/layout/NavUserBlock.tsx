'use client';

import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { signOut, useSession } from 'next-auth/react';

import { clearLocalStorage, deleteAllCookies } from '@/lib/helpers';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Link } from '@/i18n/routing';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu';
import { useDeleteAccountModalContext } from '@/components/modals';
import * as Icons from '@/components/shared/Icons';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { settingsRoute } from '@/config';
import { isDev } from '@/constants';

import { SidebarMenuItem, SidebarWrapper } from './SidebarComponents';

interface TNavUserBlockProps extends TPropsWithClassName {
  onPrimary?: boolean;
  onSidebar?: boolean;
  align?: 'center' | 'end' | 'start';
  closeOuterMenu?: () => void;
}

export function NavUserBlock(props: TNavUserBlockProps) {
  const {
    // onPrimary,
    onSidebar,
    className,
    align,
    closeOuterMenu,
  } = props;
  const { data: session } = useSession();
  const user = session?.user;
  const t = useT();

  const { showDeleteAccountModal } = useDeleteAccountModalContext();

  const queryClient = useQueryClient();

  const handleSignOut = React.useCallback(
    (event: React.MouseEvent | Event) => {
      event.preventDefault();
      closeOuterMenu?.();
      // Clear react-query and local caches
      queryClient.clear();
      clearLocalStorage({ except: ['cookies-accepted'] });
      if (typeof document !== 'undefined') {
        deleteAllCookies();
      }
      signOut({
        // callbackUrl: `${window.location.origin}/`,
      });
    },
    [closeOuterMenu, queryClient],
  );

  if (!user) {
    return null;
  }

  const Wrapper = onSidebar ? SidebarWrapper : DropdownMenuContent;
  const MenuItem = onSidebar ? SidebarMenuItem : DropdownMenuItem;

  const isAdmin = user.role === 'ADMIN';

  return (
    <Wrapper
      align={align}
      className={cn(
        isDev && '__NavUserBlock', // DEBUG
        onSidebar && 'items-start',
        className,
      )}
    >
      <div
        className={cn(
          isDev && '__NavUserBlock_User', // DEBUG
          'flex max-w-full items-center justify-center gap-4 truncate',
          !onSidebar && 'px-2 py-1',
        )}
      >
        {onSidebar && (
          <UserAvatar
            user={user}
            className={cn(
              isDev && '__NavUserBlock_UserAvatar', // DEBUG
              className,
              'shrink-0 truncate rounded-full bg-theme-700/25',
              // isAdmin && 'border-2 border-solid border-lime-400', // Indicate admin role
              onSidebar && 'flex',
            )}
          />
        )}
        <div
          className={cn(
            isDev && '__NavUserBlock_UserName', // DEBUG
            'flex flex-col space-y-1 truncate leading-none',
            onSidebar && 'text-white',
          )}
        >
          <p
            className={cn('font-mediu truncatem flex items-center gap-2')}
            title={isAdmin ? 'Is Administrator' : undefined}
          >
            <span className="truncate">{user.name || 'anonymous'}</span>
            {isAdmin && <Icons.ShieldAlert className="size-4 shrink-0 opacity-50" />}
          </p>
          {user.email && <p className="truncate text-sm text-muted-foreground">{user.email}</p>}
        </div>
      </div>
      <DropdownMenuSeparator className="w-full" />
      {/*isAdmin && (
      <MenuItem asChild>
        <Link
          href="/admin"
          className="flex items-center space-x-2.5 disabled"
        >
          <Lock className="size-4" />
          <p className="text-sm">{t('NavUserAccount.Admin')}</p>
        </Link>
      </MenuItem>
      )*/}
      {!onSidebar && (
        <>
          <MenuItem asChild>
            <Link
              href="/" // dashboard
              className="disabled flex items-center space-x-2.5"
            >
              <Icons.LayoutDashboard className="size-4" />
              <span className="truncate text-sm">{t('NavUserAccount.Dashboard')}</span>
            </Link>
          </MenuItem>

          <MenuItem asChild>
            <Link href={settingsRoute} className="flex items-center space-x-2.5">
              <Icons.Settings className="size-4" />
              <span className="truncate text-sm">{t('NavUserAccount.Settings')}</span>
            </Link>
          </MenuItem>

          <MenuItem asChild onSelect={showDeleteAccountModal}>
            <div className="flex items-center space-x-2.5">
              <Icons.Trash className="size-4" />
              <span className="truncate text-sm">{t('NavUserAccount.DeleteAccount')}</span>
            </div>
          </MenuItem>

          <DropdownMenuSeparator className="w-full" />
        </>
      )}
      <div
        className={cn(
          isDev && '__NavUserBlock_UserButtons', // DEBUG
          'flex max-w-full flex-wrap gap-2',
        )}
      >
        {/* Sign Out button */}
        <MenuItem
          data-testid="__NavUserBlock_SignOut_Button"
          className={cn(
            isDev && '__NavUserBlock_SignOut_Button', // DEBUG
            !onSidebar && 'w-full',
            'cursor-pointer',
          )}
          onSelect={handleSignOut}
        >
          <div className="flex items-center space-x-2.5 truncate">
            <Icons.LogOut className="size-4" />
            <span className="truncate text-sm">{t('NavUserAccount.SignOut')}</span>
          </div>
        </MenuItem>
        {/* Delete Account button */}
        {onSidebar && (
          <MenuItem
            data-testid="__NavAuthButton_DeleteAccountButton"
            className={cn(
              isDev && '__NavAuthButton_DeleteAccountButton', // DEBUG
              'cursor-pointer truncate',
            )}
            onSelect={showDeleteAccountModal}
          >
            <div className="flex items-center space-x-2.5">
              <Icons.Trash className="size-4" />
              <span className="truncate text-sm">{t('NavUserAccount.DeleteAccount')}</span>
            </div>
          </MenuItem>
        )}
      </div>
    </Wrapper>
  );
}
