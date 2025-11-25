'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, UseFormReturn } from 'react-hook-form';

import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { FormControl, FormField, FormItem, FormMessage, FormProvider } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ThreeStateField } from '@/components/ui/ThreeStateField';
import { isDev } from '@/config';

import { TFiltersData } from './AvailableTopicsFiltersTypes';

interface TProps extends TPropsWithClassName {
  form: UseFormReturn<TFiltersData>;
}

export function AvailableTopicsFiltersFields(props: TProps) {
  const { className, form } = props;

  const searchTextKey = React.useId();
  const hasWorkoutStatsKey = React.useId();

  return (
    <div
      className={cn(
        isDev && '__AvailableTopicsFiltersFields', // DEBUG
        'flex flex-col gap-4',
        className,
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
  );
}
