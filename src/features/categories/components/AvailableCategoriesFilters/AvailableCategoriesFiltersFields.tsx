'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';

import { CategoryStatusSchema } from '@/generated/prisma';

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
import { FormHint } from '@/components/blocks/FormHint';
import * as Images from '@/components/shared/Icons';
import { isDev } from '@/config';
import {
  getFilterFieldName,
  getFiltersLabelValueString,
  maxSearchTextLength,
  orderBySelectDefault,
  orderBySelectOptions,
  TFiltersData,
} from '@/features/categories/contexts/CategoriesFiltersContext';

interface TProps extends TPropsWithClassName {
  form: UseFormReturn<TFiltersData>;
}

function FormSection({ children }: TPropsWithChildren) {
  return (
    <div
      className={cn(
        isDev && '__AvailableCategoriesFiltersFields_FormSection', // DEBUG
        'flex w-full flex-1 flex-col gap-6 py-2 md:w-[45%]',
      )}
    >
      {children}
    </div>
  );
}

export function AvailableCategoriesFiltersFields(props: TProps) {
  const { className, form } = props;
  // See texts aimed to be translated in the `src/features/categories/contexts/CategoriesFiltersContext/CategoriesFiltersTexts.ts`
  const tTexts = useT('AvailableCategoriesFilterTexts');
  const t = useT();

  // Used keys
  const searchTextKey = React.useId();
  const searchLangKey = React.useId();
  const statusKey = React.useId();
  const hasImageKey = React.useId();
  const hasTopicsKey = React.useId();
  const orderBySelectKey = React.useId();

  const statusOptions = CategoryStatusSchema.options;

  return (
    <div
      className={cn(
        isDev && '__AvailableCategoriesFiltersFields', // DEBUG
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
              <Label htmlFor={searchTextKey}>{getFilterFieldName('searchText', tTexts)}</Label>
              <FormControl>
                <div className="relative flex gap-2">
                  <Input
                    id={searchTextKey}
                    placeholder={t('AvailableCategoriesFiltersFields.SearchForTextPlaceholder')}
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
                      title={t('AvailableCategoriesFiltersFields.ClearText')}
                    >
                      <Images.Close className="size-4" />
                    </Button>
                  )}
                </div>
              </FormControl>
              <FormHint>{t('AvailableCategoriesFiltersFields.SearchForTextHint')}</FormHint>
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
                    placeholder={t('AvailableCategoriesFiltersFields.SearchForLanguagePlaceholder')}
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
                      title={t('AvailableCategoriesFiltersFields.ClearText')}
                    >
                      <Images.Close className="size-4" />
                    </Button>
                  )}
                </div>
              </FormControl>
              <FormHint className="MarkdownText">
                {t.rich('AvailableCategoriesFiltersFields.SearchForLanguageHint', {
                  code: (chunks) => <code>{chunks}</code>,
                })}
              </FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="status"
          control={form.control}
          render={({ field }) => (
            <FormItem className={cn('flex w-full flex-col gap-2', !field.value && 'opacity-50')}>
              <Label htmlFor={statusKey}>{getFilterFieldName('status', tTexts)}</Label>
              <FormControl>
                <Select
                  value={field.value || ''}
                  onValueChange={(value) => {
                    field.onChange(value || undefined);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('AvailableCategoriesFiltersFields.SelectStatusPlaceholder')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">
                      {t('AvailableCategoriesFiltersFields.AllStatuses')}
                    </SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {getFiltersLabelValueString('status', status, tTexts)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormHint>{t('AvailableCategoriesFiltersFields.SelectStatusHint')}</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
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
                      placeholder={t('AvailableCategoriesFiltersFields.SelectOrderPlaceholder')}
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
              <FormHint>{t('AvailableCategoriesFiltersFields.ChooseSortOrderHint')}</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>
      <FormSection>
        <FormField
          name="hasImage"
          control={form.control}
          render={({ field }) => {
            const value = field.value === null ? 'null' : String(field.value);
            return (
              <FormItem
                className={cn('flex w-full flex-col gap-2', field.value === null && 'opacity-50')}
              >
                <Label htmlFor={hasImageKey}>{getFilterFieldName('hasImage', tTexts)}</Label>
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
                        placeholder={t('AvailableCategoriesFiltersFields.SelectOptionPlaceholder')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">
                        {getFiltersLabelValueString('hasImage', null, tTexts)}
                      </SelectItem>
                      <SelectItem value="true">
                        {getFiltersLabelValueString('hasImage', true, tTexts)}
                      </SelectItem>
                      <SelectItem value="false">
                        {getFiltersLabelValueString('hasImage', false, tTexts)}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormHint>
                  {t('AvailableCategoriesFiltersFields.DisplayCategoriesWithImageHint')}
                </FormHint>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          name="hasTopics"
          control={form.control}
          render={({ field }) => {
            const value = field.value === null ? 'null' : String(field.value);
            return (
              <FormItem
                className={cn('flex w-full flex-col gap-2', field.value === null && 'opacity-50')}
              >
                <Label htmlFor={hasTopicsKey}>{getFilterFieldName('hasTopics', tTexts)}</Label>
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
                        placeholder={t('AvailableCategoriesFiltersFields.SelectOptionPlaceholder')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">
                        {getFiltersLabelValueString('hasTopics', null, tTexts)}
                      </SelectItem>
                      <SelectItem value="true">
                        {getFiltersLabelValueString('hasTopics', true, tTexts)}
                      </SelectItem>
                      <SelectItem value="false">
                        {getFiltersLabelValueString('hasTopics', false, tTexts)}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormHint>
                  {t('AvailableCategoriesFiltersFields.DisplayCategoriesWithTopicsHint')}
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
