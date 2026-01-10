'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { DialogTitle } from '@radix-ui/react-dialog';

import { SidebarNavItem } from '@/lib/types/site/NavItem';
import { TPropsWithChildren } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { comparePathsWithoutLocalePrefix } from '@/i18n/helpers';
import { Link } from '@/i18n/routing';
import { Badge } from '@/components/ui/Badge';
import { DialogDescription } from '@/components/ui/Dialog';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Sheet, SheetContent } from '@/components/ui/Sheet';
import { ProjectSwitcher } from '@/components/dashboard/ProjectSwitcher';
import { UpgradeCard } from '@/components/dashboard/UpgradeCard';
import { NavUserAuthButton } from '@/components/layout/NavAuthButton';
import { NavLocaleSwitcherBlock } from '@/components/layout/NavLocaleSwitcherBlock';
import { NavModeToggleBlock } from '@/components/layout/NavModeToggleBlock';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { useMediaMinDevices } from '@/hooks';

import { showProjectsSelector, showUpgradeCard } from './DasboardConstants';
import { NavBarBrand } from './NavBarBrand';

interface TGenericSidebarProps {
  links: SidebarNavItem[];
  isUser?: boolean;
}

interface TMobileSheetProps {
  open: boolean;
  setOpen: (p: boolean) => void;
}

function MenuSections(props: TGenericSidebarProps & TMobileSheetProps) {
  const { links, setOpen } = props;
  const path = usePathname();
  const t = useT('NavLinks');
  return (
    <>
      {/* Main menu srctions */}
      {links.map((section) => (
        <section key={section.titleId} className="flex flex-col gap-0.5">
          <p className="mb-4 text-xs uppercase text-white">{t(section.titleId)}</p>
          {section.items.map((item) => {
            const Icon = item.icon || Icons.ArrowRight;
            if (!item.href) {
              return null;
            }
            const isCurrentPath = comparePathsWithoutLocalePrefix(item.href, path);
            return (
              <React.Fragment key={`link-fragment-${item.titleId}`}>
                <Link
                  key={`link-${item.titleId}`}
                  onClick={() => {
                    if (!item.disabled) {
                      setOpen(false);
                    }
                  }}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md p-2 text-sm font-medium',
                    'text-white hover:bg-white hover:text-theme-700',
                    isCurrentPath && 'bg-white/20',
                    item.disabled && 'pointer-events-none cursor-default opacity-30',
                  )}
                >
                  <Icon className="size-5 min-w-5" />
                  {t(item.titleId)}
                  {item.badge && (
                    <Badge className="ml-auto flex size-5 min-w-5 shrink-0 items-center justify-center rounded-full">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </React.Fragment>
            );
          })}
        </section>
      ))}
    </>
  );
}

export function MobileSheetWrapper(props: TMobileSheetProps & TPropsWithChildren) {
  const { children, open, setOpen } = props;
  // const { isSm, isMobile } = useMediaQuery();
  const { inited: isMediaInited, mediaWidths } = useMediaMinDevices();
  const isLg = isMediaInited && mediaWidths.includes('lg');
  if (!isLg) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">Navigation menu</DialogTitle>
        <DialogDescription className="sr-only">Navigation menu</DialogDescription>
        {/* NOTE: Former navigation menu toggler. Now used a button from the NavBar
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="size-9 shrink-0 md:hidden">
            <Menu className="size-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
         */}
        <SheetContent
          side="leftPanel"
          className={cn(
            isDev && '__DashboardSidebar_MobileSheetWrapper', // DEBUG
            'flex flex-col p-0',
            'bg-theme-600',
          )}
          closeClassName={cn(
            isDev && '__DashboardSidebar_MobileSheetWrapper_Close', // DEBUG
            'text-white',
            // 'hover:bg-white',
          )}
        >
          <ScrollArea
            className={cn(
              isDev && '__DashboardSidebar_MobileSheetWrapper_ScrollArea', // DEBUG
              'h-full overflow-y-auto',
              // 'bg-theme/10',
            )}
          >
            {/* MobileSheetSidebar */}
            {children}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }
}

export function MobileSheetSidebar(props: TGenericSidebarProps & TMobileSheetProps) {
  const { isUser } = props;
  return (
    <div
      className={cn(
        isDev && '__DashboardSidebar_MobileSheetSidebar', // DEBUG
        'flex h-screen flex-col',
      )}
    >
      <nav className={cn('flex flex-1 flex-col gap-y-8 p-6 text-lg font-medium')}>
        <NavBarBrand isUser={isUser} onSidebar />

        {showProjectsSelector && <ProjectSwitcher large />}

        {/* Main menu srctions */}
        <MenuSections {...props} />

        {/* TODO: Show menu if collapsed */}
        <div
          className={cn(
            isDev && '__DashboardSidebar_ExtraMenu', // DEBUG
            'flex flex-col gap-2',
          )}
        >
          <NavModeToggleBlock onSidebar />
          <NavLocaleSwitcherBlock onSidebar />
        </div>

        {/* User menu */}
        <NavUserAuthButton isUser={isUser} onPrimary onSidebar />

        {showUpgradeCard && (
          <div
            className={cn(
              isDev && '__MobileSheetSidebar_UpgradeCard', // DEBUG
              'mt-auto',
            )}
          >
            <UpgradeCard dontFlatten onSidebar />
          </div>
        )}
      </nav>
    </div>
  );
}
