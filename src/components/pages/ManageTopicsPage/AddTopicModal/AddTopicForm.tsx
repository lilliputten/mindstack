'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { ContentLimitError, getLocalizedLimitError, TContentLimitErrorCode } from '@/lib/errors';
import { getErrorText } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Link, TLocale, useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { FormControl, FormField, FormItem, FormMessage, FormProvider } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { FormHint } from '@/components/blocks/FormHint';
import { CategorySelectField } from '@/components/shared/CategorySelect';
import * as Icons from '@/components/shared/Icons';
import { pricingAliasRoute } from '@/config';
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
  isPublic: TTopic['isPublic'];
  categoryIds: string[];
}

export function AddTopicForm(props: TAddTopicFormProps) {
  const { className, handleAddTopic, handleClose, isPending } = props;
  const t = useT();

  const formSchema = React.useMemo(
    () =>
      z.object({
        name: z.string().min(minNameLength).max(maxNameLength),
        isPublic: z.boolean(),
        categoryIds: z.array(z.string()),
      }),
    [],
  );

  const defaultValues: TFormData = React.useMemo(() => {
    return {
      name: '',
      isPublic: false,
      categoryIds: [],
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

  const [limitsError, setLimitsError] = React.useState<TContentLimitErrorCode | undefined>(
    'TOPICS_LIMIT_REACHED',
  );

  const onSubmit = handleSubmit((formData) => {
    const { name, isPublic, categoryIds } = formData;
    const newTopic: TNewTopic = { name, isPublic, categoryIds };
    return handleAddTopic(newTopic)
      .then(() => {
        // NOTE: The form is processing in the `AddTopicModal`, see `addTopicMutation` hook
        // reset();
        // if (handleClose) {
        //   handleClose();
        // }
        setLimitsError(undefined);
      })
      .catch((error) => {
        const message = t('AddTopicForm.CannotCreateTopic');
        const details = getErrorText(error);
        // Check for ContentLimitError: TOPICS_LIMIT_REACHED and display a message
        let isLimitsError = false;
        if (error instanceof ContentLimitError || error.name === 'ContentLimitError') {
          isLimitsError = true;
          setLimitsError(error.message);
        } else {
          setLimitsError(undefined);
        }
        const comboMsg = [message, details].filter(Boolean).join(': ');
        // eslint-disable-next-line no-console
        console.error('[AddTopicForm:onSubmit]', comboMsg, {
          isLimitsError,
          error,
          newTopic,
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
  const isPublicKey = React.useId();

  const Icon = isPending ? Icons.Spinner : Icons.Check;
  const buttonText = isPending
    ? t('AddTopicForm.AddingButtonText')
    : t('AddTopicForm.AddButtonText');

  return (
    <FormProvider {...form}>
      <form
        onSubmit={onSubmit}
        className={cn(
          isDev && '__AddTopicForm', // DEBUG
          'flex w-full flex-col gap-6',
          className,
        )}
      >
        {limitsError && (
          <div
            data-error-id={limitsError}
            className={cn(
              isDev && '__EditCategoryForm_Error', // DEBUG
              'flex items-center gap-2 rounded-md border border-red-500/30 p-2',
            )}
          >
            <Icons.CircleAlert className="size-6 flex-shrink-0 text-red-500" />
            <p className="text-content text-truncate flex-1 text-sm text-red-500">
              <span className="font-bold">{t('AddTopicForm.CannotCreateTopic')}</span>
              {': '}
              <span>{getLocalizedLimitError(limitsError, t)}</span>
              {'. '}
              {t.rich('ExtraLimitsErrorText', {
                PricesLink: (chunks) => <Link href={pricingAliasRoute}>{chunks}</Link>,
              })}
            </p>
          </div>
        )}

        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-4">
              <Label className="m-0" htmlFor={nameKey}>
                {t('AddTopicForm.TopicName')}
              </Label>
              <FormControl>
                <Input
                  id={nameKey}
                  type="text"
                  className="flex-1"
                  placeholder={t('AddTopicForm.NamePlaceholder')}
                  {...field}
                  onChange={(ev) => field.onChange(ev)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <CategorySelectField
          // @ts-expect-error - TypeScript doesn't properly infer the exact type compatibility
          control={form.control}
          name="categoryIds"
          label={t('AddTopicForm.CategoriesLabel')}
          hint={t('AddTopicForm.CategoriesHint')}
          placeholder={t('AddTopicForm.SelectCategoriesPlaceholder')}
        />
        <FormField
          name="isPublic"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-4">
              <Label className="m-0" htmlFor={isPublicKey}>
                {t('AddTopicForm.IsPublicLabel')}
              </Label>
              <FormControl>
                <Switch id={isPublicKey} checked={!!field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormHint>{t('AddTopicForm.IsPublicHint')}</FormHint>
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
            <span>{t('Cancel')}</span>
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
