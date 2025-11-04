'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { getErrorText } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { TNewTopic, TTopic } from '@/features/topics/types';

import { maxNameLength, minNameLength } from '../constants';

export type TAddTopicParams = TNewTopic;

export interface TAddTopicFormProps {
  handleAddTopic: (p: TAddTopicParams) => Promise<unknown>;
  handleClose?: () => void;
  className?: string;
  isPending?: boolean;
}

export interface TFormData {
  name: TTopic['name'];
}

export function AddTopicForm(props: TAddTopicFormProps) {
  const { className, handleAddTopic, handleClose, isPending } = props;

  const formSchema = React.useMemo(
    () =>
      z.object({
        name: z.string().min(minNameLength).max(maxNameLength),
      }),
    [],
  );

  const defaultValues: TFormData = React.useMemo(() => {
    return {
      name: '',
    };
  }, []);

  // @see https://react-hook-form.com/docs/useform
  const form = useForm<TFormData>({
    // @see https://react-hook-form.com/docs/useform
    mode: 'onChange', // 'all', // Validation strategy before submitting behaviour.
    // mode: 'all', // Validation strategy before submitting behaviour.
    criteriaMode: 'all', // Display all validation errors or one at a time.
    resolver: zodResolver(formSchema),
    defaultValues, // Default values for the form.
  });

  const {
    // @see https://react-hook-form.com/docs/useform
    formState, // FormState<TFieldValues>;
    handleSubmit, // UseFormHandleSubmit<TFieldValues, TTransformedValues>;
    // register, // UseFormRegister<TFieldValues>;
    // reset, // UseFormReset<TFieldValues>;
    setFocus,
  } = form;

  // Focus the first field (should it be used with a languages list?)
  React.useEffect(() => setFocus('name'), [setFocus]);

  const {
    // @see https://react-hook-form.com/docs/useform/formstate
    isDirty, // boolean;
    // errors, // FieldErrors<TFieldValues>;
    isValid, // boolean;
  } = formState;

  const isSubmitEnabled = !isPending && isDirty && isValid;

  const onSubmit = handleSubmit((formData) => {
    const { name } = formData;
    const newTopic: TNewTopic = { name };
    return handleAddTopic(newTopic)
      .then(() => {
        // reset();
        // if (handleClose) {
        //   handleClose();
        // }
      })
      .catch((error) => {
        const message = getErrorText(error) || 'An unknown error has occurred.';
        // eslint-disable-next-line no-console
        console.error('[AddTopicForm:onSubmit]', message, {
          error,
        });
        debugger; // eslint-disable-line no-debugger
      });
  });

  const onClose = (ev: React.MouseEvent) => {
    if (handleClose) {
      handleClose();
    }
    ev.preventDefault();
  };

  const nameKey = React.useId();

  const Icon = isPending ? Icons.Spinner : Icons.Check;
  const buttonText = isPending ? 'Adding' : 'Add';

  return (
    <Form {...form}>
      <form
        onSubmit={onSubmit}
        className={cn(
          isDev && '__AddTopicForm', // DEBUG
          'flex w-full flex-col gap-4',
          className,
        )}
      >
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-4">
              <Label className="m-0" htmlFor={nameKey}>
                Topic Name
              </Label>
              <FormControl>
                <Input
                  id={nameKey}
                  type="text"
                  className="flex-1"
                  placeholder="Name"
                  {...field}
                  onChange={(ev) => field.onChange(ev)}
                />
              </FormControl>
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
    </Form>
  );
}
