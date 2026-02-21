'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { FormProvider } from '@/components/ui/Form';
import { BusySplashWithInfo } from '@/components/shared';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { AIGenerationsStatusInfo } from '@/features/ai-generations/components';
import { TTopicId } from '@/features/topics/types';

import { GenerateQuestionsFormFields } from './GenerateQuestionsFormFields';
import { TFormData } from './types';

export interface TGenerateQuestionsFormProps {
  form: UseFormReturn<TFormData>;
  generateCallback: (p: TFormData) => Promise<unknown>;
  className?: string;
  isPending?: boolean;
  isGenerating?: boolean;
  handleCancel?: () => void;
  topicId: TTopicId;
}

export function GenerateQuestionsForm(props: TGenerateQuestionsFormProps) {
  const { form, className, generateCallback, isPending, isGenerating, handleCancel } = props;
  const t = useT();

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

        {/* Actions */}
        <div
          className={cn(
            isDev && '__GenerateQuestionsForm_Actions', // DEBUG
            'content-truncate flex w-full flex-wrap gap-2',
          )}
        >
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
