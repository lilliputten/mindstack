'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';

import { TPropsWithChildren, TPropsWithChildrenAndClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/Form';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { FormHint } from '@/components/blocks/FormHint';
import { MarkdownHint } from '@/components/blocks/MarkdownHint';
import { isDev } from '@/constants';

import { TFormData } from './types';

interface TEditAnswerFormFieldsProps {
  form: UseFormReturn<TFormData>;
  className?: string;
  noSections?: boolean;
}

function FormSection({ children }: TPropsWithChildren) {
  return (
    <div
      className={cn(
        isDev && '__EditAnswerFormFields_FormSection',
        'flex w-full flex-1 flex-col gap-6 xl:w-[45%]',
      )}
    >
      {children}
    </div>
  );
}

export function EditAnswerFormFields(props: TEditAnswerFormFieldsProps) {
  const { className, form, noSections } = props;

  const EffectiveSection = !noSections
    ? FormSection
    : ({ children }: TPropsWithChildrenAndClassName) => children;

  const t = useT();
  const textKey = React.useId();
  const explanationKey = React.useId();
  const isCorrectKey = React.useId();
  const isGeneratedKey = React.useId();
  return (
    <div
      className={cn(
        isDev && '__EditAnswerFormFields', // DEBUG
        'flex w-full flex-col gap-6 px-6 py-2',
        !noSections && 'xl:flex-row',
        className,
      )}
    >
      <EffectiveSection>
        <FormField
          name="text"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-4">
              <Label htmlFor={textKey}>{t('EditAnswerFormFields.AnswerText')}</Label>
              <FormControl>
                <Textarea
                  id={textKey}
                  className="flex-1"
                  placeholder={t('EditAnswerFormFields.AnswerTextPlaceholder')}
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormHint>
                {t('EditAnswerFormFields.AnswerTextHint')} <MarkdownHint />
              </FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="explanation"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-4">
              <Label htmlFor={explanationKey}>{t('EditAnswerFormFields.Explanation')}</Label>
              <FormControl>
                <Textarea
                  id={explanationKey}
                  className="flex-1"
                  placeholder={t('EditAnswerFormFields.ExplanationPlaceholder')}
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormHint>
                {t('EditAnswerFormFields.ExplanationHint')} <MarkdownHint />
              </FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
      </EffectiveSection>
      <EffectiveSection>
        <FormField
          name="isCorrect"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-4">
              <Label htmlFor={isCorrectKey}>{t('EditAnswerFormFields.IsCorrect')}</Label>
              <FormControl>
                <Switch
                  id={isCorrectKey}
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-green-500"
                />
              </FormControl>
              <FormHint>{t('EditAnswerFormFields.IsCorrectHint')}</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="isGenerated"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-4">
              <Label htmlFor={isGeneratedKey}>{t('EditAnswerFormFields.IsGenerated')}</Label>
              <FormControl>
                <Switch
                  id={isGeneratedKey}
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-blue-500"
                />
              </FormControl>
              <FormHint>{t('EditAnswerFormFields.IsGeneratedHint')}</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
      </EffectiveSection>
    </div>
  );
}
