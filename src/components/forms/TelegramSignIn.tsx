'use client';

import React from 'react';
import Link from 'next/link';
import QRCode from 'react-qr-code';

import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';
import { useEnvConext } from '@/contexts/EnvContext';

import { TelegramSignInForm } from './TelegramSignInForm';

function TelegramSignInButton({ telegramUrl }: { telegramUrl: string }) {
  return (
    <>
      <Button
        className={cn(
          isDev && '__TelegramSignInButton', // DEBUG
          'flex gap-2',
        )}
        variant="theme"
        rounded="full"
      >
        <Link
          target="_blank"
          rel="noopener noreferrer"
          href={telegramUrl}
          className="flex items-center gap-2"
        >
          <Icons.Telegram className="mr-2 size-4" />
          <span>Sign in with Telegram bot</span>
        </Link>
      </Button>
    </>
  );
}

function TelegramQRCode({ telegramUrl }: { telegramUrl: string }) {
  return (
    <QRCode
      value={telegramUrl}
      size={140}
      bgColor="#FFFFFF"
      fgColor="#000000"
      className="mx-auto rounded-md bg-white p-2"
    />
  );
}

interface TProps extends TPropsWithClassName {
  inBody?: boolean;
  isLogging?: boolean;
  redirectUrl?: string;
}

export function TelegramSignIn(props: TProps) {
  const {
    className,
    inBody,
    isLogging,
    // redirectUrl,
  } = props;
  // TODO: Is that possible to pass the `redirectUrl` link to the telegram bot?
  const { BOT_USERNAME } = useEnvConext();
  const telegramUrl = `https://t.me/${BOT_USERNAME}?start=/authorize`;
  return (
    <div
      className={cn(
        isDev && '__TelegramSignIn', // DEBUG
        'flex flex-col gap-3',
        isLogging && 'pointer-events-none opacity-30',
        className,
      )}
    >
      <p className="mt-2 text-center text-sm font-medium">Or use Telegram</p>
      <TelegramSignInButton telegramUrl={telegramUrl} />
      <TelegramQRCode telegramUrl={telegramUrl} />
      <p className="text-content text-center text-sm">
        Click the button above, use the QR code, or go to the <code>@{BOT_USERNAME}</code>{' '}
        <Link target="_blank" rel="noopener noreferrer" href={telegramUrl}>
          telegram bot
          <Icons.ExternalLink className="ml-0.5 inline size-3.5 align-baseline opacity-50" />
        </Link>
        , and select the <code>/authorize</code> command to obtain an authorization token.
      </p>
      <TelegramSignInForm inBody={inBody} />
    </div>
  );
}
