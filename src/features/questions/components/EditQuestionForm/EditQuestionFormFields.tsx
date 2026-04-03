'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';

import { TPropsWithChildrenAndClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { FormHint } from '@/components/blocks/FormHint';
import { MarkdownHint } from '@/components/blocks/MarkdownHint';
import { isDev } from '@/constants';

import { TFormData } from './types';

interface TEditQuestionFormFieldsProps {
  form: UseFormReturn<TFormData>;
  className?: string;
  sectionClassName?: string;
  noSections?: boolean;
}

function FormSection({ children, className }: TPropsWithChildrenAndClassName) {
  return (
    <div
      className={cn(
        isDev && '__EditQuestionFormFields_FormSection', // DEBUG
        'flex w-full flex-1 flex-col gap-6 xl:w-[45%]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function EditQuestionFormFields(props: TEditQuestionFormFieldsProps) {
  const { className, sectionClassName, form, noSections } = props;

  const EffectiveSection = !noSections
    ? FormSection
    : ({ children }: TPropsWithChildrenAndClassName) => children;

  const t = useT();

  // Create unique keys for labels
  const textKey = React.useId();
  const extraQueryKey = React.useId();
  const answersCountRandomKey = React.useId();
  const answersCountMinKey = React.useId();
  const answersCountMaxKey = React.useId();
  const isGeneratedKey = React.useId();

  return (
    <div
      className={cn(
        isDev && '__EditQuestionFormFields', // DEBUG
        'flex w-full flex-col gap-6 px-6 py-2',
        !noSections && 'xl:flex-row',
        className,
      )}
    >
      <EffectiveSection className={sectionClassName}>
        {/* text */}
        <FormField
          name="text"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-4">
              <Label htmlFor={textKey}>{t('EditQuestionFormFields.QuestionText')}</Label>
              <FormControl>
                <Textarea
                  id={textKey}
                  className="flex-1"
                  placeholder={t('EditQuestionFormFields.QuestionTextPlaceholder')}
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormHint>
                {t('EditQuestionFormFields.QuestionTextHint')} <MarkdownHint />
              </FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* extraQuery */}
        <FormField
          name="extraQuery"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-4">
              <Label htmlFor={extraQueryKey}>
                {t('EditQuestionFormFields.QuestionExtraQuery')}
              </Label>
              <FormControl>
                <Textarea
                  id={extraQueryKey}
                  className="flex-1"
                  placeholder={t('EditQuestionFormFields.QuestionExtraQueryPlaceholder')}
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormHint>{t('EditQuestionFormFields.QuestionExtraQueryHint')}</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
      </EffectiveSection>
      <EffectiveSection className={sectionClassName}>
        <FormField
          name="answersCountRandom"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-4">
              <Label htmlFor={answersCountRandomKey}>
                {t('EditQuestionFormFields.UseRandomQuestionsCount')}
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
              <FormHint>{t('EditQuestionFormFields.UseRandomQuestionsCountHint')}</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
        {!!form.watch('answersCountRandom') && (
          <>
            <FormField
              name="answersCountMin"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex w-full flex-col gap-4">
                  <Label htmlFor={answersCountMinKey}>
                    {t('EditQuestionFormFields.MinimalQuestionsCount')}
                  </Label>
                  <FormControl>
                    <Input
                      id={answersCountMinKey}
                      type="number"
                      className="w-full flex-1"
                      placeholder={t('EditQuestionFormFields.MinimalQuestionsCount')}
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
                  <Label htmlFor={answersCountMaxKey}>
                    {t('EditQuestionFormFields.MaximalQuestionsCount')}
                  </Label>
                  <FormControl>
                    <Input
                      id={answersCountMaxKey}
                      type="number"
                      className="w-full flex-1"
                      placeholder={t('EditQuestionFormFields.MaximalQuestionsCount')}
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
        {/* isGenerated */}
        <FormField
          name="isGenerated"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-4">
              <Label htmlFor={isGeneratedKey}>{t('EditQuestionFormFields.IsGenerated')}</Label>
              <FormControl>
                <Switch
                  id={isGeneratedKey}
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-blue-500"
                />
              </FormControl>
              <FormHint>{t('EditQuestionFormFields.IsGeneratedHint')}</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
      </EffectiveSection>
    </div>
  );
}
