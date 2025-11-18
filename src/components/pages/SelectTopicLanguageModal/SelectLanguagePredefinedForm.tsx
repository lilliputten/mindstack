'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { TLanguageId } from '@/lib/types/language';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import * as Icons from '@/components/shared/Icons';
import { predefinedLanguages } from '@/constants/languages';
import { TTopicLanguageData } from '@/features/topics/types';

import { minIdLength } from './constants';

interface TFormData {
  id?: TLanguageId;
}

interface TProps {
  selectLanguage: (language: TTopicLanguageData) => void; //Promise<TSelectTopicLanguageData[]>;
  className?: string;
  langCode?: TLanguageId;
  langName?: string;
}

export const SelectLanguagePredefinedForm: React.FC<TProps> = (props) => {
  const { className, selectLanguage, langCode } = props;
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
    mode: 'all', // Validation strategy before submitting behaviour.
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
    <div className={cn(className, '__SelectLanguagePredefinedForm', 'py-2')}>
      <p className="Text mb-4 text-[13px] text-muted-foreground">
        Select a language from the predefined list.
      </p>
      <form onSubmit={onSubmit}>
        <div className="flex w-full flex-col items-center gap-4">
          <div className="flex w-full flex-col gap-4">
            <Label className="-sr-only" htmlFor="id">
              Select language
            </Label>
            <Select
              {...registerSelectField}
              value={watch('id')}
              onValueChange={(value) =>
                registerSelectField.onChange({ target: { name: 'id', value } })
              }
            >
              <SelectTrigger
                className="SelectLanguagePredefinedForm__SelectTrigger flex-1"
                aria-label="Language"
              >
                <SelectValue placeholder="Select a language…" />
              </SelectTrigger>
              <SelectContent className="SelectLanguagePredefinedForm__SelectContent">
                {languagesList.map(({ id, name }) => (
                  <SelectItem value={id} key={id} className="text-ellipsis">
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* errors?.id && <p className="pb-0.5 text-[13px] text-red-600">{errors.id.message}</p> */}
            <p className="text-[13px] text-muted-foreground">Select a language form the list.</p>
          </div>
          <div className="flex w-full gap-4">
            <Button
              type="submit"
              variant={isSubmitEnabled ? 'default' : 'disabled'}
              disabled={!isSubmitEnabled}
              className="flex shrink-0 gap-2"
            >
              <Icons.Check className="size-4" />
              <span>Select</span>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
