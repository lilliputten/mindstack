'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';

import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { ThreeStateField } from '@/components/ui/ThreeStateField';
import { Close } from '@/components/shared/Icons';
import { isDev } from '@/config';
import { useT } from '@/i18n';

import {
  getFilterFieldName,
  getFiltersLabelValueString,
  // getFilterUnionString,
} from './AvailableTopicsFiltersHelpers';
import { maxSearchTextLength, TFiltersData } from './AvailableTopicsFiltersTypes';

interface TProps extends TPropsWithClassName {
  form: UseFormReturn<TFiltersData>;
}

export function AvailableTopicsFiltersFields(props: TProps) {
  const { className, form } = props;
  const t = useT();

  const searchTextKey = React.useId();
  const hasWorkoutStatsKey = React.useId();
  const showOnlyMyTopicsKey = React.useId();

  // const trueText = getFilterUnionString('true', t);
  // const falseText = getFilterUnionString('false', t);
  // const nullText = getFilterUnionString('null', t);

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
            <Label htmlFor={searchTextKey}>{getFilterFieldName('searchText', t)}</Label>
            <FormControl>
              <div className="relative flex gap-2">
                <Input
                  id={searchTextKey}
                  placeholder="Search for text..."
                  {...field}
                  value={field.value || ''}
                  className={cn('pr-11')}
                  maxLength={maxSearchTextLength}
                />
                {field.value && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => field.onChange('')}
                    className={cn(
                      'absolute right-0 top-1/2 -translate-y-1/2',
                      'rounded-sm',
                      'opacity-30 transition hover:opacity-50',
                    )}
                    title="Clear text"
                  >
                    <Close className="size-4" />
                  </Button>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="hasWorkoutStats"
        control={form.control}
        render={({ field }) => {
          const { onChange: _, ...restField } = field;
          return (
            <FormItem className="flex w-full flex-col gap-2">
              <Label htmlFor={hasWorkoutStatsKey}>{getFilterFieldName('hasWorkoutStats', t)}</Label>
              <FormControl>
                <ThreeStateField
                  id={hasWorkoutStatsKey}
                  {...restField}
                  onValueChange={field.onChange}
                  trueText={getFiltersLabelValueString('hasWorkoutStats', true, t)}
                  falseText={getFiltersLabelValueString('hasWorkoutStats', false, t)}
                  nullText={getFiltersLabelValueString('hasWorkoutStats', null, t)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
      <FormField
        name="showOnlyMyTopics"
        control={form.control}
        render={({ field }) => (
          <FormItem className="flex w-full flex-col gap-2">
            <Label htmlFor={showOnlyMyTopicsKey}>{getFilterFieldName('showOnlyMyTopics', t)}</Label>
            <FormControl>
              <Switch
                id={showOnlyMyTopicsKey}
                checked={!!field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
