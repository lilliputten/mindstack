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
  startGeneratingAnswers: (p: TFormData) => Promise<unknown>;
  handleClose?: () => void;
  className?: string;
  isPending?: boolean;
  questionId: TQuestionId; // Is it required here?
}

export function GenerateAnswersForm(props: TGenerateAnswersFormProps) {
  const {
    className,
    startGeneratingAnswers,
    handleClose,
    isPending,
    // questionId,
  } = props;
  const { user, loading: isSessionLoading } = useSessionData();
  const [isLeaving, setLeaving] = React.useState(false);
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

  const {
    // isDirty, // Not required here
    // isSubmitSuccessful, // NOTE: Using `generatedAnswers` instead of
    isValid,
    isSubmitting, // boolean;
    isLoading, // boolean;
  } = formState;

  const isBusy = isLeaving || isSessionLoading || isSubmitting || isLoading || isPending;
  const isSubmitEnabled = !isBusy && isValid;

  const onSubmit = handleSubmit((formData) => {
    // const { generationType, answersCountMin, answersCountMax, extraText } = formData;
    startGeneratingAnswers(formData);
  });

  const onClose = (ev: React.MouseEvent) => {
    setLeaving(true);
    if (handleClose) {
      handleClose();
    }
    ev.preventDefault();
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={onSubmit}
        className={cn(
          isDev && '__GenerateAnswersForm', // DEBUG
          'flex w-full flex-col gap-6',
          className,
        )}
      >
        <AIGenerationsStatusInfo />
        <GenerateAnswersFormFields form={form} />

        {/* Actions */}
        <div
          className={cn(
            isDev && '__GenerateAnswersForm_Actions', // DEBUG
            'content-truncate flex w-full flex-wrap gap-2',
            // isSplashDisplaying && 'justify-center',
          )}
        >
          <Button
            type="submit"
            variant={isSubmitEnabled ? 'success' : 'ghost'}
            disabled={!isSubmitEnabled}
            className={cn(
              isDev && '__GenerateAnswersForm_SaveButton', // DEBUG
              'content-truncate gap-2',
            )}
          >
            <Icons.Check className={cn('size-4 shrink-0')} />{' '}
            <span className="truncate">
              {isBusy
                ? t('GenerateAnswersForm.GeneratingButtonText')
                : t('GenerateAnswersForm.GenerateButtonText')}
            </span>
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            className="content-truncate gap-2"
            disabled={isPending}
          >
            <Icons.Close className="size-4 shrink-0" />
            <span className="truncate">{t('Close')}</span>
          </Button>
        </div>

        {/* LoadingSplash
        <BusySplash
          className={cn(
            isDev && '__GenerateAnswersForm_LoadingSplash', // DEBUG
          )}
          isBusy={isBusy}
        />
        */}
      </form>
    </FormProvider>
  );
}
