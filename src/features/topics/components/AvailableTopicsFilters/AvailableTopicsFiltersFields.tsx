'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';

import { TPropsWithChildren, TPropsWithClassName } from '@/lib/types';
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
import { CategorySelect } from '@/components/shared/CategorySelect';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';
import {
  getFilterFieldName,
  getFiltersLabelValueString,
  maxSearchTextLength,
  orderBySelectDefault,
  orderBySelectOptions,
  TFiltersData,
} from '@/contexts/TopicsFiltersContext';

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
  // See texts aimed to be translated in the `src/contexts/TopicsFiltersContext/TopicsFiltersTexts.ts`
  const tTexts = useT('AvailableTopicsFilterTexts');
  const t = useT();

  // Used keys
  const searchTextKey = React.useId();
  const searchLangKey = React.useId();
  const hasWorkoutStatsKey = React.useId();
  const hasActiveWorkoutsKey = React.useId();
  const hasQuestionsKey = React.useId();
  const showOnlyMyTopicsKey = React.useId();
  const orderBySelectKey = React.useId();
  // const categoryKey = React.useId();

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
        {/* Categories */}
        <CategorySelect
          // form={form}
          // @ts-expect-error - TypeScript doesn't properly infer the exact type compatibility
          control={form.control}
          name="categoryIds"
          label={getFilterFieldName('categoryIds', tTexts)}
          hint={t('AvailableTopicsFiltersFields.CategoriesHint')}
          placeholder={t('AvailableTopicsFiltersFields.SelectCategories')}
        />
        <FormField
          name="searchText"
          control={form.control}
          render={({ field }) => (
            <FormItem className={cn('flex w-full flex-col gap-2', !field.value && 'opacity-50')}>
              <Label htmlFor={searchTextKey}>{getFilterFieldName('searchText', tTexts)}</Label>
              <FormControl>
                <div className="relative flex gap-2">
                  <Input
                    id={searchTextKey}
                    placeholder={t('AvailableTopicsFiltersFields.SearchForTextPlaceholder')}
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
                      title={t('AvailableTopicsFiltersFields.ClearText')}
                    >
                      <Icons.Close className="size-4" />
                    </Button>
                  )}
                </div>
              </FormControl>
              <FormHint>{t('AvailableTopicsFiltersFields.SearchForTextHint')}</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="searchLang"
          control={form.control}
          render={({ field }) => (
            <FormItem className={cn('flex w-full flex-col gap-2', !field.value && 'opacity-50')}>
              <Label htmlFor={searchLangKey}>{getFilterFieldName('searchLang', tTexts)}</Label>
              <FormControl>
                <div className="relative flex gap-2">
                  <Input
                    id={searchLangKey}
                    placeholder={t('AvailableTopicsFiltersFields.SearchForLanguagePlaceholder')}
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
                      title={t('AvailableTopicsFiltersFields.ClearText')}
                    >
                      <Icons.Close className="size-4" />
                    </Button>
                  )}
                </div>
              </FormControl>
              <FormHint className="MarkdownText">
                {t.rich('AvailableTopicsFiltersFields.SearchForLanguageHint', {
                  code: (chunks) => <code>{chunks}</code>,
                })}
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
                  {getFilterFieldName('showOnlyMyTopics', tTexts)}
                </Label>
                <FormControl>
                  <Switch
                    id={showOnlyMyTopicsKey}
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormHint className="MarkdownText">
                  {t('AvailableTopicsFiltersFields.ShowOnlyMyTopicsHint')}
                </FormHint>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </FormSection>
      <FormSection>
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
              <Label htmlFor={orderBySelectKey}>
                {getFilterFieldName('orderBySelect', tTexts)}
              </Label>
              <FormControl>
                <Select value={field.value || ''} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('AvailableTopicsFiltersFields.SelectOrderPlaceholder')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {orderBySelectOptions.map((value) => (
                      <SelectItem key={value} value={value}>
                        {getFiltersLabelValueString('orderBySelect', value, tTexts)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormHint>{t('AvailableTopicsFiltersFields.ChooseSortOrderHint')}</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
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
                  {getFilterFieldName('hasWorkoutStats', tTexts)}
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
                        placeholder={t('AvailableTopicsFiltersFields.SelectOptionPlaceholder')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">
                        {getFiltersLabelValueString('hasWorkoutStats', null, tTexts)}
                      </SelectItem>
                      <SelectItem value="true">
                        {getFiltersLabelValueString('hasWorkoutStats', true, tTexts)}
                      </SelectItem>
                      <SelectItem value="false">
                        {getFiltersLabelValueString('hasWorkoutStats', false, tTexts)}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormHint>{t('AvailableTopicsFiltersFields.DisplayTopicsWithStatsHint')}</FormHint>
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
                  {getFilterFieldName('hasActiveWorkouts', tTexts)}
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
                        placeholder={t('AvailableTopicsFiltersFields.SelectOptionPlaceholder')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">
                        {getFiltersLabelValueString('hasActiveWorkouts', null, tTexts)}
                      </SelectItem>
                      <SelectItem value="true">
                        {getFiltersLabelValueString('hasActiveWorkouts', true, tTexts)}
                      </SelectItem>
                      <SelectItem value="false">
                        {getFiltersLabelValueString('hasActiveWorkouts', false, tTexts)}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormHint>
                  {t('AvailableTopicsFiltersFields.DisplayTopicsWithActiveWorkoutsHint')}
                </FormHint>
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
                <Label htmlFor={hasQuestionsKey}>
                  {getFilterFieldName('hasQuestions', tTexts)}
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
                        placeholder={t('AvailableTopicsFiltersFields.SelectOptionPlaceholder')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">
                        {getFiltersLabelValueString('hasQuestions', null, tTexts)}
                      </SelectItem>
                      <SelectItem value="true">
                        {getFiltersLabelValueString('hasQuestions', true, tTexts)}
                      </SelectItem>
                      <SelectItem value="false">
                        {getFiltersLabelValueString('hasQuestions', false, tTexts)}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormHint>
                  {t('AvailableTopicsFiltersFields.DisplayTopicsWithQuestionsHint')}
                </FormHint>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </FormSection>
    </div>
  );
}
