'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { pricingAliasRoute } from '@/config/routesConfig';
import { ContentLimitError, getLocalizedLimitError, TContentLimitErrorCode } from '@/lib/errors';
import { getErrorText } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Link, useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { FormControl, FormField, FormItem, FormMessage, FormProvider } from '@/components/ui/Form';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { FormHint } from '@/components/blocks/FormHint';
import { MarkdownHint } from '@/components/blocks/MarkdownHint';
import { BusySplash, SuccessSplash } from '@/components/shared';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { TNewQuestion } from '@/features/questions/types';

import { maxTextLength, minTextLength } from '../constants';

const formSchema = z.object({
  text: z.string().min(minTextLength).max(maxTextLength),
});
export type TFormData = z.infer<typeof formSchema>;

type TMinimalNewQuestion = Pick<TNewQuestion, 'text'>;

export interface TAddQuestionFormProps {
  handleAddQuestion: (p: TMinimalNewQuestion) => Promise<unknown>;
  onClose?: () => void;
  className?: string;
  isPending?: boolean;
  closeImmediatelly?: boolean;
  goToAddedQuestion?: () => void;
}

export function AddQuestionForm(props: TAddQuestionFormProps) {
  const { className, handleAddQuestion, onClose, isPending, closeImmediatelly, goToAddedQuestion } =
    props;
  const [isGoingOut, setIsGoingOut] = React.useState(false);
  const t = useT();

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

  const {
    isDirty,
    isValid,
    isSubmitSuccessful, // boolean;
    isSubmitting, // boolean;
    isLoading, // boolean;
  } = formState;

  const isBusy = isGoingOut || isSubmitting || isLoading || isPending;
  const isSubmitEnabled = !isBusy && isDirty && isValid;

  const [limitsError, setLimitsError] = React.useState<TContentLimitErrorCode | undefined>();

  const onSubmit = handleSubmit((formData) => {
    const { text } = formData;
    const newQuestion: TMinimalNewQuestion = { text };
    return handleAddQuestion(newQuestion)
      .then(() => {
        setLimitsError(undefined);
        if (closeImmediatelly) {
          onClose?.();
        }
      })
      .catch((error) => {
        const message = t('AddQuestionForm.CannotCreateQuestion');
        const details = getErrorText(error);
        // Check for ContentLimitError: QUESTIONS_LIMIT_REACHED and display a message
        let isLimitsError = false;
        if (error instanceof ContentLimitError || error.name === 'ContentLimitError') {
          isLimitsError = true;
          setLimitsError(error.message);
        } else {
          setLimitsError(undefined);
        }
        const comboMsg = [message, details].filter(Boolean).join(': ');
        // eslint-disable-next-line no-console
        console.error('[AddQuestionForm:onSubmit]', comboMsg, {
          isLimitsError,
          error,
          newQuestion,
        });
        debugger; // eslint-disable-line no-debugger
      });
  });

  const textKey = React.useId();

  const SubmitIcon = isPending ? Icons.Spinner : Icons.Check;

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
        {isSubmitSuccessful ? (
          <SuccessSplash title={t('AddQuestionForm.QuestionAdded')} className="w-full px-6">
            {t('CanCloseDialog')}
          </SuccessSplash>
        ) : limitsError ? (
          <div
            data-error-id={limitsError}
            className={cn(
              isDev && '__AddQuestionForm_LimitsError', // DEBUG
              'flex items-center gap-2 rounded-md border border-red-500/30 p-2',
            )}
          >
            <Icons.CircleAlert className="size-6 flex-shrink-0 text-red-500" />
            <p className="content-text content-truncate flex-1 text-sm text-red-500">
              <span className="font-bold">{t('AddQuestionForm.CannotCreateQuestion')}</span>
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
              name="text"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex w-full flex-col gap-4">
                  <Label className="m-0" htmlFor={textKey}>
                    {t('AddQuestionForm.QuestionText')}
                  </Label>
                  <FormControl>
                    <Textarea
                      id={textKey}
                      className="flex-1"
                      placeholder={t('AddQuestionForm.QuestionTextPlaceholder')}
                      rows={5}
                      {...field}
                      onChange={(ev) => field.onChange(ev)}
                    />
                  </FormControl>
                  <FormHint>
                    {t('AddQuestionForm.QuestionTextHint')} <MarkdownHint />
                  </FormHint>
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
            isDev && '__AddQuestionForm_Actions', // DEBUG
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
                isDev && '__AddQuestionForm_SaveButton', // DEBUG
                'gap-2',
                // isSubmitSuccessful && 'hidden',
              )}
            >
              <SubmitIcon className={cn('size-4', isBusy && 'animate-spin')} />{' '}
              <span>
                {isBusy
                  ? t('AddQuestionForm.AddingButtonText')
                  : t('AddQuestionForm.AddButtonText')}
              </span>
            </Button>
          )}
          {/* Show a button "Go to the created question". TODO: Use `router.replace`? */}
          {isSubmitSuccessful && goToAddedQuestion && (
            <Button
              className="flex gap-2"
              onClick={() => {
                setIsGoingOut(true);
                goToAddedQuestion();
              }}
              variant={!isGoingOut ? 'theme' : 'ghost'}
              disabled={isBusy}
            >
              <Icons.ArrowRight className="size-4" />
              <span>{t('AddQuestionForm.GoToCreatedQuestion')}</span>
            </Button>
          )}
          <Button
            variant={isSubmitSuccessful ? 'theme' : 'ghost'}
            onClick={(ev) => {
              ev.preventDefault();
              if (onClose) {
                onClose();
              }
            }}
            className="gap-2"
          >
            <Icons.Close className="size-4" />
            <span>{isSubmitSuccessful ? t('Close') : t('Cancel')}</span>
          </Button>
        </div>

        {/* LoadingSplash */}
        <BusySplash
          className={cn(
            isDev && '__AddQuestionForm_LoadingSplash', // DEBUG
          )}
          isBusy={isBusy}
        />
      </form>
    </FormProvider>
  );
}
