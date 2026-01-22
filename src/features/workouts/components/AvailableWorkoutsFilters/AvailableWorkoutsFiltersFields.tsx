'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { UseFormReturn } from 'react-hook-form';

import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
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
import { CategorySelectField } from '@/components/shared/CategorySelect';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';
import {
  getFilterFieldName,
  getFiltersLabelValueString,
  TFiltersData,
} from '@/features/workouts/contexts/WorkoutsFiltersContext/WorkoutsFiltersHelpers';
import {
  maxSearchTextLength,
  orderBySelectDefault,
  orderBySelectOptions,
} from '@/features/workouts/contexts/WorkoutsFiltersContext/WorkoutsFiltersTypes';

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

  const { data: sessionData } = useSession();
  const user = sessionData?.user;
  const isAdmin = user?.role === 'ADMIN';

  // Used keys
  const searchTextKey = React.useId();
  const hasWorkoutStatsKey = React.useId();
  const hasActiveWorkoutsKey = React.useId();
  const adminModeKey = React.useId();
  const searchLangKey = React.useId();
  const minStartedKey = React.useId();
  const maxStartedKey = React.useId();
  const minFinishedKey = React.useId();
  const maxFinishedKey = React.useId();
  const orderBySelectKey = React.useId();
  // const categoryIdsKey = React.useId();

  return (
    <div
      className={cn(
        isDev && '__AvailableWorkoutsFiltersFields',
        'flex w-full flex-col gap-6 md:flex-row',
        className,
      )}
    >
      <FormSection>
        {/* Category IDs Filter - First field as requested */}
        <div
          className={cn('flex flex-col gap-2', !form.watch('categoryIds')?.length && 'opacity-50')}
        >
          <CategorySelectField
            // form={form}
            // @ts-expect-error - TypeScript doesn't properly infer the exact type compatibility
            control={form.control}
            name="categoryIds"
            label={getFilterFieldName('categoryIds', t)}
            hint={t('AvailableWorkoutsFiltersFields.CategoriesHint')}
            placeholder={t('AvailableWorkoutsFiltersFields.SelectCategories')}
          />
        </div>
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
                <div className="relative flex gap-2">
                  <Input
                    id={searchTextKey}
                    placeholder={tCommon('AvailableWorkoutsFiltersFields.SearchForTextPlaceholder')}
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
                      title={tCommon('AvailableWorkoutsFiltersFields.ClearText')}
                    >
                      <Icons.Close className="size-4" />
                    </Button>
                  )}
                </div>
              </FormControl>
              <FormHint className="text-truncate">{t('SearchTextHint')}</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Search Language (only one language field as requested) */}
        <FormField
          name="searchLang"
          control={form.control}
          render={({ field }) => (
            <FormItem className={cn('flex w-full flex-col gap-2', !field.value && 'opacity-50')}>
              <Label className="truncate" htmlFor={searchLangKey}>
                {getFilterFieldName('searchLang', t)}
              </Label>
              <FormControl>
                <div className="relative flex gap-2">
                  <Input
                    id={searchLangKey}
                    placeholder={tCommon('AvailableWorkoutsFiltersFields.SearchLangPlaceholder')}
                    {...field}
                    value={field.value || ''}
                    className={cn('pr-11')}
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
                      title={tCommon('AvailableWorkoutsFiltersFields.ClearText')}
                    >
                      <Icons.Close className="size-4" />
                    </Button>
                  )}
                </div>
              </FormControl>
              <FormHint className="text-truncate">{t('SearchLangHint')}</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Order By Select */}
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
              <Label className="truncate" htmlFor={orderBySelectKey}>
                {getFilterFieldName('orderBySelect', t)}
              </Label>
              <FormControl>
                <Select value={field.value || ''} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('AvailableWorkoutsFiltersFields.SelectOrderPlaceholder')}
                    />
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
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>
      <FormSection>
        {/* Admin Mode Toggle - Only show for admins */}
        {isAdmin && (
          <FormField
            name="adminMode"
            control={form.control}
            render={({ field }) => (
              <FormItem className={cn('flex w-full flex-col gap-2', !field.value && 'opacity-50')}>
                <div className="flex items-center justify-between">
                  <Label className="truncate" htmlFor={adminModeKey}>
                    {getFilterFieldName('adminMode', t)}
                  </Label>
                  <FormControl>
                    <Switch
                      id={adminModeKey}
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </div>
                <FormHint className="text-truncate">{t('AdminModeHint')}</FormHint>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {/* Has Workout Stats - 3-state selector */}
        <FormField
          name="hasWorkoutStats"
          control={form.control}
          render={({ field }) => {
            const value = field.value === null ? 'null' : String(field.value);
            return (
              <FormItem
                className={cn('flex w-full flex-col gap-2', field.value === null && 'opacity-50')}
              >
                <Label className="truncate" htmlFor={hasWorkoutStatsKey}>
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
                      <SelectValue
                        placeholder={t('AvailableWorkoutsFiltersFields.SelectOptionPlaceholder')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">
                        {t('AvailableWorkoutsFilters.IgnoreStats')}
                      </SelectItem>
                      <SelectItem value="true">
                        {t('AvailableWorkoutsFilters.WithStats')}
                      </SelectItem>
                      <SelectItem value="false">
                        {t('AvailableWorkoutsFilters.WithoutStats')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormHint className="text-truncate">{t('HasWorkoutStatsHint')}</FormHint>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        {/* Has Active Workouts - 3-state selector */}
        <FormField
          name="hasActiveWorkouts"
          control={form.control}
          render={({ field }) => {
            const value = field.value === null ? 'null' : String(field.value);
            return (
              <FormItem
                className={cn('flex w-full flex-col gap-2', field.value === null && 'opacity-50')}
              >
                <Label className="truncate" htmlFor={hasActiveWorkoutsKey}>
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
                      <SelectValue
                        placeholder={t('AvailableWorkoutsFiltersFields.SelectOptionPlaceholder')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">
                        {t('AvailableWorkoutsFilters.IgnoreActive')}
                      </SelectItem>
                      <SelectItem value="true">
                        {t('AvailableWorkoutsFilters.WithActive')}
                      </SelectItem>
                      <SelectItem value="false">
                        {t('AvailableWorkoutsFilters.WithoutActive')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormHint className="text-truncate">{t('HasActiveWorkoutsHint')}</FormHint>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        {/* Date Range Filters - Grouped into from-to pairs */}
        <div className="grid grid-cols-1 gap-4">
          {/* Started Date Range */}
          <div className="grid grid-cols-2 gap-2">
            <FormField
              name="minStarted"
              control={form.control}
              render={({ field }) => (
                <FormItem
                  className={cn('flex w-full flex-col gap-1', !field.value && 'opacity-50')}
                >
                  <Label className="truncate text-xs" htmlFor={minStartedKey}>
                    {t('AvailableWorkoutsFiltersFields.StartedFrom')}
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
                <FormItem
                  className={cn('flex w-full flex-col gap-1', !field.value && 'opacity-50')}
                >
                  <Label className="truncate text-xs" htmlFor={maxStartedKey}>
                    {t('AvailableWorkoutsFiltersFields.StartedTo')}
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
          </div>

          {/* Finished Date Range */}
          <div className="grid grid-cols-2 gap-2">
            <FormField
              name="minFinished"
              control={form.control}
              render={({ field }) => (
                <FormItem
                  className={cn('flex w-full flex-col gap-1', !field.value && 'opacity-50')}
                >
                  <Label className="truncate text-xs" htmlFor={minFinishedKey}>
                    {t('AvailableWorkoutsFiltersFields.FinishedFrom')}
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
                <FormItem
                  className={cn('flex w-full flex-col gap-1', !field.value && 'opacity-50')}
                >
                  <Label className="truncate text-xs" htmlFor={maxFinishedKey}>
                    {t('AvailableWorkoutsFiltersFields.FinishedTo')}
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
        </div>
      </FormSection>
    </div>
  );
}
