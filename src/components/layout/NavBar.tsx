'use client';

import React from 'react';
import { useLocale } from 'next-intl';

import { siteMenu } from '@/config/siteMenu';
import { getAllRouteSynonyms } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { NavUserAuthButton } from '@/components/layout/NavAuthButton';
import { NavBarBrand } from '@/components/layout/NavBarBrand';
import { NavLocaleSwitcher } from '@/components/layout/NavLocaleSwitcher';
import { NavModeToggle } from '@/components/layout/NavModeToggle';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { useT } from '@/i18n';
import { Link, usePathname } from '@/i18n/routing';
import { TLocale } from '@/i18n/types';

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
  const locale = useLocale() as TLocale;
  const pathname = decodeURI(usePathname());
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
          <nav className="hidden gap-6 md:flex">
            {links
              .filter((item) => !item.userRequiredOnly || isUser)
              .map((item) => {
                // Check if it's current item using `getAllRouteSynonyms(item.href, locale)`
                const allHrefs = getAllRouteSynonyms(item.href, locale);
                const isCurrent = allHrefs.includes(pathname);
                const isDisabled = !!item.disabled || isCurrent;
                return (
                  <Link
                    key={'navbar-' + item.href}
                    href={item.href}
                    prefetch
                    className={cn(
                      'flex',
                      'items-center',
                      'text-lg',
                      'font-medium',
                      'transition-all',
                      'text-theme-foreground/80',
                      'opacity-100',
                      'hover:opacity-80',
                      'sm:text-sm',
                      isCurrent && 'underline',
                      isDisabled && 'disabled',
                    )}
                  >
                    {t(item.titleId)}
                  </Link>
                );
              })}
          </nav>
        ) : null}

        <div
          className={cn(
            isDev && '__NavBar_Right', // DEBUG
            'items-center space-x-3',
            'hidden',
            'md:flex',
          )}
        >
          {/* Right header for extra stuff */}
          <NavModeToggle onPrimary />
          <NavLocaleSwitcher onPrimary />
          <NavUserAuthButton isUser={isUser} onPrimary />
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
