'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';

import { TPropsWithChildren, TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { FormHint } from '@/components/blocks/FormHint';
import { Close } from '@/components/shared/Icons';
import { isDev } from '@/config';
import {
  getFilterFieldName,
  getFiltersLabelValueString,
  maxSearchTextLength,
  orderBySelectDefault,
  orderBySelectOptions,
  TFiltersData,
} from '@/contexts/TopicsFiltersContext';
import { useT } from '@/i18n';

interface TProps extends TPropsWithClassName {
  form: UseFormReturn<TFiltersData>;
  ignoreOnlyMy?: boolean;
}

function FormSection({ children }: TPropsWithChildren) {
  return (
    <div
      className={cn(
        isDev && '__AvailableTopicsFiltersFields_FormSection', // DEBUG
        'flex w-full flex-1 flex-col gap-6 py-2 md:w-[45%]',
      )}
    >
      {children}
    </div>
  );
}

export function AvailableTopicsFiltersFields(props: TProps) {
  const { className, form, ignoreOnlyMy } = props;
  const t = useT();

  // Used keys
  const searchTextKey = React.useId();
  const searchLangKey = React.useId();
  const hasWorkoutStatsKey = React.useId();
  const hasActiveWorkoutsKey = React.useId();
  const hasQuestionsKey = React.useId();
  const showOnlyMyTopicsKey = React.useId();
  const orderBySelectKey = React.useId();

  // const trueText = getFilterUnionString('true', t);
  // const falseText = getFilterUnionString('false', t);
  // const nullText = getFilterUnionString('null', t);

  return (
    <div
      className={cn(
        isDev && '__AvailableTopicsFiltersFields', // DEBUG
        'flex w-full flex-col gap-6 md:flex-row',
        className,
      )}
    >
      <FormSection>
        <FormField
          name="searchText"
          control={form.control}
          render={({ field }) => (
            <FormItem className={cn('flex w-full flex-col gap-2', !field.value && 'opacity-50')}>
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
              <FormHint>Search for text in name, description or keywords.</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="searchLang"
          control={form.control}
          render={({ field }) => (
            <FormItem className={cn('flex w-full flex-col gap-2', !field.value && 'opacity-50')}>
              <Label htmlFor={searchLangKey}>{getFilterFieldName('searchLang', t)}</Label>
              <FormControl>
                <div className="relative flex gap-2">
                  <Input
                    id={searchLangKey}
                    placeholder="Search for language..."
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
              <FormHint className="MarkdownText">
                Search for language code or name (eg: <code>en</code> or <code>Engl</code>).
              </FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
        {!ignoreOnlyMy && (
          <FormField
            name="showOnlyMyTopics"
            control={form.control}
            render={({ field }) => (
              <FormItem className={cn('flex w-full flex-col gap-2', !field.value && 'opacity-50')}>
                <Label htmlFor={showOnlyMyTopicsKey}>
                  {getFilterFieldName('showOnlyMyTopics', t)}
                </Label>
                <FormControl>
                  <Switch
                    id={showOnlyMyTopicsKey}
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormHint className="MarkdownText">Show only my own topics.</FormHint>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          name="orderBySelect"
          control={form.control}
          render={({ field }) => (
            <FormItem
              className={cn(
                'flex w-full flex-col gap-2',
                (!field.value || field.value === orderBySelectDefault) && 'opacity-50',
              )}
            >
              <Label htmlFor={orderBySelectKey}>{getFilterFieldName('orderBySelect', t)}</Label>
              <FormControl>
                <Select value={field.value || ''} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select order…" />
                  </SelectTrigger>
                  <SelectContent>
                    {orderBySelectOptions.map((value) => (
                      <SelectItem key={value} value={value}>
                        {getFiltersLabelValueString('orderBySelect', value, t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormHint>Choose how to sort the topics list.</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>
      <FormSection>
        <FormField
          name="hasWorkoutStats"
          control={form.control}
          render={({ field }) => {
            const value = field.value === null ? 'null' : String(field.value);
            return (
              <FormItem
                className={cn('flex w-full flex-col gap-2', field.value === null && 'opacity-50')}
              >
                <Label htmlFor={hasWorkoutStatsKey}>
                  {getFilterFieldName('hasWorkoutStats', t)}
                </Label>
                <FormControl>
                  <Select
                    value={value}
                    onValueChange={(value) => {
                      const newValue = value === 'null' ? null : value === 'true';
                      field.onChange(newValue);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select option…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">
                        {getFiltersLabelValueString('hasWorkoutStats', null, t)}
                      </SelectItem>
                      <SelectItem value="true">
                        {getFiltersLabelValueString('hasWorkoutStats', true, t)}
                      </SelectItem>
                      <SelectItem value="false">
                        {getFiltersLabelValueString('hasWorkoutStats', false, t)}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormHint>
                  Display topics with or without collected progress statistics data.
                </FormHint>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          name="hasActiveWorkouts"
          control={form.control}
          render={({ field }) => {
            const value = field.value === null ? 'null' : String(field.value);
            return (
              <FormItem
                className={cn('flex w-full flex-col gap-2', field.value === null && 'opacity-50')}
              >
                <Label htmlFor={hasActiveWorkoutsKey}>
                  {getFilterFieldName('hasActiveWorkouts', t)}
                </Label>
                <FormControl>
                  <Select
                    value={value}
                    onValueChange={(value) => {
                      const newValue = value === 'null' ? null : value === 'true';
                      field.onChange(newValue);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select option…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">
                        {getFiltersLabelValueString('hasActiveWorkouts', null, t)}
                      </SelectItem>
                      <SelectItem value="true">
                        {getFiltersLabelValueString('hasActiveWorkouts', true, t)}
                      </SelectItem>
                      <SelectItem value="false">
                        {getFiltersLabelValueString('hasActiveWorkouts', false, t)}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormHint>Display topics with or without active trainings.</FormHint>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          name="hasQuestions"
          control={form.control}
          render={({ field }) => {
            const value = field.value === null ? 'null' : String(field.value);
            return (
              <FormItem
                className={cn('flex w-full flex-col gap-2', field.value === null && 'opacity-50')}
              >
                <Label htmlFor={hasQuestionsKey}>{getFilterFieldName('hasQuestions', t)}</Label>
                <FormControl>
                  <Select
                    value={value}
                    onValueChange={(value) => {
                      const newValue = value === 'null' ? null : value === 'true';
                      field.onChange(newValue);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select option…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">
                        {getFiltersLabelValueString('hasQuestions', null, t)}
                      </SelectItem>
                      <SelectItem value="true">
                        {getFiltersLabelValueString('hasQuestions', true, t)}
                      </SelectItem>
                      <SelectItem value="false">
                        {getFiltersLabelValueString('hasQuestions', false, t)}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormHint>Display topics with or without created questions.</FormHint>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </FormSection>
    </div>
  );
}
