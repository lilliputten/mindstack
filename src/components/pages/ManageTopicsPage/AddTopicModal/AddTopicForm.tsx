'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { ContentLimitError, getLocalizedLimitError, TContentLimitErrorCode } from '@/lib/errors';
import { getErrorText } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Link, useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { FormControl, FormField, FormItem, FormMessage, FormProvider } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { FormHint } from '@/components/blocks/FormHint';
import { BusySplash, SuccessSplash } from '@/components/shared';
import { CategorySelect } from '@/components/shared/CategorySelect';
import * as Icons from '@/components/shared/Icons';
import { pricingAliasRoute, TRoutePath } from '@/config';
import { isDev } from '@/constants';
import { TNewTopic, TTopic, TTopicId } from '@/features/topics/types';
import { useGoToTheRoute } from '@/hooks';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

import { maxNameLength, minNameLength } from '../constants';

export type TAddTopicParams = TNewTopic;

export interface TAddTopicFormProps {
  handleAddTopic: (p: TAddTopicParams) => Promise<unknown>;
  handleClose?: () => void;
  className?: string;
  isPending?: boolean;
  hasStabilized?: boolean;
  isMounted?: boolean;
  addedTopicId?: TTopicId;
}

export interface TFormData {
  name: TTopic['name'];
  isPublic: TTopic['isPublic'];
  categoryIds: string[];
}

function AddTopicFormComponent(props: TAddTopicFormProps) {
  const { className, handleAddTopic, handleClose, isPending, hasStabilized, addedTopicId } = props;
  const [isGoingOut, setIsGoingOut] = React.useState(false);
  const t = useT();

  const { manageScope } = useManageTopicsStore();

  // Calculate paths...
  const routePath = `/topics/${manageScope}`;

  const goToTheRoute = useGoToTheRoute();

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

    // \<\(isSubmitSuccessful\|isSubmitting\|isLoading\)\>

    isSubmitSuccessful, // boolean;
    isSubmitting, // boolean;
    isLoading, // boolean;
  } = formState;
  // const isSubmitSuccessful = true; // DEBUG

  const isBusy = isGoingOut || isSubmitting || isLoading || isPending;
  const isSubmitEnabled = !isBusy && isDirty && isValid;

  const [limitsError, setLimitsError] = React.useState<TContentLimitErrorCode | undefined>();

  const onSubmit = handleSubmit((formData) => {
    const { name, isPublic, categoryIds } = formData;
    const newTopic: TNewTopic = { name, isPublic, categoryIds };
    return handleAddTopic(newTopic)
      .then(() => {
        /* // NOTE: The form is processing and finalizing in the `AddTopicModal`, see `addTopicMutation` hook
         * reset();
         * if (handleClose) {
         *   handleClose();
         * }
         */
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

  const SubmitIcon = isPending ? Icons.Spinner : Icons.Check;

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
        {isSubmitSuccessful ? (
          <SuccessSplash title={t('AddTopicForm.SuccessfullySavedTitle')} className="px-6">
            {t('CanCloseDialog')}
            {/* The dialog will be closed automatically. */}
          </SuccessSplash>
        ) : limitsError ? (
          <div
            data-error-id={limitsError}
            className={cn(
              isDev && '__AddTopicForm_LimitsError', // DEBUG
              'flex items-center gap-2 rounded-md border border-red-500/30 p-2',
            )}
          >
            <Icons.CircleAlert className="size-6 flex-shrink-0 text-red-500" />
            <p className="content-text content-truncate flex-1 text-sm text-red-500">
              <span className="font-bold">{t('AddTopicForm.CannotCreateTopic')}</span>
              {': '}
              <span>{getLocalizedLimitError(limitsError, t)}</span>
              {'. '}
              {t.rich('ExtraLimitsErrorText', {
                PricesLink: (chunks) => <Link href={pricingAliasRoute}>{chunks}</Link>,
              })}
            </p>
          </div>
        ) : (
          <>
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
                      className="w-full flex-1"
                      placeholder={t('AddTopicForm.NamePlaceholder')}
                      {...field}
                      onChange={(ev) => field.onChange(ev)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <CategorySelect
              // @ts-expect-error - TypeScript doesn't properly infer the exact type compatibility
              control={form.control}
              name="categoryIds"
              label={t('AddTopicForm.CategoriesLabel')}
              hint={t('AddTopicForm.CategoriesHint')}
              placeholder={t('AddTopicForm.SelectCategoriesPlaceholder')}
              enabled={hasStabilized}
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
                    <Switch
                      id={isPublicKey}
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormHint>{t('AddTopicForm.IsPublicHint')}</FormHint>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col justify-between"></div>
          </>
        )}

        {/* Actions */}
        <div
          className={cn(
            isDev && '__AddTopicForm_Actions', // DEBUG
            'flex w-full gap-4',
            isSubmitSuccessful && 'justify-center',
          )}
        >
          {!limitsError && !isSubmitSuccessful && (
            <Button
              type="submit"
              variant={isSubmitEnabled ? 'success' : 'disabled'}
              disabled={!isSubmitEnabled}
              className={cn(
                isDev && '__AddTopicForm_SaveButton', // DEBUG
                'gap-2',
                // isSubmitSuccessful && 'hidden',
              )}
            >
              <SubmitIcon className={cn('size-4', isBusy && 'animate-spin')} />{' '}
              <span>
                {isBusy ? t('AddTopicForm.AddingButtonText') : t('AddTopicForm.AddButtonText')}
              </span>
            </Button>
          )}
          {/* Show a button "Go to the created topic". TODO: Use `router.replace`? */}
          {isSubmitSuccessful && addedTopicId && (
            <Button
              className="flex gap-2"
              // Go to the route by replacing the current (`.../add`) route
              onClick={() => goToTheRoute(`${routePath}/${addedTopicId}`, true)}
              variant={!isGoingOut ? 'theme' : 'ghost'}
              disabled={isBusy}
            >
              <Link
                href={`${routePath}/${addedTopicId}` as TRoutePath}
                className={cn(
                  'flex gap-2',
                  // buttonVariants({ variant: !isGoingOut ? 'theme' : 'ghost' }),
                  // isBusy && 'disabled',
                )}
                onClick={() => setIsGoingOut(true)}
              >
                <Icons.ArrowRight className="size-4" />
                <span>{t('AddTopicForm.GoToCreatedTopic')}</span>
              </Link>
            </Button>
          )}
          <Button
            variant={isSubmitSuccessful && !addedTopicId ? 'theme' : 'ghost'}
            onClick={onClose}
            className="gap-2"
          >
            <Icons.Close className="size-4" />
            <span>{isSubmitSuccessful ? t('Close') : t('Cancel')}</span>
          </Button>
        </div>

        {/* LoadingSplash */}
        <BusySplash
          className={cn(
            isDev && '__AddTopicForm_LoadingSplash', // DEBUG
          )}
          isBusy={isBusy}
        />
      </form>
    </FormProvider>
  );
}

export const AddTopicForm = AddTopicFormComponent;
