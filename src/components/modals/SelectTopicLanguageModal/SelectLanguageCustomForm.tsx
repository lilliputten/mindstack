'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { TLanguage, TLanguageId } from '@/lib/types/language';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';
import { TTopicLanguageData } from '@/features/topics/types';

import { maxIdLength, maxNameLength } from './constants';

type TFormData = TLanguage;

interface TProps {
  className?: string;
  langCode?: TLanguageId;
  langName?: string;
  // Handlers...
  selectLanguage: (language: TTopicLanguageData) => void; // Promise<TLanguage[]>;
  hideModal: () => void;
  setAnyLanguage?: () => void;
  resetLanguage?: () => void;
}

export const SelectLanguageCustomForm: React.FC<TProps> = (props) => {
  const {
    className,
    langCode,
    langName,
    // Handlers...
    selectLanguage,
    hideModal,
    setAnyLanguage,
    resetLanguage,
  } = props;

  const t = useT();

  const formSchema = React.useMemo(
    () =>
      z.object({
        id: z.string().max(maxIdLength).optional(),
        name: z.string().max(maxNameLength).optional(),
      }),
    [],
  );

  const defaultValues: TLanguage = React.useMemo(
    () => ({
      id: langCode || '',
      name: langName || '',
    }),
    [langCode, langName],
  );

  const {
    // @see https://react-hook-form.com/docs/useform
    formState, // FormState<TFieldValues>;
    handleSubmit, // UseFormHandleSubmit<TFieldValues, TTransformedValues>;
    register, // UseFormRegister<TFieldValues>;
  } = useForm<TFormData>({
    // @see https://react-hook-form.com/docs/useform
    mode: 'onChange', // Validation strategy before submitting behaviour.
    criteriaMode: 'all', // Display all validation errors or one at a time.
    resolver: zodResolver(formSchema),
    defaultValues, // Default values for the form.
  });

  const {
    // @see https://react-hook-form.com/docs/useform/formstate
    isDirty, // boolean;
    errors, // FieldErrors<TFieldValues>;
    isValid, // boolean;
  } = formState;

  const isSubmitEnabled = /* !isPending && */ isDirty && isValid;

  const onSubmit = handleSubmit((language) => {
    const topicLang: TTopicLanguageData = {
      langCode: language.id,
      langName: language.name,
      langCustom: true,
    };
    selectLanguage(topicLang);
  });

  // TODO: Update forms accordng to `app/(protected)/dashboard/wordsSets/AddWordsSet/AddWordsSetBlock.tsx`

  return (
    <div
      className={cn(
        className,
        isDev && '__SelectLanguageCustomForm', // DEBUG
        'w-full py-2',
      )}
    >
      <p
        className={cn(
          className,
          isDev && '__SelectLanguageCustomForm_Form', // DEBUG
          'Text mb-4 text-sm text-muted-foreground',
        )}
      >
        {t('SelectLanguageCustomForm.SelectLanguageText')}
      </p>
      <form onSubmit={onSubmit}>
        <div className="flex w-full flex-col items-center gap-4">
          <div className="flex w-full flex-col gap-4">
            <Input
              id="id"
              className="flex-1"
              size={maxIdLength}
              placeholder={t('SelectLanguageCustomForm.LanguageCode')}
              // @see https://react-hook-form.com/docs/useform/register
              {...register('id', { required: true })}
            />
            {errors?.id && <p className="pb-0.5 text-sm text-red-600">{errors.id.message}</p>}
          </div>
          <div className="flex w-full flex-col gap-4">
            <Input
              id="name"
              className="flex-1"
              size={maxNameLength}
              placeholder={t('SelectLanguageCustomForm.LanguageName')}
              // @see https://react-hook-form.com/docs/useform/register
              {...register('name', { required: true })}
            />
            {errors?.name && <p className="pb-0.5 text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div className="flex w-full flex-wrap gap-1">
            <Button
              type="submit"
              variant={isSubmitEnabled ? 'default' : 'disabled'}
              disabled={!isSubmitEnabled}
              className="flex shrink-0 gap-2"
            >
              <Icons.Check className="size-4 shrink-0" />
              <span>{t('SelectLanguageCustomForm.Select')}</span>
            </Button>
            {setAnyLanguage && (
              <Button
                variant="ghost"
                className="flex shrink-0 gap-2"
                onClick={(ev) => {
                  ev.preventDefault();
                  setAnyLanguage();
                }}
              >
                <Icons.Asterisk className="size-6 shrink-0" />
                <span>{t('AnyLanguage')}</span>
              </Button>
            )}
            {resetLanguage && (
              <Button
                variant="ghost"
                className="flex shrink-0 gap-2"
                onClick={(ev) => {
                  ev.preventDefault();
                  resetLanguage();
                }}
              >
                <Icons.Ban className="size-4 shrink-0" />
                <span>{t('Reset')}</span>
              </Button>
            )}
            <Button
              variant="ghost"
              className="flex shrink-0 gap-2"
              onClick={(ev) => {
                ev.preventDefault();
                hideModal();
              }}
            >
              <Icons.X className="size-4 shrink-0" />
              <span>{t('Close')}</span>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
