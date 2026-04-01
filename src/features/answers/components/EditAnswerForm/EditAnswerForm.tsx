'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';

import { cn } from '@/lib/utils';
import { FormProvider } from '@/components/ui/Form';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { isDev } from '@/constants';

import { EditAnswerFormFields } from './EditAnswerFormFields';
import { TFormData } from './types';

interface TEditAnswerFormProps {
  className?: string;
  form: UseFormReturn<TFormData>;
  handleFormSubmit: (formData: TFormData) => void;
  isPending: boolean;
  fieldsClassName?: string;
}

export function EditAnswerForm(props: TEditAnswerFormProps) {
  const { className, form, handleFormSubmit, isPending, fieldsClassName } = props;

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className={cn(
          isDev && '__EditAnswerForm',
          'flex w-full flex-col gap-4 overflow-hidden',
          isPending && 'pointer-events-none opacity-50',
          className,
        )}
      >
        <ScrollArea>
          <EditAnswerFormFields form={form} className={fieldsClassName} />
        </ScrollArea>
      </form>
    </FormProvider>
  );
}
