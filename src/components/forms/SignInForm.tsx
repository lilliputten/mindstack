'use client';

import React from 'react';
import Image from 'next/image';
import { signIn, SignInOptions } from 'next-auth/react';

import { myTopicsRoute, rootRoute } from '@/config/routesConfig';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { DialogDescription, DialogTitle } from '@/components/ui/Dialog';
import * as Icons from '@/components/shared/Icons';
import { TGenericIcon } from '@/components/shared/IconTypes';
import logoSvg from '@/assets/logo/logo-on-dark.svg';
import { siteTitle } from '@/config';
import { isDev } from '@/constants';
import { Link, useT } from '@/i18n';

import { EmailSignInForm } from './EmailSignInForm';
import { TelegramSignIn } from './TelegramSignIn';

type TSignInParameters = Parameters<typeof signIn>;
export type TSignInProvider = TSignInParameters[0];

interface OAuthSignInButtonProps {
  currentProvider?: TSignInProvider;
  onSignInStart?: (provider: TSignInProvider) => void;
  onSignInDone?: (provider: TSignInProvider) => void;
  provider: TSignInProvider;
  ProviderIcon: TGenericIcon; // React.FC;
  text: string;
  /** Rendered inside a body or in the app header */
  inBody?: boolean;
}

function OAuthSignInButton(props: OAuthSignInButtonProps) {
  const {
    // prettier-ignore
    currentProvider,
    onSignInStart,
    onSignInDone,
    provider,
    ProviderIcon,
    text,
  } = props;
  const isClicked = !!currentProvider;
  const isThisClicked = currentProvider == provider;
  const onSignIn = React.useCallback(() => {
    const options: SignInOptions = { redirectTo: myTopicsRoute };
    if (onSignInStart) {
      onSignInStart(provider);
    }
    // @see https://next-auth.js.org/getting-started/client#specifying-a-callbackurl
    signIn(provider, options).then(() => {
      if (onSignInDone) {
        onSignInDone(provider);
      }
    });
  }, [onSignInStart, onSignInDone, provider]);

  const icon = isThisClicked ? (
    <Icons.Spinner className="mr-2 size-4 animate-spin" />
  ) : (
    <ProviderIcon className="mr-2 size-4" />
  );

  return (
    <Button
      className={cn(
        isDev && '__SignInModal-button', // DEBUG
        isDev && '__provider-' + provider,
      )}
      variant="theme"
      rounded="full"
      disabled={isClicked}
      onClick={() => onSignIn()}
    >
      {icon} {text}
    </Button>
  );
}

interface TSignInFormHeaderProps {
  dark?: boolean;
  inBody?: boolean;
}

export function SignInFormHeader(props: TSignInFormHeaderProps) {
  const {
    // dark,
    inBody,
  } = props;
  const t = useT('SignInForm');
  const Title = inBody ? 'h3' : DialogTitle;
  const Descr = inBody ? 'p' : DialogDescription;
  const showLogo = false && !inBody;
  return (
    <>
      {showLogo && (
        <Link href={rootRoute} className="transition hover:opacity-80">
          <Image src={logoSvg} className="h-24 w-auto" alt={siteTitle} priority={false} />
        </Link>
      )}
      <Title className="font-urban text-2xl text-theme">{t('sign-in')}</Title>
      <Descr className="text-center text-sm">{t('intro')}</Descr>
    </>
  );
}

interface TSignInFormProps {
  onSignInStart?: (provider: TSignInProvider) => void;
  onSignInDone?: (provider: TSignInProvider) => void;
  /** Rendered inside a body or in the app header */
  inBody?: boolean;
}

export function SignInForm(props: TSignInFormProps) {
  const { onSignInStart, onSignInDone, inBody } = props;
  const [currentProvider, setCurrentProvider] = React.useState<TSignInProvider>();
  const t = useT('SignInForm');

  const handleSignInStart = React.useCallback(
    (provider: TSignInProvider) => {
      setCurrentProvider(provider);
      if (onSignInStart) {
        onSignInStart(provider);
      }
    },
    [onSignInStart],
  );

  return (
    <>
      <OAuthSignInButton
        currentProvider={currentProvider}
        onSignInStart={handleSignInStart}
        onSignInDone={onSignInDone}
        provider="github"
        ProviderIcon={Icons.Github}
        text={t('sign-in-with-github')}
      />
      <OAuthSignInButton
        currentProvider={currentProvider}
        onSignInStart={handleSignInStart}
        onSignInDone={onSignInDone}
        provider="yandex"
        ProviderIcon={Icons.Yandex}
        text={t('sign-in-with-yandex')}
      />
      <OAuthSignInButton
        currentProvider={currentProvider}
        onSignInStart={handleSignInStart}
        onSignInDone={onSignInDone}
        provider="google"
        ProviderIcon={Icons.Google}
        text={t('sign-in-with-google')}
      />
      {/* Telegram login section */}
      <TelegramSignIn inBody={inBody} isLogging={!!currentProvider} />
      {/* Email login section */}
      <EmailSignInForm inBody={inBody} isLogging={!!currentProvider} />
    </>
  );
}
