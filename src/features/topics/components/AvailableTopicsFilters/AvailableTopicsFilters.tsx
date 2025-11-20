'use client';

import React from 'react';

import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ScrollArea } from '@/components/ui/ScrollArea';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';

import { AvailableTopicsFiltersForm } from './AvailableTopicsFiltersForm';

type TProps = TPropsWithClassName;

export function AvailableTopicsFilters(props: TProps) {
  const { className } = props;
  const [isExpanded, setIsExpanded] = React.useState(false);

  const toggleFilters = () => setIsExpanded(!isExpanded);
  const hideFilters = () => setIsExpanded(false);

  const ToggleIcon = isExpanded ? Icons.ChevronUp : Icons.ChevronDown;
  const hasFilters = true;

  const filterCaption = React.useMemo(() => {
    if (isExpanded) {
      return 'Filter topics';
    }
    if (!hasFilters) {
      return 'No active filters';
    }
    return (
      <span className="flex gap-2 truncate">
        <span className="font-bold">Active filters:</span>
        <span className="truncate font-normal">
          hsadjdfhsajkhdjka fdhkjahfjkashf dkjshfkdjsh lkjlkjl
        </span>
      </span>
    );
  }, [hasFilters, isExpanded]);

  return (
    <Card
      className={cn(
        isDev && '__AvailableTopicsFilters', // DEBUG
        'flex flex-col',
        className,
      )}
    >
      <CardHeader
        className={cn(
          isDev && '__AvailableTopicsFilters_Header', // DEBUG
          'flex flex-row items-center justify-between space-y-0 p-0',
          'overflow-hidden',
        )}
      >
        <CardTitle className="rounded-0 w-full">
          <Button
            variant="theme"
            onClick={toggleFilters}
            className="flex w-full items-center gap-2 rounded-none"
            title={isExpanded ? 'Collapse Filters' : 'Expand Filters'}
          >
            <span className="flex flex-1 items-center gap-2 truncate">
              <Icons.Filter className="size-4" />
              {filterCaption}
            </span>
            <span className="flex items-center gap-2">
              <ToggleIcon className="size-4" />
            </span>
          </Button>
        </CardTitle>
      </CardHeader>
      {isExpanded && (
        <CardContent
          className={cn(
            isDev && '__AvailableTopicsFilters_Content', // DEBUG
            'overflow-hidden',
            'flex flex-1 flex-col',
            'px-0',
            'py-0',
            // 'bg-theme-500/10',
            // 'text-white',
            // !isExpanded && 'py-2',
          )}
        >
          <ScrollArea
            className={cn(
              isDev && '__AvailableTopicsFilters_Scroll', // DEBUG
              // 'pt-6',
              // !isExpanded && 'py-2',
            )}
            viewportClassName={cn(
              isDev && '__AvailableTopicsFilters_ScrollViewport', // DEBUG
              'flex px-6  flex-col flex-1',
              '[&>div]:py-6 [&>div]:!flex [&>div]:flex-col [&>div]:gap-6 [&>div]:flex-1',
            )}
          >
            <AvailableTopicsFiltersForm hideFilters={hideFilters} />
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
}
