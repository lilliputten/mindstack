'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DialogTitle } from '@radix-ui/react-dialog';

import { SidebarNavItem } from '@/lib/types/site/NavItem';
import { getRandomHashString } from '@/lib/helpers/strings';
import { TPropsWithChildren } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DialogDescription } from '@/components/ui/Dialog';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Sheet, SheetContent } from '@/components/ui/Sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { ProjectSwitcher } from '@/components/dashboard/ProjectSwitcher';
import { UpgradeCard } from '@/components/dashboard/UpgradeCard';
import { NavUserAuthButton } from '@/components/layout/NavAuthButton';
import { NavLocaleSwitcherBlock } from '@/components/layout/NavLocaleSwitcherBlock';
import { NavModeToggleBlock } from '@/components/layout/NavModeToggleBlock';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { useMediaQuery } from '@/hooks';
import { comparePathsWithoutLocalePrefix } from '@/i18n/helpers';

import { NavBarBrand } from './NavBarBrand';

interface DashboardSidebarProps {
  links: SidebarNavItem[];
  isUser?: boolean;
}

interface TMobileSheetProps {
  open: boolean;
  setOpen: (p: boolean) => void;
}

const saveScrollHash = getRandomHashString();

type TMemo = { inited?: boolean; restored?: boolean };

export function DashboardSidebar({ links }: DashboardSidebarProps) {
  const path = usePathname();

  const memo = React.useMemo<TMemo>(() => ({}), []);

  const { isTablet } = useMediaQuery();

  const [isSidebarExpanded, setIsSidebarExpanded] = React.useState<boolean>(isTablet);
  React.useEffect(() => {
    if (memo.inited && typeof window !== 'undefined') {
      window.localStorage.setItem('sidebarExpanded', JSON.stringify(isSidebarExpanded));
    }
  }, [memo, isSidebarExpanded]);
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('sidebarExpanded');
      if (saved) {
        setIsSidebarExpanded(JSON.parse(saved));
        memo.restored = true;
      }
    }
    memo.inited = true;
  }, [memo]);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  React.useEffect(() => {
    if (!memo.restored) {
      setIsSidebarExpanded(!isTablet);
    }
  }, [memo, isTablet]);

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          isDev && '__DashboardSidebar', // DEBUG
          'bg-theme/10',
        )}
        suppressHydrationWarning
      >
        <ScrollArea
          saveScrollKey="DashboardSidebar"
          saveScrollHash={saveScrollHash}
          className={cn(
            isDev && '__DashboardSidebar_Scroll', // DEBUG
            'h-full overflow-y-auto border-r',
          )}
          viewportClassName={cn(
            isDev && '__DashboardSidebar_ScrollViewport', // DEBUG
            '[&>div]:h-full',
          )}
        >
          <aside
            className={cn(
              isSidebarExpanded ? 'w-[220px] xl:w-[260px]' : 'w-[68px]',
              '__h-screen hidden h-full md:block',
            )}
          >
            <div className="flex h-full flex-1 flex-col gap-2">
              <div className="flex h-14 items-center p-4 lg:h-[60px]">
                {/* DEMO: Switch project/profile/whatever example */}
                {isSidebarExpanded && <ProjectSwitcher />}
                <Tooltip key={`tooltip-expand`}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto', 'size-9', 'opacity-50', 'hover:bg-theme', 'hover:text-theme-foreground', 'hover:opacity-100', 'lg:size-8"
                      onClick={toggleSidebar}
                      // title="Expand panel"
                    >
                      {isSidebarExpanded ? (
                        <Icons.PanelLeftClose size={18} />
                      ) : (
                        <Icons.PanelRightClose size={18} />
                      )}
                      <span className="sr-only">Toggle Sidebar</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {isSidebarExpanded ? 'Collapse Panel' : 'Expand Panel'}
                  </TooltipContent>
                </Tooltip>
              </div>

              <nav
                className={cn(
                  isDev && '__DashboardSidebar_Section', // DEBUG
                  'flex flex-1 flex-col gap-8 px-4 pt-4',
                )}
              >
                {links.map((section) => (
                  <section key={section.titleId} className="flex flex-col gap-0.5">
                    {isSidebarExpanded ? (
                      <p
                        className={cn(
                          isDev && '__DashboardSidebar_Section_Title', // DEBUG
                          'mb-4 text-xs uppercase text-muted-foreground',
                        )}
                      >
                        {section.titleId}
                      </p>
                    ) : (
                      <div className="h-4" />
                    )}
                    {/* Show sections menu */}
                    {section.items.map((item) => {
                      const Icon = item.icon || Icons.ArrowRight;
                      const isCurrentPath = comparePathsWithoutLocalePrefix(item.href, path);
                      return (
                        item.href && (
                          <React.Fragment key={`link-fragment-${item.titleId}`}>
                            {isSidebarExpanded ? (
                              <Link
                                key={`link-${item.titleId}`}
                                href={item.disabled ? '#' : item.href}
                                className={cn(
                                  'flex',
                                  'items-center',
                                  'gap-3',
                                  'rounded-md',
                                  'p-2',
                                  'text-sm',
                                  'font-medium',
                                  'hover:bg-theme/20',
                                  isCurrentPath && 'bg-theme-500/10 hover:bg-theme/30',
                                  item.disabled && 'pointer-events-none cursor-default opacity-30',
                                )}
                              >
                                <Icon className="size-5" />
                                {item.titleId}
                                {item.badge && (
                                  <Badge className="flex size-5 shrink-0 items-center justify-center rounded-full">
                                    {item.badge}
                                  </Badge>
                                )}
                              </Link>
                            ) : (
                              <Tooltip key={`tooltip-${item.titleId}`}>
                                <TooltipTrigger asChild>
                                  <Link
                                    key={`link-tooltip-${item.titleId}`}
                                    href={item.disabled ? '#' : item.href}
                                    className={cn(
                                      'flex items-center gap-3 rounded-md py-2 text-sm font-medium hover:bg-theme/20',
                                      isCurrentPath && 'bg-theme-500/10 hover:bg-theme/30',
                                      item.disabled &&
                                        'pointer-events-none cursor-default opacity-30',
                                    )}
                                  >
                                    <span className="flex size-full items-center justify-center">
                                      <Icon className="size-5" />
                                    </span>
                                  </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right">{item.titleId}</TooltipContent>
                              </Tooltip>
                            )}
                          </React.Fragment>
                        )
                      );
                    })}
                  </section>
                ))}
              </nav>

              <div className="mt-auto xl:p-4">{isSidebarExpanded ? <UpgradeCard /> : null}</div>
            </div>
          </aside>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}

