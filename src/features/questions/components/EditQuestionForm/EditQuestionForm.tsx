'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormState, useForm, UseFormReturn } from 'react-hook-form';
import z from 'zod';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { FormProvider } from '@/components/ui/Form';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { maxTextLength, minTextLength } from '@/components/pages/ManageTopicQuestions/constants';
import { isDev } from '@/constants';
import { TNewOrOldQuestion } from '@/features/questions/types';

import { EditQuestionFormFields } from './EditQuestionFormFields';
import { TFormData } from './types';

// TODO: To use `questionFormDataSchema`?
const formDataSchema = z.object({
  text: z.string().min(minTextLength).max(maxTextLength),
  extraQuery: z.string().max(maxTextLength).optional(),
  answersCountRandom: z.boolean().optional(),
  answersCountMin: z.union([z.string().optional(), z.number()]),
  answersCountMax: z.union([z.string().optional(), z.number()]),
  isGenerated: z.boolean().optional(),
});

interface TEditQuestionFormProps {
  className?: string;
  fieldsClassName?: string;
  sectionClassName?: string;
  question: TNewOrOldQuestion; // TAvailableQuestion;
  // form: UseFormReturn<TFormData>;
  setForm?: (form: UseFormReturn<TFormData>) => void;
  setFormState?: (formState: FormState<TFormData>) => void;
  handleFormSubmit: (formData: TFormData) => void;
  isPending?: boolean;
  noSections?: boolean;
}

export function EditQuestionForm(props: TEditQuestionFormProps) {
  const {
    className,
    fieldsClassName,
    sectionClassName,
    question,
    setForm,
    setFormState,
    handleFormSubmit,
    isPending,
    noSections,
  } = props;

  const t = useT();

  const formSchema = React.useMemo(
    () =>
      formDataSchema.superRefine((data, ctx) => {
        const { answersCountRandom } = data;
        if (answersCountRandom) {
          const answersCountMin = Number(data.answersCountMin);
          const answersCountMax = Number(data.answersCountMax);
          if (!answersCountMin || answersCountMin < 1) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t('EditQuestionCard.ItShouldBeAPositiveNumber'),
              path: ['answersCountMin'],
            });
          }
          if (!answersCountMax || answersCountMax < 1) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t('EditQuestionCard.ItShouldBeAPositiveNumber'),
              path: ['answersCountMax'],
            });
          }
          if (answersCountMin > answersCountMax) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t('EditQuestionCard.MinimalValueShouldBeLessThanMaximal'),
              path: ['answersCountMin'],
            });
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t('EditQuestionCard.MinimalValueShouldBeLessThanMaximal'),
              path: ['answersCountMax'],
            });
          }
        }
      }),
    [t],
  );

  const defaultValues: TFormData = React.useMemo(
    () => ({
      text: question.text || '',
      extraQuery: question.extraQuery || '',
      answersCountRandom: question.answersCountRandom || false,
      answersCountMin: question.answersCountMin || undefined,
      answersCountMax: question.answersCountMax || undefined,
      isGenerated: question.isGenerated || false,
    }),
    [question],
  );

  // @see https://react-hook-form.com/docs/useform
  const form = useForm<TFormData>({
    // @see https://react-hook-form.com/docs/useform
    mode: 'onChange', // 'all', // Validation strategy before submitting behaviour.
    criteriaMode: 'all', // Display all validation errors or one at a time.
    resolver: zodResolver(formSchema),
    defaultValues, // Default values for the form.
  });

  // Call setForm only once on mount — form identity changes every render and
  // would otherwise trigger an infinite re-render loop in the parent.
  const setFormRef = React.useRef(setForm);
  React.useEffect(() => {
    setFormRef.current?.(form);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // @see https://react-hook-form.com/docs/useform/formstate
  const { isDirty, isValid } = form.formState;

  React.useEffect(() => {
    setFormState?.(form.formState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setFormState, isDirty, isValid]);

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
          <EditQuestionFormFields
            className={fieldsClassName}
            sectionClassName={sectionClassName}
            form={form}
            noSections={noSections}
          />
        </ScrollArea>
      </form>
    </FormProvider>
  );
}
