'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { FormControl, FormField, FormItem, FormMessage, FormProvider } from '@/components/ui/Form';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { FormHint } from '@/components/blocks/FormHint';
import { MarkdownHint } from '@/components/blocks/MarkdownHint';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { TNewQuestion, TQuestion } from '@/features/questions/types';
import { TTopicId } from '@/features/topics/types';

import { maxTextLength, minTextLength } from '../constants';

export type TAddQuestionParams = TNewQuestion;

export interface TAddQuestionFormProps {
  handleAddQuestion: (p: TAddQuestionParams) => Promise<unknown>;
  handleClose?: () => void;
  className?: string;
  isPending?: boolean;
  topicId: TTopicId;
}

export interface TFormData {
  text: TQuestion['text'];
}

export function AddQuestionForm(props: TAddQuestionFormProps) {
  const { className, handleAddQuestion, handleClose, isPending, topicId } = props;

  const formSchema = React.useMemo(
    () =>
      z.object({
        text: z.string().min(minTextLength).max(maxTextLength),
      }),
    [],
  );

  const defaultValues: TFormData = React.useMemo(() => {
    return {
      text: '',
    };
  }, []);

  // @see https://react-hook-form.com/docs/useform
  const form = useForm<TFormData>({
    mode: 'onChange',
    criteriaMode: 'all',
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { formState, handleSubmit, setFocus } = form;

  // Focus the first field (should it be used with a languages list?)
  React.useEffect(() => setFocus('text'), [setFocus]);

  const { isDirty, isValid } = formState;

  const isSubmitEnabled = !isPending && isDirty && isValid;

  const onSubmit = handleSubmit((formData) => {
    const { text } = formData;
    const newQuestion: TNewQuestion = { text, topicId, isGenerated: false };
    handleAddQuestion(newQuestion);
  });

  const onClose = (ev: React.MouseEvent) => {
    if (handleClose) {
      handleClose();
    }
    ev.preventDefault();
  };

  const textKey = React.useId();

  const Icon = isPending ? Icons.Spinner : Icons.Check;
  const buttonText = isPending ? 'Adding' : 'Add';

  return (
    <FormProvider {...form}>
      <form
        onSubmit={onSubmit}
        className={cn(
          isDev && '__AddQuestionForm', // DEBUG
          'flex w-full flex-col gap-4',
          className,
        )}
      >
        <FormField
          name="text"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-4">
              <Label className="m-0" htmlFor={textKey}>
                Question Text
              </Label>
              <FormControl>
                <Textarea
                  id={textKey}
                  className="flex-1"
                  placeholder="Text"
                  rows={5}
                  {...field}
                  onChange={(ev) => field.onChange(ev)}
                />
              </FormControl>
              <FormHint>
                You'll be able to edit it later, as well as other question poroperties.{' '}
                <MarkdownHint />
              </FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col justify-between"></div>
        {/* Actions */}
        <div className="flex w-full gap-4">
          <Button
            type="submit"
            variant={isSubmitEnabled ? 'success' : 'disabled'}
            disabled={!isSubmitEnabled}
            className="gap-2"
          >
            <Icon className={cn('size-4', isPending && 'animate-spin')} /> <span>{buttonText}</span>
          </Button>
          <Button variant="ghost" onClick={onClose} className="gap-2">
            <Icons.Close className="size-4" />
            <span>Cancel</span>
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
