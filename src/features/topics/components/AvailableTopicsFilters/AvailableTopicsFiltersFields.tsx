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
  TFiltersData,
} from '@/contexts/TopicsFiltersContext';
import { useT } from '@/i18n';

interface TProps extends TPropsWithClassName {
  form: UseFormReturn<TFiltersData>;
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
  const { className, form } = props;
  const t = useT();

  const searchTextKey = React.useId();
  const searchLangKey = React.useId();
  const hasWorkoutStatsKey = React.useId();
  const hasActiveWorkoutsKey = React.useId();
  const hasQuestionsKey = React.useId();
  const showOnlyMyTopicsKey = React.useId();

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
              <FormHint>Search for text in name, description or keywords.</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="searchLang"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-2">
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
        <FormField
          name="showOnlyMyTopics"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-2">
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
      </FormSection>
      <FormSection>
        <FormField
          name="hasWorkoutStats"
          control={form.control}
          render={({ field }) => {
            const value = field.value === null ? 'null' : String(field.value);
            return (
              <FormItem className="flex w-full flex-col gap-2">
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
              <FormItem className="flex w-full flex-col gap-2">
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
              <FormItem className="flex w-full flex-col gap-2">
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
