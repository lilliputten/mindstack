'use client';

import React from 'react';

import { publicRootRoute } from '@/config/routesConfig';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';
import { useT } from '@/i18n';

type TProps = {
  inBody?: boolean;
  redirectUrl?: string;
} & TPropsWithClassName;

export function TelegramSignInForm(props: TProps) {
  const { className, redirectUrl } = props;
  const t = useT();
  const [token, setToken] = React.useState('');
  const trimmedToken = token.trim();
  const isValidToken = !trimmedToken || /^[a-zA-Z0-9]+$/.test(trimmedToken);
  const hasInvalidFormat = !isValidToken;
  const isSubmitEnabled = trimmedToken && isValidToken;
  const actionUrlStr =
    '/api/auth/callback/telegram' +
    (redirectUrl ? `?callbackUrl=${encodeURIComponent(redirectUrl)}` : '');
  /* // NOTE: It requires testing
   * console.log('[TelegramSignInForm] Test redirectUrl', {
   *   actionUrlStr,
   *   redirectUrl,
   * });
   * debugger;
   */
  /* // TODO: Use `URL` constructor?
   * const actionUrl = new URL('/api/auth/callback/telegram');
   * const params = actionUrl.searchParams;
   * if (redirectUrl) {
   *   params.set('callbackUrl', redirectUrl);
   * }
   * const actionUrlStr = actionUrl.toString();
   */
  // TODO: Try to pass `redirectUrl` parameter with tegeram bot url's `start` parameter (in the `TelegramSignIn`, see `telegramUrl` construction
  return (
    <form
      action={actionUrlStr}
      method="GET"
      className={cn(
        isDev && '__TelegramSignInForm', // DEBUG
        'flex flex-col gap-3',
        className,
      )}
    >
      <input type="hidden" name="callbackUrl" value={publicRootRoute} />
      <div className="flex flex-col gap-2">
        <label htmlFor="token" className="block text-center text-sm font-medium">
          {t('TelegramSignInForm.EnterTokenLabel')}
        </label>
        <div className="flex">
          <input
            name="token"
            id="token"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={t('TelegramSignInForm.TokenPlaceholder')}
            required
            className={cn(
              isDev && '__TelegramSignInForm_Input', // DEBUG
              'w-full rounded border px-5 py-2 transition focus:outline-none focus:ring-2',
              'rounded-full rounded-e-none',
              'bg-background text-foreground',
              'h-9',
              hasInvalidFormat
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-500/20 focus:ring-theme-500',
            )}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!isSubmitEnabled}
            variant="theme"
            rounded="full"
            className={cn(
              isDev && '__TelegramSignInForm_Button', // DEBUG
              'rounded-s-none',
              'flex gap-2',
              'h-9',
            )}
          >
            <Icons.ArrowRight className="size-4" />
          </Button>
        </div>
        {hasInvalidFormat && (
          <span className="text-sm text-red-500">
            {t('TelegramSignInForm.InvalidTokenMessage')}
          </span>
        )}
      </div>
    </form>
  );
}
