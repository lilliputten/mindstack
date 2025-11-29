'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';

import { cn } from '@/lib/utils';
import { FormProvider } from '@/components/ui/Form';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { isDev } from '@/constants';

import { EditQuestionFormFields } from './EditQuestionFormFields';
import { TFormData } from './types';

const __debugShowData = false;

interface TEditQuestionFormProps {
  className?: string;
  form: UseFormReturn<TFormData>;
  handleFormSubmit: (formData: TFormData) => void;
  isPending: boolean;
}

export function EditQuestionForm(props: TEditQuestionFormProps) {
  const { className, form, handleFormSubmit, isPending } = props;
  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className={cn(
          isDev && '__EditQuestionForm', // DEBUG
          'flex w-full flex-col gap-4 overflow-hidden',
          isPending && 'pointer-events-none opacity-50',
          className,
        )}
      >
        <ScrollArea>
          <EditQuestionFormFields form={form} />
        </ScrollArea>
      </form>
    </FormProvider>
  );
}
