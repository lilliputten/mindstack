'use client';

import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { useT } from '@/i18n';

import { NavModeToggleBlock } from './NavModeToggleBlock';

interface TNavModeToggleProps extends TPropsWithClassName {
  onPrimary?: boolean;
  onSidebar?: boolean;
}

export function NavModeToggle(props: TNavModeToggleProps) {
  const { onPrimary, onSidebar, className } = props;
  const t = useT('NavModeToggle');
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild aria-label={t('label')}>
        <Button
          variant={onPrimary ? 'ghostOnTheme' : 'ghost'}
          size="sm"
          data-testid="__NavModeToggle"
          className={cn(
            isDev && '__NavModeToggle', // DEBUG
            'flex items-center',
            'relative size-10',
            'hover:bg-theme-400/50',
            'hover:border-white/10',
            className,
          )}
          title={t('label')}
        >
          <Icons.Sun className="absolute size-6 dark:hidden" />
          <Icons.Moon className="absolute hidden size-5 dark:block" />
          <span className="sr-only">{t('label')}</span>
        </Button>
      </DropdownMenuTrigger>
      <NavModeToggleBlock align="start" onPrimary={onPrimary} onSidebar={onSidebar} />
    </DropdownMenu>
  );
}
