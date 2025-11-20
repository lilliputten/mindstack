'use client';

import React from 'react';
import { useForm } from 'react-hook-form';

import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ThreeStateField, TThreeState } from '@/components/ui/ThreeStateField';
import { isDev } from '@/config';

// GetAvailableTopicsParamsSchema

interface TFiltersFormData {
  searchText?: string;
  hasWorkoutStats?: TThreeState;
}

interface TProps extends TPropsWithClassName {
  hideFilters: () => void;
}

export function AvailableTopicsFiltersForm(props: TProps) {
  const { className, hideFilters } = props;

  const form = useForm<TFiltersFormData>({
    defaultValues: {
      searchText: '',
      hasWorkoutStats: null,
    },
  });

  const searchTextKey = React.useId();
  const hasWorkoutStatsKey = React.useId();

  // TODO: Handle filters form data

  const handleFormSubmit = (data: TFiltersFormData) => {
    // TODO: Update form data
    hideFilters();
    console.log('Apply filters:', data);
    debugger;
  };

  const handleReset = () => {
    form.reset({ searchText: '', hasWorkoutStats: null });
    console.log('Reset filters');
    debugger;
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className={cn(
          isDev && '__AvailableTopicsFiltersForm', // DEBUG
          'flex flex-col gap-4',
          className,
        )}
      >
        <div
          className={cn(
            isDev && '__AvailableTopicsFiltersForm_Fields', // DEBUG
            'flex flex-col gap-4',
          )}
        >
          <FormField
            name="searchText"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-2">
                <Label htmlFor={searchTextKey}>Search</Label>
                <FormControl>
                  <Input id={searchTextKey} placeholder="Search topics..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="hasWorkoutStats"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-2">
                <Label htmlFor={hasWorkoutStatsKey}>Has Training Statistics</Label>
                <FormControl>
                  <ThreeStateField
                    id={hasWorkoutStatsKey}
                    {...field}
                    onValueChange={field.onChange}
                    trueText="Yes"
                    falseText="No"
                    nullText="Undefined"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div
          className={cn(
            isDev && '__AvailableTopicsFiltersForm_Actions', // DEBUG
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
    </Form>
  );
}
