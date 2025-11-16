'use client';

import React from 'react';
import { useLocale } from 'next-intl';

import { cn } from '@/lib/utils';
import { DropdownMenuContent, DropdownMenuItem } from '@/components/ui/DropdownMenu';
import { debugLocale, showDebugLocale } from '@/config';
import { isDev } from '@/constants';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { useSessionUser } from '@/hooks';
import { localeNames, localeSymbols } from '@/i18n';
import { routing } from '@/i18n/routing';

import { SidebarMenuItem, SidebarWrapper, TSidebarBlockProps } from './SidebarComponents';

export function NavLocaleSwitcherBlock(props: TSidebarBlockProps) {
  const { onSidebar, className, align } = props;

  const user = useSessionUser();
  const isAdmin = user?.role === 'ADMIN';

  const Wrapper = onSidebar ? SidebarWrapper : DropdownMenuContent;
  const MenuItem = onSidebar ? SidebarMenuItem : DropdownMenuItem;

  const locale = useLocale();

  const { setLocale } = useSettingsContext();

  const { locales } = routing;

  const filteredLocales = React.useMemo(
    () => locales.filter((locale) => locale !== debugLocale || isAdmin || showDebugLocale),
    [locales, isAdmin],
  );

  return (
    <Wrapper
      data-locale={locale}
      align={align}
      className={cn(
        isDev && '__NavLocaleSwitcherBlock', // DEBUG
        onSidebar && 'flex-row flex-wrap gap-y-0',
        className,
      )}
    >
      {filteredLocales.map((cur) => (
        <MenuItem
          key={cur}
          data-locale={cur}
          onSelect={() => setLocale(cur)}
          disabled={cur === locale}
          className={cn(
            isDev && '__NavLocaleSwitcherBlock_MenuItem', // DEBUG
            'flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-theme-500',
          )}
        >
          <span>{localeSymbols[cur]}</span>
          <span>{localeNames[cur]}</span>
        </MenuItem>
      ))}
    </Wrapper>
  );
}
