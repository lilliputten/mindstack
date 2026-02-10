'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { defaultAIGenerationTemperature } from '@/config/env';
import { defaultAiClientType } from '@/lib/ai/types/TAiClientType';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { FormProvider } from '@/components/ui/Form';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { AIGenerationsStatusInfo } from '@/features/ai-generations/components';
import { answersGenerationTypes } from '@/features/ai/types/GenerateAnswersTypes';
import { TQuestionId } from '@/features/questions/types';
import { useSessionData } from '@/hooks';

import { GenerateAnswersFormFields } from './GenerateAnswersFormFields';
import { formSchema, TFormData } from './types';

export interface TGenerateAnswersFormProps {
  handleGenerateAnswers: (p: TFormData) => Promise<unknown>;
  handleClose?: () => void;
  className?: string;
  isPending?: boolean;
  questionId: TQuestionId; // Is it required here?
  error?: string;
}

export function GenerateAnswersForm(props: TGenerateAnswersFormProps) {
  const {
    className,
    handleGenerateAnswers,
    handleClose,
    isPending,
    // questionId,
    error,
  } = props;
  const {
    user,
    // loading: isSessionLoading,
  } = useSessionData();
  const isAdmin = user?.role === 'ADMIN';
  const t = useT();

  const __useDebugData = isDev || isAdmin;

  const defaultValues: TFormData = React.useMemo(
    () => ({
      debugData: __useDebugData,
      answersGenerationType: answersGenerationTypes[0],
      answersCountMin: isDev ? 1 : 2,
      answersCountMax: isDev ? 1 : 6,
      extraText: '',
      clientType: defaultAiClientType,
      temperature: defaultAIGenerationTemperature,
    }),
    [__useDebugData],
  );

  // @see https://react-hook-form.com/docs/useform
  const form = useForm<TFormData>({
    mode: 'onChange',
    criteriaMode: 'all',
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { formState, handleSubmit } = form;

  const { isValid } = formState;

  const isSubmitEnabled = !isPending && isValid;

  const onSubmit = handleSubmit((formData) => {
    // const { generationType, answersCountMin, answersCountMax, extraText } = formData;
    handleGenerateAnswers(formData);
  });

  const onClose = (ev: React.MouseEvent) => {
    if (handleClose) {
      handleClose();
    }
    ev.preventDefault();
  };

  const Icon = isPending ? Icons.Spinner : Icons.Check;
  const buttonText = isPending
    ? t('GenerateAnswersForm.GeneratingButtonText')
    : t('GenerateAnswersForm.GenerateButtonText');

  return (
    <FormProvider {...form}>
      <form
        onSubmit={onSubmit}
        className={cn(
          isDev && '__GenerateAnswersForm', // DEBUG
          'flex w-full flex-col gap-4',
          className,
        )}
      >
        {error && (
          <div className="flex items-center gap-1 rounded-md border border-red-500/20 bg-red-500/20 p-3 py-2 text-sm">
            <Icons.Warning className="mr-1 size-4 text-red-500 opacity-50" />
            <span className="text-red-500">{error}</span>
          </div>
        )}
        <AIGenerationsStatusInfo />
        <GenerateAnswersFormFields form={form} />
        <div className="flex flex-col justify-between"></div>
        {/* Actions */}
        <div className="flex w-full gap-4">
          <Button
            type="submit"
            variant={isSubmitEnabled ? 'secondary' : 'disabled'}
            disabled={!isSubmitEnabled}
            className="gap-2"
          >
            <Icon className={cn('size-4', isPending && 'animate-spin')} /> <span>{buttonText}</span>
          </Button>
          <Button variant="ghost" onClick={onClose} className="gap-2">
            <Icons.Close className="hidden size-4 opacity-50 sm:flex" />
            <span>{t('Cancel')}</span>
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
