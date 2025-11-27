'use client';

import React from 'react';

import { siteMenu } from '@/config/siteMenu';
import { cn } from '@/lib/utils';
import { NavUserAuthButton } from '@/components/layout/NavAuthButton';
import { NavBarBrand } from '@/components/layout/NavBarBrand';
import { NavLocaleSwitcher } from '@/components/layout/NavLocaleSwitcher';
import { NavModeToggle } from '@/components/layout/NavModeToggle';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { removePathLocalePrefix, useT } from '@/i18n';
import { Link, usePathname } from '@/i18n/routing';

interface NavBarProps {
  large?: boolean;
  isUser: boolean;
  open: boolean;
  setOpen: (p: boolean) => void;
}

export function NavBar(props: NavBarProps) {
  const { isUser, open, setOpen } = props;
  const links = siteMenu.mainNav;
  const t = useT('SiteMenu');
  const pathname = decodeURI(usePathname());
  const testPath = removePathLocalePrefix(pathname);
  const openSidebar = () => {
    setOpen(!open);
  };
  return (
    <header
      className={cn(
        isDev && '__NavBar', // DEBUG
        'relative',
        'sticky',
        'top-0',
        'z-40',
        'flex',
        'w-full',
        'bg-theme-600/70',
        'px-6',
        'justify-stretch',
        'transition-all',
      )}
    >
      <div
        className={cn(
          isDev && '__NavBar_Decor', // DEBUG
          'absolute inset-0 overflow-hidden',
          'bg-header-gradient after-header-decor',
          'z-0',
        )}
      />
      <div
        className={cn(
          isDev && '__NavBar_Wrapper', // DEBUG
          'flex',
          'w-full',
          'items-center',
          'justify-between',
          'py-2',
          'z-10',
        )}
      >
        <NavBarBrand isUser={isUser} />

        {links && links.length > 0 ? (
          <nav
            className={cn(
              isDev && '__NavBar_MiddleLinks', // DEBUG
              'hidden gap-2 md:flex',
            )}
          >
            {links
              .filter((item) => !item.userRequiredOnly || isUser)
              .map((item) => {
                const {
                  // authorizedOnly,
                  // badge,
                  // external,
                  // userRequiredOnly,
                  disabled,
                  href,
                  icon,
                  titleId,
                } = item;
                const isUnderCurrent = testPath.startsWith(href);
                const isCurrent = isUnderCurrent && href === testPath;
                const isDisabled = !!disabled || isCurrent;
                const Icon = icon;
                return (
                  <Link
                    key={'navbar-' + href}
                    href={href}
                    prefetch
                    data-testid="__NavBar_MiddleLinks_Item"
                    className={cn(
                      isDev && '__NavBar_MiddleLinks_Item', // DEBUG
                      'flex items-center gap-2',
                      'px-2 py-2',
                      'border border-transparent',
                      'rounded-md',
                      'text-sm font-medium',
                      'transition-all',
                      'text-theme-foreground',
                      'hover:bg-theme-400/50',
                      'hover:border-white/10',
                      isUnderCurrent && 'border-white/30',
                      isDisabled && 'pointer-events-none opacity-70',
                      'active:bg-theme active:text-theme-foreground',
                    )}
                  >
                    {Icon && <Icon className="size-5 min-w-5" />}
                    <span className={cn('truncate')}>{t(titleId)}</span>
                  </Link>
                );
              })}
          </nav>
        ) : null}

        <div
          className={cn(
            isDev && '__NavBar_Right', // DEBUG
            'flex items-center gap-2',
            'hidden',
            'md:flex',
          )}
        >
          {/* Right header for extra stuff */}
          <NavModeToggle onPrimary />
          <NavLocaleSwitcher onPrimary />
          <NavUserAuthButton isUser={isUser} onPrimary className="ml-2" />
        </div>

        {/* Mobile panel toggler icon */}
        <button
          onClick={openSidebar}
          className={cn(
            isDev && '__NavBar_MobilePanelToggler', // DEBUG
            'rounded-full',
            'p-4',
            'transition-all',
            'duration-200',
            'text-theme-foreground hover:bg-theme-600/50',
            'focus:outline-none',
            'active:bg-theme-700',
            'md:hidden',
            open && 'opacity-50 hover:bg-theme-600',
          )}
        >
          <Icons.Menu className="size-5 text-theme-foreground" />
        </button>
      </div>
    </header>
  );
}
