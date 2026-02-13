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
import { BusySplashWithInfo } from '@/components/shared';
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
  className?: string;
  isPending?: boolean;
  isGenerating?: boolean;
  handleCancel?: () => void;
  topicId: TTopicId;
}

export function GenerateQuestionsForm(props: TGenerateQuestionsFormProps) {
  const { className, generateCallback, isPending, isGenerating, handleCancel } = props;
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

  const Icon = isPending ? Icons.Spinner : Icons.Check;

  return (
    <FormProvider {...form}>
      <form
        onSubmit={onSubmit}
        className={cn(
          isDev && '__GenerateQuestionsForm', // DEBUG
          'flex w-full flex-col gap-4',
          className,
        )}
      >
        <div
          className={cn(
            isDev && '__GenerateQuestionsForm_Wrapper', // DEBUG
            'relative transition',
          )}
        >
          <div
            className={cn(
              isDev && '__GenerateQuestionsForm_WrapperContent', // DEBUG
              'flex w-full flex-col gap-4',
              isGenerating && 'opacity-20',
            )}
          >
            <AIGenerationsStatusInfo />
            <GenerateQuestionsFormFields form={form} />
          </div>
          {/* Generating splash */}
          <BusySplashWithInfo
            title="Generating questions..."
            className={cn(
              isDev && '__GenerateQuestionsForm_BusySplash', // DEBUG
              'absolute',
            )}
            isBusy={isGenerating}
          />
        </div>

        <div className="flex w-full gap-2">
          <Button
            type="submit"
            variant={isSubmitEnabled ? 'success' : 'disabled'}
            disabled={!isSubmitEnabled}
            className="gap-2"
          >
            <Icon className={cn('size-4', isPending && 'animate-spin')} />{' '}
            <span>
              {isGenerating
                ? t('GenerateQuestionsForm.GeneratingButtonText')
                : isPending
                  ? t('GenerateQuestionsForm.PreparingButtonText')
                  : t('GenerateQuestionsForm.GenerateButtonText')}
            </span>
          </Button>
          {isGenerating && (
            <Button
              variant="ghost"
              onClick={(ev) => {
                ev.preventDefault();
                handleCancel?.();
              }}
              className="gap-2"
            >
              <Icons.X className="hidden size-4 opacity-50 sm:flex" />
              <span>{t('Cancel')}</span>
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
