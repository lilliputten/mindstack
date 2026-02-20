'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';

import { TPropsWithChildren } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { FormHint } from '@/components/blocks/FormHint';
import { MarkdownHint } from '@/components/blocks/MarkdownHint';
import { Icons, LanguageName } from '@/components/shared';
import { CategorySelect } from '@/components/shared/CategorySelect';
import { isDev } from '@/constants';
import { TTopic } from '@/features/topics/types';

import { TTopicFormData } from './types';

interface TEditTopicFormFieldsProps {
  topic: TTopic;
  isSubmitEnabled?: boolean;
  isPending?: boolean;
  onCancel?: (ev: React.MouseEvent) => void;
  form: UseFormReturn<TTopicFormData>;
  className?: string;
  selectLanguage: () => void;
  resetLanguage: () => void;
}

/**
 * A reusable section component for organizing form content in a responsive layout.
 *
 * @param children - The content to be rendered within the section
 */
function FormSection({ children }: TPropsWithChildren) {
  return (
    <div
      className={cn(
        isDev && '__EditTopicFormFields_FormSection', // DEBUG
        'flex w-full flex-1 flex-col gap-6 py-2 md:w-[45%]',
      )}
    >
      {children}
    </div>
  );
}

export function EditTopicFormFields(props: TEditTopicFormFieldsProps) {
  const { className, form, selectLanguage, resetLanguage } = props;
  const t = useT();
  // Create unique keys for labels
  const nameKey = React.useId();
  const descriptionKey = React.useId();
  const isPublicKey = React.useId();
  const keywordsKey = React.useId();
  const langCodeKey = React.useId();
  const answersCountRandomKey = React.useId();
  const answersCountMinKey = React.useId();
  const answersCountMaxKey = React.useId();
  return (
    <div className={cn('flex w-full flex-col gap-6 px-6 py-2 md:flex-row', className)}>
      <FormSection>
        {/* Categories */}
        <CategorySelect
          // form={form}
          // @ts-expect-error - TypeScript doesn't properly infer the exact type compatibility
          control={form.control}
          name="categoryIds"
          label={t('EditTopicFormFields.Categories')}
          hint={t('EditTopicFormFields.CategoriesHint')}
          placeholder={t('EditTopicFormFields.SelectCategories')}
        />
        {/* name */}
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-4">
              <Label className="truncate" htmlFor={nameKey}>
                {t('EditTopicFormFields.TopicName')}
              </Label>
              <FormControl>
                <Input
                  id={nameKey}
                  type="text"
                  className="flex-1"
                  placeholder={t('EditTopicFormFields.TopicNamePlaceholder')}
                  {...field}
                />
              </FormControl>
              <FormHint className="content-truncate">
                {t('EditTopicFormFields.TopicNameHint')}
              </FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* description */}
        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-4">
              <Label className="truncate" htmlFor={descriptionKey}>
                {t('EditTopicFormFields.TopicDescription')}
              </Label>
              <FormControl>
                <Textarea
                  id={descriptionKey}
                  className="flex-1"
                  placeholder={t('EditTopicFormFields.TopicDescriptionPlaceholder')}
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormHint className="content-truncate">
                {t('EditTopicFormFields.TopicDescriptionHint')} <MarkdownHint />
              </FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>
      <FormSection>
        {/* keywords */}
        <FormField
          name="keywords"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-4">
              <Label className="truncate" htmlFor={keywordsKey}>
                {t('EditTopicFormFields.Keywords')}
              </Label>
              <FormControl>
                <Input
                  id={keywordsKey}
                  type="text"
                  placeholder={t('EditTopicFormFields.KeywordsPlaceholder')}
                  {...field}
                />
              </FormControl>
              <FormHint className="content-truncate">
                {t('EditTopicFormFields.KeywordsHint')}
              </FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* isPublic */}
        <FormField
          name="isPublic"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-4">
              <Label className="truncate" htmlFor={isPublicKey}>
                {t('EditTopicFormFields.IsPublic')}
              </Label>
              <FormControl>
                <Switch id={isPublicKey} checked={!!field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormHint className="content-truncate">
                {t('EditTopicFormFields.IsPublicHint')}
              </FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* langCode */}
        <FormField
          name="langCode"
          control={form.control}
          render={() => {
            const [langCode, langName, langCustom] = form.watch([
              'langCode',
              'langName',
              'langCustom',
            ]);
            return (
              <FormItem className="flex w-full flex-col gap-4">
                <Label className="truncate" htmlFor={langCodeKey}>
                  {t('EditTopicFormFields.TopicLanguage')}
                </Label>
                <Button
                  id={langCodeKey}
                  variant="ghostForm"
                  onClick={(ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    selectLanguage();
                  }}
                  className="flex w-full justify-stretch gap-4 text-left"
                >
                  <span className="flex-1 truncate">
                    {langCode === '-' ? (
                      t('AnyLanguage')
                    ) : langCode || langName ? (
                      <LanguageName langCode={langCode} langName={langName} />
                    ) : (
                      t('EditTopicFormFields.SelectLanguage')
                    )}
                  </span>
                  {langCustom && (
                    <span className="opacity-50">
                      <Icons.Edit className="size-3" />
                    </span>
                  )}
                  {langCode === '-' && (
                    <span className="opacity-50">
                      <Icons.Asterisk className="size-5" />
                    </span>
                  )}
                  {(langCode || langName) && (
                    <Icons.Close
                      onClick={(ev) => {
                        ev.preventDefault();
                        ev.stopPropagation();
                        resetLanguage();
                      }}
                      className="size-4"
                    />
                  )}
                </Button>
                <FormHint className="content-truncate">
                  {t('EditTopicFormFields.TopicLanguageHint')}
                </FormHint>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        {/* answersCountRandom */}
        <FormField
          name="answersCountRandom"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-4">
              <Label className="truncate" htmlFor={answersCountRandomKey}>
                {t('EditTopicFormFields.UseRandomQuestionsCount')}
              </Label>
              <FormControl>
                <Switch
                  id={answersCountRandomKey}
                  checked={!!field.value}
                  onCheckedChange={(value) => {
                    field.onChange(value);
                    // Trigger validation for min/max fields when random is toggled
                    if (value) {
                      form.trigger(['answersCountMin', 'answersCountMax']);
                    }
                  }}
                />
              </FormControl>
              <FormHint className="content-truncate">
                {t('EditTopicFormFields.UseRandomQuestionsCountHint')}
              </FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* answersCountMin, answersCountMax */}
        {!!form.watch('answersCountRandom') && (
          <>
            <FormField
              name="answersCountMin"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex w-full flex-col gap-4">
                  <Label className="truncate" htmlFor={answersCountMinKey}>
                    {t('EditTopicFormFields.MinimalQuestionsCount')}
                  </Label>
                  <FormControl>
                    <Input
                      id={answersCountMinKey}
                      type="number"
                      placeholder={t('EditTopicFormFields.MinimalQuestionsCount')}
                      {...field}
                      onChange={(ev) => field.onChange(Number(ev.target.value) || '')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="answersCountMax"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex w-full flex-col gap-4">
                  <Label className="truncate" htmlFor={answersCountMaxKey}>
                    {t('EditTopicFormFields.MaximalQuestionsCount')}
                  </Label>
                  <FormControl>
                    <Input
                      id={answersCountMaxKey}
                      type="number"
                      placeholder={t('EditTopicFormFields.MaximalQuestionsCount')}
                      {...field}
                      onChange={(ev) => field.onChange(Number(ev.target.value) || '')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
      </FormSection>
    </div>
  );
}
