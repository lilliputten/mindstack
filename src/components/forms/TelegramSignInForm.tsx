'use client';

import React from 'react';

import { publicRootRoute } from '@/config/routesConfig';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from '@/components/shared/Icons';
import { isDev } from '@/config';

export function TelegramSignInForm({
  className,
  // inBody,
}: { inBody?: boolean } & TPropsWithClassName) {
  const [token, setToken] = React.useState('');
  const trimmedToken = token.trim();
  const isValidToken = !trimmedToken || /^[a-zA-Z0-9]+$/.test(trimmedToken);
  const hasInvalidFormat = !isValidToken;
  const isSubmitEnabled = trimmedToken && isValidToken;
  return (
    <form
      action="/api/auth/callback/telegram"
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
          Then follow the link or enter the token here:
        </label>
        <div className="flex">
          <input
            name="token"
            id="token"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter generated token"
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
            <ArrowRight className="size-4" />
          </Button>
        </div>
        {hasInvalidFormat && (
          <span className="text-sm text-red-500">Token can contain only letters and numbers.</span>
        )}
      </div>
    </form>
  );
}
