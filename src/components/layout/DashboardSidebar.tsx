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
import { useMediaMinDevices, useMediaQuery } from '@/hooks';
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

/** Show upgrade box at the bottom */
const showUpgradeCard = true;

/** Show project selector at the top */
const showSelector = false;

const saveScrollHash = getRandomHashString();

type TMemo = { inited?: boolean; restored?: boolean; isExpanded?: boolean };

export function DashboardSidebar({ links }: DashboardSidebarProps) {
  const path = usePathname();

  const memo = React.useMemo<TMemo>(() => ({}), []);

  const { inited: isMediaInited, mediaWidths } = useMediaMinDevices();
  const isLg = isMediaInited && mediaWidths.includes('lg');
  const isXl = isMediaInited && mediaWidths.includes('xl');
  const allowMediaExpanded = isLg;

  const [isUserExpanded, setUserExpanded] = React.useState<boolean | undefined>();
  const [isMediaExpanded, setMediaExpanded] = React.useState<boolean>(true);
  const noUserExpanded = isUserExpanded === undefined;
  const isExpanded = noUserExpanded ? isMediaExpanded : isUserExpanded;
  memo.isExpanded = isExpanded;

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('sidebarExpanded');
      if (saved) {
        setUserExpanded(JSON.parse(saved));
        memo.restored = true;
      }
    }
    memo.inited = true;
  }, [memo]);
  React.useEffect(() => {
    if (!memo.restored) {
      setMediaExpanded(allowMediaExpanded);
    }
  }, [memo, allowMediaExpanded]);

  const toggleSidebar = React.useCallback(() => {
    const value = !memo.isExpanded; // isUserExpanded;
    setUserExpanded(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('sidebarExpanded', JSON.stringify(value));
    }
    return value;
  }, [memo]);

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
              isDev && '__DashboardSidebar_Aside', // DEBUG
              noUserExpanded && 'max-lg:w-[68px]',
              isExpanded ? 'w-[200px] xl:w-[264px]' : 'w-[68px]',
              'hidden h-full md:block',
            )}
          >
            <div className="flex h-full flex-1 flex-col gap-2">
              <div
                className={cn(
                  isDev && '__DashboardSidebar_TopLine', // DEBUG
                  '__h-[60px] flex h-14 items-center py-4 pt-12',
                  isXl ? 'px-6' : 'px-2',
                )}
                suppressHydrationWarning
              >
                {showSelector && (
                  <ProjectSwitcher
                    className={cn(noUserExpanded && 'max-lg:hidden', !isExpanded && 'hidden')}
                  />
                )}
                <Tooltip key={`tooltip-expand`}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        'size-10 px-2 py-0 [&>svg]:m-auto',
                        'hover:bg-theme',
                        'hover:text-theme-foreground',
                        'hover:opacity-100',
                        'flex items-center gap-2',
                        'text-theme-400 dark:text-theme-500',
                        'w-full',
                      )}
                      onClick={toggleSidebar}
                    >
                      <Icons.PanelLeft className="size-5 min-w-5" />
                      <span
                        className={cn(
                          'flex-1 truncate text-left',
                          noUserExpanded && 'max-lg:hidden',
                          (!isExpanded || showSelector) && 'sr-only',
                        )}
                      >
                        Toggle Panel
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className={cn(
                      noUserExpanded && 'lg:hidden',
                      isExpanded && 'hidden',
                      // !showSelector && isExpanded && 'lg:hidden',
                    )}
                  >
                    Toggle Panel
                  </TooltipContent>
                </Tooltip>
              </div>
              <nav
                className={cn(
                  isDev && '__DashboardSidebar_Section', // DEBUG
                  'flex flex-1 flex-col gap-8 pt-4',
                  isXl ? 'px-6' : 'px-2',
                )}
              >
                {links.map((section) => (
                  <section key={section.titleId} className="flex flex-col gap-0.5">
                    <p
                      className={cn(
                        isDev && '__DashboardSidebar_Section_Title', // DEBUG
                        'mb-4 text-xs uppercase text-muted-foreground',
                        noUserExpanded && 'max-lg:hidden',
                        !isExpanded && 'hidden',
                      )}
                    >
                      {section.titleId}
                    </p>
                    {/* Show sections menu */}
                    {section.items.map((item) => {
                      const Icon = item.icon || Icons.ArrowRight;
                      const isCurrentPath = comparePathsWithoutLocalePrefix(item.href, path);
                      return (
                        item.href && (
                          <React.Fragment key={`link-fragment-${item.titleId}`}>
                            <Tooltip key={`tooltip-${item.titleId}`}>
                              <TooltipTrigger asChild>
                                <Link
                                  key={`link-${item.titleId}`}
                                  href={item.disabled ? '#' : item.href}
                                  className={cn(
                                    isDev && '__DashboardSidebar_Section_Item', // DEBUG
                                    'flex',
                                    'items-center',
                                    'gap-3',
                                    'rounded-md',
                                    'p-2',
                                    'text-sm',
                                    'font-medium',
                                    'hover:bg-theme/20',
                                    isCurrentPath && 'bg-theme-500/10 hover:bg-theme/30',
                                    item.disabled &&
                                      'pointer-events-none cursor-default opacity-30',
                                  )}
                                >
                                  <Icon className="size-5 min-w-5" />
                                  <span
                                    className={cn(
                                      'truncate',
                                      noUserExpanded && 'max-lg:hidden',
                                      !isExpanded && 'hidden',
                                    )}
                                  >
                                    {item.titleId}
                                  </span>
                                  {item.badge && (
                                    <Badge className="flex size-5 min-w-5 shrink-0 items-center justify-center rounded-full">
                                      {item.badge}
                                    </Badge>
                                  )}
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent
                                className={cn(
                                  noUserExpanded && 'lg:hidden',
                                  isExpanded && 'hidden',
                                )}
                                side="right"
                              >
                                {item.titleId}
                              </TooltipContent>
                            </Tooltip>
                          </React.Fragment>
                        )
                      );
                    })}
                  </section>
                ))}
              </nav>
              {showUpgradeCard && (
                <div
                  className={cn(
                    isDev && '__DashboardSidebar_UpgradeCard', // DEBUG
                    'mt-auto xl:p-6',
                    noUserExpanded && 'max-lg:hidden',
                    !isExpanded && 'hidden',
                  )}
                >
                  <UpgradeCard />
                </div>
              )}
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
                  <Icon className="size-5 min-w-5" />
                  {item.titleId}
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

export function MobileSheetSidebar(props: DashboardSidebarProps & TMobileSheetProps) {
  const { isUser } = props;
  return (
    <div
      className={cn(
        isDev && '__DashboardSidebar_MobileSheetSidebar', // DEBUG
        'flex h-screen flex-col',
      )}
    >
      <nav className={cn('flex flex-1 flex-col gap-y-8 py-6 text-lg font-medium')}>
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
