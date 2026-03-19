'use client';

import React from 'react';

import { TMediaWidth } from '@/lib/types/ui/TMediaWidth';
import { generateArray } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { ActionButton, TActionItem } from '@/components/ui/ActionButton';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { useMediaMinDevices } from '@/hooks';

import { Skeleton } from '../ui/Skeleton';

export interface TActionMenuItem extends TActionItem {
  /** Display the item in the main menu section (not in dropdown menu) */
  visibleFor?: TMediaWidth | false;
}

interface DashboardActionsProps {
  className?: string;
  actions?: TActionMenuItem[];
}

export function DashboardActions(props: DashboardActionsProps) {
  const t = useT();

  const { className, actions } = props;
  const [isDropdownOpen, setDropdownOpen] = React.useState(false);
  const { mediaWidths } = useMediaMinDevices();
  const closeAndRun = React.useCallback((func?: () => void) => {
    setDropdownOpen(false);
    if (func) {
      func();
    }
  }, []);
  const visibleActions = React.useMemo(
    () =>
      actions
        ?.map(({ visibleFor, hidden, onClick, ...actionProps }) => {
          if (!hidden && visibleFor && mediaWidths.includes(visibleFor)) {
            const { id } = actionProps;
            return <ActionButton key={id} onClick={() => closeAndRun(onClick)} {...actionProps} />;
          }
        })
        .filter(Boolean),
    [actions, closeAndRun, mediaWidths],
  );
  const menuActions = React.useMemo(
    () =>
      actions
        ?.map(({ visibleFor, hidden, onClick, ...actionProps }) => {
          if (!hidden && (!visibleFor || !mediaWidths.includes(visibleFor))) {
            const { id } = actionProps;
            return <ActionButton key={id} onClick={() => closeAndRun(onClick)} {...actionProps} />;
          }
        })
        .filter(Boolean),
    [actions, closeAndRun, mediaWidths],
  );
  if (!actions || !mediaWidths?.length) {
    return (
      <div
        className={cn(
          isDev && '__DashboardActions_Skeleton', // DEBUG
          'flex flex-wrap gap-1',
          className,
        )}
      >
        {generateArray(3).map((n) => (
          <Skeleton key={n} className="h-10 w-24" />
        ))}
      </div>
    );
  }
  if (!menuActions?.length) {
    return (
      <div
        className={cn(
          isDev && '__DashboardActions', // DEBUG
          'flex flex-wrap gap-1',
          className,
        )}
      >
        {visibleActions}
      </div>
    );
  }
  return (
    <div
      className={cn(
        isDev && '__DashboardActions_Wrapper', // DEBUG
        'flex flex-wrap gap-2',
        className,
      )}
    >
      {visibleActions}
      <DropdownMenu open={isDropdownOpen} onOpenChange={setDropdownOpen}>
        {(() => {
          return (
            <DropdownMenuTrigger
              asChild
              aria-label={t('ShowMenu')}
              className={cn(
                isDev && '__AllowedUsersPage_DropdownMenuTrigger', // DEBUG
              )}
            >
              <Button
                size="icon"
                variant="ghost"
                title={t('ShowMenu')}
                className={cn(
                  isDev && '__AllowedUsersPage_DropdownMenuToggle', // DEBUG
                  'active:bg-theme active:text-theme-foreground',
                  'ring-offset-background',
                  'focus:ring-1',
                  'focus:ring-ring',
                  // 'focus:ring-offset-1',
                  'data-[state=open]:bg-theme/20',
                  'data-[state=open]:ring-2',
                  // 'data-[state=open]:ring-offset-1',
                  'data-[state=open]:ring-theme/50',
                )}
              >
                <Icons.MenuVertical className="size-5 transition-all" />
                <span className="sr-only">{t('ShowMenu')}</span>
              </Button>
            </DropdownMenuTrigger>
          );
        })()}
        <DropdownMenuContent
          align="end"
          className={cn(
            isDev && '__DashboardActions_DropdownMenuContent', // DEBUG
            // 'mt-2',
            'rounded-lg bg-popover',
            'flex w-full flex-col gap-1',
            // 'px-1',
          )}
          viewportClassName={cn(
            isDev && '__DashboardActions_DropdownMenuContent_Viewport', // DEBUG
            '[&>div]:gap-1',
          )}
        >
          {menuActions}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
