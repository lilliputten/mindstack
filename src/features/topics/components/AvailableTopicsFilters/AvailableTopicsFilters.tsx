'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FormProvider } from '@/components/ui/Form';
import { ScrollArea } from '@/components/ui/ScrollArea';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';

import { AvailableTopicsFiltersFields } from './AvailableTopicsFiltersFields';
import {
  filtersDataDefaults,
  filtersDataSchema,
  TFiltersData,
} from './AvailableTopicsFiltersTypes';

type TProps = TPropsWithClassName;

export function AvailableTopicsFilters(props: TProps) {
  const { className } = props;
  const [isExpanded, setIsExpanded] = React.useState(true);

  const toggleFilters = React.useCallback(() => setIsExpanded((isExpanded) => !isExpanded), []);
  const hideFilters = React.useCallback(() => () => setIsExpanded(false), []);

  const ToggleIcon = isExpanded ? Icons.ChevronUp : Icons.ChevronDown;

  const form = useForm<TFiltersData>({
    mode: 'onChange', // 'all', // Validation strategy before submitting behaviour.
    criteriaMode: 'all', // Display all validation errors or one at a time.
    resolver: zodResolver(filtersDataSchema),
    defaultValues: filtersDataDefaults,
  });

  /* // DEBUG: Effect: Watch form values
   * const watchedValues = form.watch();
   * React.useEffect(() => {
   *   console.log('[AvailableTopicsFilters] DEBUG: Effect: Watch form values', {
   *     watchedValues,
   *     hasWorkoutStats: watchedValues.hasWorkoutStats,
   *   });
   * }, [watchedValues]);
   */

  const hasFilters = true;

  const handleFormSubmit = React.useCallback(
    (formData: TFiltersData) => {
      // TODO: Update form data
      console.log('[AvailableTopicsFilters:handleFormSubmit]: Apply filters:', formData);
      debugger;
      hideFilters();
    },
    [hideFilters],
  );

  const handleReset = React.useCallback(() => {
    console.log('[AvailableTopicsFilters:handleReset]: Reset filters');
    debugger;
    form.reset(filtersDataDefaults);
  }, [form]);

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
          )}
        >
          <ScrollArea
            className={cn(
              isDev && '__AvailableTopicsFilters_Scroll', // DEBUG
            )}
            viewportClassName={cn(
              isDev && '__AvailableTopicsFilters_ScrollViewport', // DEBUG
              'flex px-6  flex-col flex-1',
              '[&>div]:py-6 [&>div]:!flex [&>div]:flex-col [&>div]:gap-6 [&>div]:flex-1',
            )}
          >
            <FormProvider {...form}>
              <form
                onSubmit={form.handleSubmit(handleFormSubmit)}
                className={cn(
                  isDev && '__AvailableTopicsFilters', // DEBUG
                  'flex flex-col gap-4',
                  className,
                )}
              >
                <div
                  className={cn(
                    isDev && '__AvailableTopicsFilters_Fields', // DEBUG
                    'flex flex-col gap-4',
                  )}
                >
                  <AvailableTopicsFiltersFields form={form} />
                </div>
                <div
                  className={cn(
                    isDev && '__AvailableTopicsFilters_Actions', // DEBUG
                    'flex gap-2 pt-2',
                  )}
                >
                  <Button type="submit" variant="theme">
                    Apply
                  </Button>
                  <Button type="button" variant="outline" onClick={handleReset}>
                    Reset
                  </Button>
                </div>
              </form>
            </FormProvider>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
}
