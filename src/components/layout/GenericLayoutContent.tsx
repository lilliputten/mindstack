'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ExtendedUser } from '@/@types/next-auth';
import { useLocale } from 'next-intl';

import { NavItemBase, SidebarNavItem } from '@/lib/types/site/NavItem';
import { dashboardLinks } from '@/config/dashboard';
import { getAllRouteSynonyms } from '@/lib/routes';
import { TPropsWithChildren } from '@/lib/types';
import { cn } from '@/lib/utils';
import { TLocale } from '@/i18n/types';
import { NavBar } from '@/components/layout/NavBar';
import { NavFooter } from '@/components/layout/NavFooter';
import { routesWithoutSidebar } from '@/config';
import { isDev } from '@/constants';

import { AcceptCookiesPopup } from './AcceptCookiesPopup';
import { DashboardSidebar } from './DashboardSidebar';
import { MobileSheetSidebar, MobileSheetWrapper } from './MobileSheetSidebar';

interface TGenericLayoutContentProps extends TPropsWithChildren {
  user?: ExtendedUser;
}

function checkIfLinkIsAllowedForUser(user: ExtendedUser | undefined, navItem: NavItemBase) {
  const { authorizedOnly } = navItem;
  if (!authorizedOnly) {
    return true;
  }
  if (authorizedOnly === true && !!user?.id) {
    return true;
  }
  return authorizedOnly === user?.role;
}

const HIDE_SIDEBAR_FOR_ROOT_LANDING = true;

export function GenericLayoutContent(props: TGenericLayoutContentProps) {
  const { children, user } = props;
  const isUser = !!user;

  // State: Is mobile sidebar open?
  const [open, setOpen] = React.useState(false);

  const pathname = usePathname();
  const locale = useLocale() as TLocale;
  const publicRootRoutesList = routesWithoutSidebar.flatMap((route) =>
    getAllRouteSynonyms(route, locale),
  );
  const isRoot = !pathname || publicRootRoutesList.includes(pathname);
  const hideSidebar = HIDE_SIDEBAR_FOR_ROOT_LANDING && isRoot;

  // Filtered top- and second-level items
  const filteredLinks = React.useMemo<SidebarNavItem[]>(() => {
    const checkNavItem = checkIfLinkIsAllowedForUser.bind(undefined, user);
    return dashboardLinks.filter(checkNavItem).map((section) => ({
      ...section,
      items: section.items.filter(checkNavItem),
    }));
  }, [user]);

  return (
    <div
      className={cn(
        isDev && '__GenericLayoutContent', // DEBUG
        'fixed inset-0',
        'flex flex-1 flex-col items-center',
        'layout-follow',
      )}
    >
      <MobileSheetWrapper open={open} setOpen={setOpen}>
        <MobileSheetSidebar isUser={isUser} links={filteredLinks} open={open} setOpen={setOpen} />
      </MobileSheetWrapper>
      <NavBar isUser={isUser} open={open} setOpen={setOpen} />
      <div
        className={cn(
          isDev && '__GenericLayout_HLayout', // DEBUG
          'relative flex size-full flex-1',
          'layout-follow',
        )}
      >
        {!hideSidebar && <DashboardSidebar links={filteredLinks} />}
        <div
          className={cn(
            isDev && '__GenericLayout_ContentContainer', // DEBUG
            'relative flex size-full flex-1',
            'single-child',
          )}
        >
          {children}
        </div>
      </div>
      <AcceptCookiesPopup />
      <NavFooter />
    </div>
  );
}
