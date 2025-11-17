'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { SidebarNavItem } from '@/lib/types/site/NavItem';
import { getRandomHashString } from '@/lib/helpers/strings';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { ProjectSwitcher } from '@/components/dashboard/ProjectSwitcher';
import { UpgradeCard } from '@/components/dashboard/UpgradeCard';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { useMediaMinDevices } from '@/hooks';
import { comparePathsWithoutLocalePrefix } from '@/i18n/helpers';

import { showProjectsSelector, showUpgradeCard } from './DasboardConstants';

interface TDashboardSidebarProps {
  links: SidebarNavItem[];
  isUser?: boolean;
}

const saveScrollHash = getRandomHashString();

type TMemo = { inited?: boolean; restored?: boolean; isExpanded?: boolean };

export function DashboardSidebar({ links }: TDashboardSidebarProps) {
  const path = usePathname();

  const memo = React.useMemo<TMemo>(() => ({}), []);

  const { inited: isMediaInited, mediaWidths } = useMediaMinDevices();
  const isLg = isMediaInited && mediaWidths.includes('lg');
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
    const value = !memo.isExpanded;
    setUserExpanded(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('sidebarExpanded', JSON.stringify(value));
    }
    return value;
  }, [memo]);

  return (
    <TooltipProvider delayDuration={0}>
      <ScrollArea
        saveScrollKey="DashboardSidebar"
        saveScrollHash={saveScrollHash}
        className={cn(
          isDev && '__DashboardSidebar', // DEBUG
          'h-full border-r bg-theme/10',
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
            isExpanded ? 'w-[220px] xl:w-[272px]' : 'w-[68px]',
            'hidden h-full pt-6 md:block',
          )}
        >
          <div className="flex h-full flex-1 flex-col gap-2">
            <div
              className={cn(
                isDev && '__DashboardSidebar_TopLine', // DEBUG
                'flex items-center',
                'px-4',
                isExpanded && 'xl:px-6',
              )}
              suppressHydrationWarning
            >
              {showProjectsSelector && (
                <ProjectSwitcher
                  className={cn(noUserExpanded && 'max-lg:hidden', !isExpanded && 'hidden')}
                />
              )}
              <Tooltip key={`tooltip-expand`}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      'h-9 px-2 py-0 [&>svg]:m-auto',
                      'w-full',
                      'flex items-center gap-2',
                      'text-theme-600 dark:text-theme',
                      'hover:bg-theme/20',
                      'dark:hover:text-white',
                    )}
                    onClick={toggleSidebar}
                  >
                    <Icons.PanelLeft className="size-5 min-w-5" />
                    <span
                      className={cn(
                        'flex-1 truncate text-left',
                        noUserExpanded && 'max-lg:hidden',
                        (!isExpanded || showProjectsSelector) && 'sr-only',
                      )}
                    >
                      Toggle Panel
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className={cn(noUserExpanded && 'lg:hidden', isExpanded && 'hidden')}
                >
                  Toggle Panel
                </TooltipContent>
              </Tooltip>
            </div>
            <nav
              className={cn(
                isDev && '__DashboardSidebar_Section', // DEBUG
                'flex flex-1 flex-col gap-8 pt-4',
                'px-4',
                isExpanded && 'xl:px-6',
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
                                  noUserExpanded && 'max-lg:justify-center',
                                  !isExpanded && 'justify-center',
                                  'gap-3',
                                  'rounded-md',
                                  'p-2',
                                  'text-sm',
                                  'font-medium',
                                  'hover:bg-theme/20',
                                  isCurrentPath && 'bg-theme-500/10 hover:bg-theme/30',
                                  item.disabled && 'pointer-events-none cursor-default opacity-30',
                                  'active:bg-theme active:text-theme-foreground',
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
                              className={cn(noUserExpanded && 'lg:hidden', isExpanded && 'hidden')}
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
    </TooltipProvider>
  );
}
