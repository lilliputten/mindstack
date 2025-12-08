'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ExtendedUser } from '@/@types/next-auth';
import { useLocale } from 'next-intl';

import { NavItemBase } from '@/lib/types/site/NavItem';
import { dashboardLinks } from '@/config/dashboard';
import { rootRoute } from '@/config/routesConfig';
import { getAllRouteSynonyms } from '@/lib/routes';
import { TPropsWithChildren } from '@/lib/types';
import { cn } from '@/lib/utils';
import { NavBar } from '@/components/layout/NavBar';
import { NavFooter } from '@/components/layout/NavFooter';
import { isDev } from '@/constants';
import { TLocale } from '@/i18n';

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

const routesWithoutSidebar = [
  // All routes to display without dashboard sidebar. TODO: Move to config?
  rootRoute,
];

export function GenericLayoutContent(props: TGenericLayoutContentProps) {
  const { children, user } = props;
  const isUser = !!user;

  // Is mobile sidebar open?
  const [open, setOpen] = React.useState(false);

  const pathname = usePathname();
  const locale = useLocale() as TLocale;
  const rootRoutesList = routesWithoutSidebar.flatMap((route) =>
    getAllRouteSynonyms(route, locale),
  );
  const isRoot = !pathname || rootRoutesList.includes(pathname);
  const hideSidebar = HIDE_SIDEBAR_FOR_ROOT_LANDING && isRoot;

  const checkNavItem = checkIfLinkIsAllowedForUser.bind(undefined, user);

  const filteredLinks = dashboardLinks.filter(checkNavItem).map((section) => ({
    ...section,
    items: section.items.filter(checkNavItem),
  }));

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
        {children}
      </div>
      <NavFooter />
    </div>
  );
}
