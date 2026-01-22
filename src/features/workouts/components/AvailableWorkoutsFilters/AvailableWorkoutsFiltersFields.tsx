'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';

import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { FormHint } from '@/components/blocks/FormHint';
import { isDev } from '@/config';
import {
  getFilterFieldName,
  maxSearchTextLength,
  TFiltersData,
} from '@/features/workouts/contexts/WorkoutsFiltersContext';

interface TProps extends TPropsWithClassName {
  form: UseFormReturn<TFiltersData>;
}

function FormSection({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        isDev && '__AvailableWorkoutsFiltersFields_FormSection',
        'flex w-full flex-1 flex-col gap-6 py-2 md:w-[45%]',
      )}
    >
      {children}
    </div>
  );
}

export function AvailableWorkoutsFiltersFields(props: TProps) {
  const { className, form } = props;

  const t = useT('AvailableWorkoutsFilterTexts');
  const tCommon = useT();

  // Used keys
  const searchTextKey = React.useId();
  const hasWorkoutStatsKey = React.useId();
  const hasActiveWorkoutsKey = React.useId();
  const langCodeKey = React.useId();
  const langNameKey = React.useId();
  const searchLangKey = React.useId();
  const minStartedKey = React.useId();
  const maxStartedKey = React.useId();
  const minFinishedKey = React.useId();
  const maxFinishedKey = React.useId();

  return (
    <div
      className={cn(
        isDev && '__AvailableWorkoutsFiltersFields',
        'flex w-full flex-col gap-6 md:flex-row',
        className,
      )}
    >
      <FormSection>
        {/* Search Text */}
        <FormField
          name="searchText"
          control={form.control}
          render={({ field }) => (
            <FormItem className={cn('flex w-full flex-col gap-2', !field.value && 'opacity-50')}>
              <Label className="truncate" htmlFor={searchTextKey}>
                {getFilterFieldName('searchText', t)}
              </Label>
              <FormControl>
                <Input
                  id={searchTextKey}
                  placeholder={tCommon('AvailableWorkoutsFiltersFields.SearchForTextPlaceholder')}
                  {...field}
                  value={field.value || ''}
                  maxLength={maxSearchTextLength}
                />
              </FormControl>
              <FormHint>{t('SearchTextHint')}</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Language Code */}
        <FormField
          name="langCode"
          control={form.control}
          render={({ field }) => (
            <FormItem className={cn('flex w-full flex-col gap-2', !field.value && 'opacity-50')}>
              <Label className="truncate" htmlFor={langCodeKey}>
                {getFilterFieldName('langCode', t)}
              </Label>
              <FormControl>
                <Input
                  id={langCodeKey}
                  placeholder={tCommon('AvailableWorkoutsFiltersFields.LangCodePlaceholder')}
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormHint>{t('LangCodeHint')}</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Language Name */}
        <FormField
          name="langName"
          control={form.control}
          render={({ field }) => (
            <FormItem className={cn('flex w-full flex-col gap-2', !field.value && 'opacity-50')}>
              <Label className="truncate" htmlFor={langNameKey}>
                {getFilterFieldName('langName', t)}
              </Label>
              <FormControl>
                <Input
                  id={langNameKey}
                  placeholder={tCommon('AvailableWorkoutsFiltersFields.LangNamePlaceholder')}
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormHint>{t('LangNameHint')}</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Search Language */}
        <FormField
          name="searchLang"
          control={form.control}
          render={({ field }) => (
            <FormItem className={cn('flex w-full flex-col gap-2', !field.value && 'opacity-50')}>
              <Label className="truncate" htmlFor={searchLangKey}>
                {getFilterFieldName('searchLang', t)}
              </Label>
              <FormControl>
                <Input
                  id={searchLangKey}
                  placeholder={tCommon('AvailableWorkoutsFiltersFields.SearchLangPlaceholder')}
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormHint>{t('SearchLangHint')}</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>

      <FormSection>
        {/* Has Workout Stats */}
        <FormField
          name="hasWorkoutStats"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label className="truncate" htmlFor={hasWorkoutStatsKey}>
                  {getFilterFieldName('hasWorkoutStats', t)}
                </Label>
                <FormControl>
                  <Switch
                    id={hasWorkoutStatsKey}
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </div>
              <FormHint>{t('HasWorkoutStatsHint')}</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Has Active Workouts */}
        <FormField
          name="hasActiveWorkouts"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label className="truncate" htmlFor={hasActiveWorkoutsKey}>
                  {getFilterFieldName('hasActiveWorkouts', t)}
                </Label>
                <FormControl>
                  <Switch
                    id={hasActiveWorkoutsKey}
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </div>
              <FormHint>{t('HasActiveWorkoutsHint')}</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date Range Filters */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            name="minStarted"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-2">
                <Label className="truncate" htmlFor={minStartedKey}>
                  {getFilterFieldName('minStarted', t)}
                </Label>
                <FormControl>
                  <Input
                    id={minStartedKey}
                    type="date"
                    {...field}
                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="maxStarted"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-2">
                <Label className="truncate" htmlFor={maxStartedKey}>
                  {getFilterFieldName('maxStarted', t)}
                </Label>
                <FormControl>
                  <Input
                    id={maxStartedKey}
                    type="date"
                    {...field}
                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="minFinished"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-2">
                <Label className="truncate" htmlFor={minFinishedKey}>
                  {getFilterFieldName('minFinished', t)}
                </Label>
                <FormControl>
                  <Input
                    id={minFinishedKey}
                    type="date"
                    {...field}
                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="maxFinished"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-2">
                <Label className="truncate" htmlFor={maxFinishedKey}>
                  {getFilterFieldName('maxFinished', t)}
                </Label>
                <FormControl>
                  <Input
                    id={maxFinishedKey}
                    type="date"
                    {...field}
                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>
    </div>
  );
}
