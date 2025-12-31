'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { publicRootRoute } from '@/config/routesConfig';
import { clearLocalStorage, getErrorText } from '@/lib/helpers';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Spinner } from '@/components/shared/Icons';
import { isDev } from '@/config';
import { checkIsAllowedEmail } from '@/features/allowed-users/helpers/checkIsAllowedEmail';

export const emailSignInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type TEmailSignInData = z.infer<typeof emailSignInSchema>;

export type TEmailSignInFormType = ReturnType<typeof useForm<TEmailSignInData>>;

const __debugUseTestEmail = false;

export const defaultValues: TEmailSignInData = {
  email: __debugUseTestEmail && isDev ? 'lilliputten@yandex.ru' : '',
};

interface TProps extends TPropsWithClassName {
  inBody?: boolean;
  isLogging?: boolean;
}

export function EmailSignInForm({ className, isLogging }: TProps) {
  const [isSubmitting, startSubmitting] = React.useTransition();
  const [message, setMessage] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');

  const form = useForm<TEmailSignInData>({
    mode: 'onChange',
    resolver: zodResolver(emailSignInSchema),
    defaultValues,
  });

  const { register, handleSubmit, formState } = form;
  const { errors, isValid, isReady } = formState;

  const isAllReady = isReady;
  const isSumbitAvailable = isAllReady && isValid && !isSubmitting;
  const SubmitIcon = isSubmitting ? Spinner : ArrowRight;

  const onSubmit = handleSubmit((data) => {
    const { email } = data;
    setError('');
    setMessage('');
    startSubmitting(async () => {
      try {
        const rejectReason = await checkIsAllowedEmail(email);
        if (rejectReason) {
          throw new Error(
            `You're currently not allowed to use the application (reject code: ${rejectReason}).`,
          );
        }
        const result = await signIn('nodemailer', {
          email,
          redirect: false,
          // callbackUrl: publicRootRoute,
          // TODO: Pass external redirectUrl
        });
        if (!result || result?.error) {
          throw result?.error;
        }
        // Run a client code ona successfull signin
        clearLocalStorage({ except: ['cookies-accepted'] });
        const msg = 'A login message has been sent. Check your email for a sign-in link.';
        setMessage(msg);
        toast.success(msg);
      } catch (error) {
        const errMsg = ['An error occurred, please try again', getErrorText(error)]
          .filter(Boolean)
          .join(': ');
        // eslint-disable-next-line no-console
        console.error('[EmailSignInForm:onSubmit]', errMsg, {
          email,
          error,
        });
        debugger; // eslint-disable-line no-debugger
        setError(errMsg);
        toast.error(errMsg);
      }
    });
  });

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        isDev && '__EmailSignInForm', // DEBUG
        'flex flex-col gap-3',
        isLogging && 'pointer-events-none opacity-30',
        className,
      )}
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="block text-center text-sm font-medium">
          Or use e-mail:
        </label>
        <div className="flex">
          <input
            {...register('email')}
            id="email"
            type="email"
            placeholder="Enter your email"
            className={cn(
              isDev && '__EmailSignInForm_Input', // DEBUG
              'w-full rounded border px-5 py-2 transition focus:outline-none focus:ring-2',
              'rounded-full rounded-e-none',
              'bg-background text-foreground',
              'h-9',
              errors.email
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-500/20 focus:ring-theme-500',
            )}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!isSumbitAvailable}
            variant="theme"
            rounded="full"
            className={cn(
              isDev && '__EmailSignInForm_Button', // DEBUG
              'rounded-s-none',
              'flex gap-2',
              'h-9',
            )}
          >
            <SubmitIcon className={cn('size-4', isSubmitting && 'animate-spin')} />
          </Button>
        </div>
        {errors.email && <span className="text-sm text-red-500">{errors.email.message}</span>}
      </div>

      {message && !error && <p className={cn('text-center text-sm text-green-500')}>{message}</p>}
      {error && (
        <div className={cn('text-center text-sm text-red-500')}>
          <p>{error}</p>
          <p>Reach administrator via the "Contacts" page.</p>
        </div>
      )}
    </form>
  );
}
