'use client';

import React from 'react';
import Link from 'next/link';
import QRCode from 'react-qr-code';

import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';
import { useEnvConext } from '@/contexts/EnvContext';

import { TelegramSignInForm } from './TelegramSignInForm';

function TelegramSignInButton({ telegramUrl }: { telegramUrl: string }) {
  const t = useT();
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
          <span>{t('TelegramSignIn.ButtonText')}</span>
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
  const { className, inBody, isLogging, redirectUrl } = props;
  const t = useT();
  // TODO: Is that possible to pass the `redirectUrl` link to the telegram bot?
  const { BOT_USERNAME } = useEnvConext();
  // TODO: Try to pass `redirectUrl` parameter with tegeram bot url's `start` parameter
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
      <p className="mt-2 text-center text-sm font-medium">{t('TelegramSignIn.OrUseTelegram')}</p>
      <TelegramSignInButton telegramUrl={telegramUrl} />
      <TelegramQRCode telegramUrl={telegramUrl} />
      <p className="text-content text-center text-sm">
        {t.rich('TelegramSignIn.QRDescription', {
          BotUsername: () => <code>@{BOT_USERNAME}</code>,
          BotLink: (chunks) => (
            <Link target="_blank" rel="noopener noreferrer" href={telegramUrl}>
              {chunks}
              <Icons.ExternalLink className="ml-0.5 inline size-3.5 align-baseline opacity-50" />
            </Link>
          ),
          code: (chunks) => <code>{chunks}</code>,
        })}
      </p>
      <TelegramSignInForm inBody={inBody} redirectUrl={redirectUrl} />
    </div>
  );
}