export function MobileSheetWrapper(props: TMobileSheetProps & TPropsWithChildren) {
  const { children, open, setOpen } = props;
  const { isSm, isMobile } = useMediaQuery();
  if (isSm || isMobile) {
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
          )}
        >
          <ScrollArea
            className={cn(
              isDev && '__DashboardSidebar_MobileSheetWrapper_ScrollArea', // DEBUG
              'h-full overflow-y-auto bg-theme/10',
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

function MenuSections(props: DashboardSidebarProps & TMobileSheetProps) {
  const { links, setOpen } = props;
  const path = usePathname();
  return (
    <>
      {/* Main menu srctions */}
      {links.map((section) => (
        <section key={section.titleId} className="flex flex-col gap-0.5">
          <p className="mb-4 text-xs uppercase text-muted-foreground">{section.titleId}</p>
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
                  href={item.disabled ? '#' : item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md p-2 text-sm font-medium hover:bg-theme hover:text-theme-foreground',
                    isCurrentPath ? 'bg-theme-500/10' : 'text-muted-foreground',
                    item.disabled && 'pointer-events-none cursor-default opacity-30',
                  )}
                >
                  <Icon className="size-5" />
                  {item.titleId}
                  {item.badge && (
                    <Badge className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full">
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

export function MobileSheetSidebar(props: DashboardSidebarProps & TMobileSheetProps) {
  const { isUser } = props;
  return (
    <div
      className={cn(
        isDev && '__DashboardSidebar_MobileSheetSidebar', // DEBUG
        'flex h-screen flex-col',
      )}
    >
      <nav className="flex flex-1 flex-col gap-y-8 p-6 text-lg font-medium">
        <NavBarBrand isUser={isUser} onSidebar />

        {<ProjectSwitcher large />}

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

        <div className="mt-auto">
          <UpgradeCard />
        </div>
      </nav>
    </div>
  );
}
