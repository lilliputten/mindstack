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
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { FormHint } from '@/components/blocks/FormHint';
import { MarkdownHint } from '@/components/blocks/MarkdownHint';
import { BusySplash, Icons, SuccessSplash } from '@/components/shared';
import { pricingAliasRoute, TRoutePath } from '@/config';
import { isDev } from '@/constants';
import { TAnswer, TAnswerId, TNewAnswer } from '@/features/answers/types';
import { TQuestionId } from '@/features/questions/types';
import { TTopicId } from '@/features/topics';
import { useGoToTheRoute } from '@/hooks';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

import { maxTextLength, minTextLength } from '../constants';

export type TAddAnswerParams = TNewAnswer;

export interface TAddAnswerFormProps {
  handleAddAnswer: (p: TAddAnswerParams) => Promise<unknown>;
  handleClose?: () => void;
  className?: string;
  isPending?: boolean;
  topicId: TTopicId;
  questionId: TQuestionId;
  addedAnswerId?: TAnswerId;
}

export interface TFormData {
  text: TAnswer['text'];
  isCorrect: TAnswer['isCorrect'];
}

export function AddAnswerForm(props: TAddAnswerFormProps) {
  const { className, handleAddAnswer, handleClose, isPending, topicId, questionId, addedAnswerId } =
    props;
  const [isGoingOut, setIsGoingOut] = React.useState(false);
  const t = useT();

  const { manageScope } = useManageTopicsStore();

  // Calculate paths...
  const topicsListRoutePath = `/topics/${manageScope}`;
  const topicRoutePath = `${topicsListRoutePath}/${topicId}`;
  const questionsListRoutePath = `${topicRoutePath}/questions`;
  const questionRoutePath = `${questionsListRoutePath}/${questionId}`;
  const answersListRoutePath = `${questionRoutePath}/answers`;
  // const answerRoutePath = `${answersListRoutePath}/${answerId}`;

  const goToTheRoute = useGoToTheRoute();

  const formSchema = React.useMemo(
    () =>
      z.object({
        text: z.string().min(minTextLength).max(maxTextLength),
        isCorrect: z.boolean(),
      }),
    [],
  );

  const defaultValues: TFormData = React.useMemo(() => {
    return {
      text: '',
      isCorrect: false,
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
  // const isSubmitSuccessful = true; // DEBUG

  const isBusy = isGoingOut || isSubmitting || isLoading || isPending;
  const isSubmitEnabled = !isBusy && isDirty && isValid;
  // const isSubmitEnabled = !isPending && isDirty && isValid;

  const [limitsError, setLimitsError] = React.useState<TContentLimitErrorCode | undefined>();

  const onSubmit = handleSubmit((formData) => {
    const { text, isCorrect } = formData;
    const newAnswer: TNewAnswer = { text, isCorrect, questionId };
    return handleAddAnswer(newAnswer)
      .then(() => {
        setLimitsError(undefined);
      })
      .catch((error) => {
        const message = t('AddAnswerForm.CannotCreateAnswer');
        const details = getErrorText(error);
        // Check for ContentLimitError: ANSWERS_LIMIT_REACHED and display a message
        let isLimitsError = false;
        if (error instanceof ContentLimitError || error.name === 'ContentLimitError') {
          isLimitsError = true;
          setLimitsError(error.message);
        } else {
          setLimitsError(undefined);
        }
        const comboMsg = [message, details].filter(Boolean).join(': ');
        // eslint-disable-next-line no-console
        console.error('[AddAnswerForm:onSubmit]', comboMsg, {
          isLimitsError,
          error,
          newAnswer,
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

  const textKey = React.useId();
  const isCorrectKey = React.useId();

  const SubmitIcon = isPending ? Icons.Spinner : Icons.Check;

  return (
    <FormProvider {...form}>
      <form
        onSubmit={onSubmit}
        className={cn(
          isDev && '__AddAnswerForm', // DEBUG
          'flex w-full flex-col gap-4',
          className,
        )}
      >
        {isSubmitSuccessful ? (
          <SuccessSplash title={t('AddAnswerForm.SuccessfullySavedTitle')} className="px-6">
            {t('CanCloseDialog')}
          </SuccessSplash>
        ) : limitsError ? (
          <div
            data-error-id={limitsError}
            className={cn(
              isDev && '__AddAnswerForm_LimitsError', // DEBUG
              'flex items-center gap-2 rounded-md border border-red-500/30 p-2',
            )}
          >
            <Icons.CircleAlert className="size-6 flex-shrink-0 text-red-500" />
            <p className="content-text content-truncate flex-1 text-sm text-red-500">
              <span className="font-bold">{t('AddAnswerForm.CannotCreateAnswer')}</span>
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
                    {t('AddAnswerForm.AnswerText')}
                  </Label>
                  <FormControl>
                    <Textarea
                      id={textKey}
                      className="flex-1"
                      placeholder={t('AddAnswerForm.AnswerTextPlaceholder')}
                      rows={5}
                      {...field}
                      onChange={(ev) => field.onChange(ev)}
                    />
                  </FormControl>
                  <FormHint>
                    {t('AddAnswerForm.AnswerTextHint')} <MarkdownHint />
                  </FormHint>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="isCorrect"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex w-full flex-col gap-4">
                  <Label className="m-0" htmlFor={isCorrectKey}>
                    {t('AddAnswerForm.IsCorrectLabel')}
                  </Label>
                  <FormControl>
                    <Switch
                      id={isCorrectKey}
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </FormControl>
                  <FormHint>{t('AddAnswerForm.IsCorrectHint')}</FormHint>
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
            isDev && '__AddAnswerForm_Actions', // DEBUG
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
                isDev && '__AddAnswerForm_SaveButton', // DEBUG
                'gap-2',
                // isSubmitSuccessful && 'hidden',
              )}
            >
              <SubmitIcon className={cn('size-4', isBusy && 'animate-spin')} />{' '}
              <span>
                {isBusy ? t('AddAnswerForm.AddingButtonText') : t('AddAnswerForm.AddButtonText')}
              </span>
            </Button>
          )}
          {/* Show a button "Go to the created answer". TODO: Use `router.replace`? */}
          {isSubmitSuccessful && addedAnswerId && (
            <Button
              className="flex gap-2"
              // Go to the route by replacing the current (`.../add`) route
              onClick={() => goToTheRoute(`${answersListRoutePath}/${addedAnswerId}`, true)}
              variant={!isGoingOut ? 'theme' : 'ghost'}
              disabled={isBusy}
            >
              <Link
                href={`${answersListRoutePath}/${addedAnswerId}` as TRoutePath}
                className={cn(
                  'flex gap-2',
                  // buttonVariants({ variant: !isGoingOut ? 'theme' : 'ghost' }),
                  // isBusy && 'disabled',
                )}
                onClick={() => setIsGoingOut(true)}
              >
                <Icons.ArrowRight className="size-4" />
                <span>{t('AddAnswerForm.GoToCreatedAnswer')}</span>
              </Link>
            </Button>
          )}
          <Button
            variant={isSubmitSuccessful && !addedAnswerId ? 'theme' : 'ghost'}
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
            isDev && '__AddAnswerForm_LoadingSplash', // DEBUG
          )}
          isBusy={isBusy}
        />
      </form>
    </FormProvider>
  );
}
