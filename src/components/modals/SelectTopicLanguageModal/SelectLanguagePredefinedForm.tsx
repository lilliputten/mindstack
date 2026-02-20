'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { TLanguageId } from '@/lib/types/language';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
// import { Icons } from '@/components/shared';
import { Icons, LanguageName } from '@/components/shared';
import { isDev } from '@/config';
import { predefinedLanguages } from '@/constants/languages';
import { TTopicLanguageData } from '@/features/topics/types';

import { minIdLength } from './constants';

interface TFormData {
  id?: TLanguageId;
}

interface TProps {
  className?: string;
  langCode?: TLanguageId;
  langName?: string;
  selectLanguage: (language: TTopicLanguageData) => void; //Promise<TSelectTopicLanguageData[]>;
  // Handlers...
  hideModal: () => void;
  setAnyLanguage?: () => void;
  resetLanguage?: () => void;
}

export const SelectLanguagePredefinedForm: React.FC<TProps> = (props) => {
  const {
    className,
    langCode,
    // Handlers...
    selectLanguage,
    hideModal,
    setAnyLanguage,
    resetLanguage,
  } = props;
  const t = useT();
  const languagesList = React.useMemo(() => [...predefinedLanguages], []);
  const formSchema = React.useMemo(
    () =>
      z.object({
        id: z.string().min(minIdLength),
      }),
    [],
  );

  const defaultValues = React.useMemo(
    () => ({
      id: langCode && predefinedLanguages.find(({ id }) => id === langCode) ? langCode : undefined,
    }),
    [langCode],
  );

  const form = useForm<TFormData>({
    // @see https://react-hook-form.com/docs/useform
    mode: 'onChange', // Validation strategy before submitting behaviour.
    criteriaMode: 'all', // Display all validation errors or one at a time.
    resolver: zodResolver(formSchema),
    defaultValues, // Default values for the form.
  });
  const {
    // @see https://react-hook-form.com/docs/useform
    formState, // FormState<TFieldValues>;
    handleSubmit, // UseFormHandleSubmit<TFieldValues, TTransformedValues>;
    register, // UseFormRegister<TFieldValues>;
    reset,
    watch,
  } = form;

  // Update form when langCode changes
  React.useEffect(() => {
    if (langCode) {
      reset({ id: langCode });
    }
  }, [langCode, reset]);

  const {
    // @see https://react-hook-form.com/docs/useform/formstate
    isDirty, // boolean;
    isValid, // boolean;
    // errors, // FieldErrors<TFieldValues>;
  } = formState;

  const isSubmitEnabled = /* !isPending && */ isDirty && isValid;

  const onSubmit = handleSubmit((formData) => {
    const { id: languageId } = formData;
    const language = languagesList.find(({ id }) => id === languageId);
    if (!language) {
      toast.error(`Cannot find a language for the id: "${languageId}"`);
      return;
    }
    const topicLang: TTopicLanguageData = {
      langCode: language.id,
      langName: language.name,
      langCustom: false,
    };
    selectLanguage(topicLang);
  });

  const registerSelectField = register('id', { required: true });

  return (
    <div
      className={cn(
        className,
        isDev && '__SelectLanguagePredefinedForm', // DEBUG
        'w-full py-2',
      )}
    >
      <p
        className={cn(
          className,
          isDev && '__SelectLanguagePredefinedForm_Text', // DEBUG
          'mb-4 text-[13px] text-muted-foreground',
        )}
      >
        {t('SelectLanguagePredefinedForm.SelectLanguageText')}
      </p>
      <form onSubmit={onSubmit}>
        <div className="flex w-full flex-col items-center gap-4">
          <div className="flex w-full flex-col gap-4">
            <Label>{t('SelectLanguagePredefinedForm.SelectLanguage')}</Label>
            <Select
              {...registerSelectField}
              value={watch('id')}
              onValueChange={(value) =>
                registerSelectField.onChange({ target: { name: 'id', value } })
              }
              // open={true} // DEBUG
            >
              <SelectTrigger
                className={cn(
                  isDev && '__SelectLanguagePredefinedForm__SelectTrigger', // DEBUG
                  'flex-1',
                )}
                aria-label="Language"
              >
                <SelectValue placeholder={t('SelectLanguagePredefinedForm.SelectLanguage')} />
              </SelectTrigger>
              <SelectContent
                className={cn(
                  isDev && '__SelectLanguagePredefinedForm__SelectContent', // DEBUG
                )}
              >
                {languagesList.map(({ id, name }) => (
                  <SelectItem value={id} key={id} className="text-ellipsis">
                    <LanguageName langCode={id} langName={name} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* errors?.id && <p className="pb-0.5 text-[13px] text-red-600">{errors.id.message}</p> */}
            <p className="text-[13px] text-muted-foreground">
              {t('SelectLanguagePredefinedForm.SelectLanguageFormTheList')}
            </p>
          </div>
          <div className="flex w-full flex-wrap gap-1">
            <Button
              type="submit"
              variant={isSubmitEnabled ? 'default' : 'disabled'}
              disabled={!isSubmitEnabled}
              className="flex shrink-0 gap-2"
            >
              <Icons.Check className="size-4 shrink-0" />
              <span>{t('SelectLanguagePredefinedForm.Select')}</span>
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
