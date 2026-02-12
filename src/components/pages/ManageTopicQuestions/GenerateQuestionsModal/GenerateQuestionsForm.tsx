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
import { questionsGenerationTypes } from '@/features/ai/types/GenerateQuestionsTypes';
import { TTopicId } from '@/features/topics/types';
import { useSessionData } from '@/hooks';

import { GenerateQuestionsFormFields } from './GenerateQuestionsFormFields';
import { formSchema, TFormData } from './types';

export interface TGenerateQuestionsFormProps {
  generateCallback: (p: TFormData) => Promise<unknown>;
  handleClose?: () => void;
  className?: string;
  isPending?: boolean;
  topicId: TTopicId;
  // user?: ExtendedUser;
  error?: string;
}

export function GenerateQuestionsForm(props: TGenerateQuestionsFormProps) {
  const { className, generateCallback, handleClose, isPending, error } = props;
  const t = useT();

  const { user } = useSessionData();
  const isAdmin = user?.role === 'ADMIN';

  const __useDebugData = isDev || isAdmin;

  const defaultValues: TFormData = React.useMemo(
    () => ({
      debugData: __useDebugData,
      questionsGenerationType: questionsGenerationTypes[0],
      questionsCountMin: isDev ? 1 : 5,
      questionsCountMax: isDev ? 1 : 10,
      answersGenerationType: answersGenerationTypes[0],
      answersCountMin: isDev ? 1 : 2,
      answersCountMax: isDev ? 1 : 6,
      extraText: '',
      clientType: defaultAiClientType,
      temperature: defaultAIGenerationTemperature,
    }),
    [__useDebugData],
  );

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
    generateCallback(formData);
  });

  const onClose = (ev: React.MouseEvent) => {
    if (handleClose) {
      handleClose();
    }
    ev.preventDefault();
  };

  const Icon = isPending ? Icons.Spinner : Icons.Check;

  return (
    <FormProvider {...form}>
      <form
        onSubmit={onSubmit}
        className={cn(isDev && '__GenerateQuestionsForm', 'flex w-full flex-col gap-4', className)}
      >
        {error && (
          <div className="flex items-center gap-1 rounded-md border border-red-500/20 bg-red-500/20 p-3 py-2 text-sm">
            <Icons.Warning className="mr-1 size-4 text-red-500 opacity-50" />
            <span className="text-red-500">{error}</span>
          </div>
        )}
        <AIGenerationsStatusInfo />
        <GenerateQuestionsFormFields form={form} />

        <div className="flex w-full gap-4">
          <Button
            type="submit"
            variant={isSubmitEnabled ? 'secondary' : 'disabled'}
            disabled={!isSubmitEnabled}
            className="gap-2"
          >
            <Icon className={cn('size-4', isPending && 'animate-spin')} />{' '}
            <span>
              {isPending
                ? t('GenerateQuestionsForm.PreparingButtonText')
                : t('GenerateQuestionsForm.GenerateButtonText')}
            </span>
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
