'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { ErrorLike } from '@/lib/errors';
import { getErrorText } from '@/lib/helpers';
import { TReactNode } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/shared';
import { ErrorPlaceHolder } from '@/components/shared/ErrorPlaceHolder';
import { TGenericIcon } from '@/components/shared/IconTypes';
import { rootAliasRoute } from '@/config';
import { isDev } from '@/constants';
import { useGoBack } from '@/hooks';

interface TErrorProps {
  title?: TReactNode;
  explanation?: TReactNode;
  explanationClassName?: string;
  extraActions?: TReactNode;
  ExtraActions?: React.FunctionComponent;
  error?: ErrorLike; // Error & { message?: string };
  reset?: () => void;
  className?: string;
  icon?: TGenericIcon | string;
  iconClassName?: string;
  padded?: boolean;
  border?: boolean;
  noActions?: boolean;
}

// NOTE: Only plain string should be passed from the server components
// otherwise you'll get an 'Only plain objects... can be passed...' error.

const defaultIcon = Icons.Warning;

export function PageError(props: TErrorProps) {
  const {
    error,
    reset,
    className,
    title,
    explanation,
    explanationClassName,
    icon = defaultIcon,
    iconClassName,
    extraActions,
    ExtraActions,
    padded = true,
    border = true,
    noActions,
  } = props;
  const router = useRouter();

  const t = useT();

  let titleText = title;
  let errText = getErrorText(error);
  if (!titleText && errText && errText.length < 80) {
    titleText = errText;
    errText = '';
  }

  React.useEffect(() => {
    if (error) {
      // eslint-disable-next-line no-console
      console.error('[PageError:error]', errText, {
        error,
      });
    }
    // TODO: Log the error to an error reporting service?
  }, [error, errText]);

  const goBack = useGoBack(rootAliasRoute);

  const goHome = React.useCallback(() => {
    const { href } = window.location;
    // Do a hard reload
    // window.location.href = rootAliasRoute;
    router.push(rootAliasRoute);
    setTimeout(() => {
      // If still on the same page after trying to go back, fallback
      if (document.visibilityState === 'visible' && href === window.location.href) {
        window.location.href = rootAliasRoute;
      }
    }, 200);
  }, [router]);

  // Helper function to safely access icon by string name
  const getIconByName = (name: string): TGenericIcon | undefined => {
    return (Icons as { [key: string]: TGenericIcon })[name];
  };

  return (
    <ErrorPlaceHolder
      className={cn(
        isDev && '__PageError', // DEBUG
        'overflow-auto',
        padded && 'p-6',
        !border && 'border-none',
        className,
      )}
      containerClassName="overflow-hidden"
    >
      <ErrorPlaceHolder.Icon
        className={cn(
          isDev && '__PageError_Icon', // DEBUG
          'mb-4',
          iconClassName,
        )}
        icon={typeof icon === 'string' ? getIconByName(icon) || defaultIcon : icon}
      />
      {titleText && (
        <ErrorPlaceHolder.Title className="content-truncate">{titleText}</ErrorPlaceHolder.Title>
      )}
      {errText && (
        <ErrorPlaceHolder.Description className="content-truncate">
          {errText}
        </ErrorPlaceHolder.Description>
      )}
      {explanation && (
        <div
          className={cn(
            isDev && '__PageError_Explanation', // DEBUG
            'content-text content-truncate text-center text-sm font-normal leading-6',
            explanationClassName,
          )}
        >
          {explanation}
        </div>
      )}
      {!noActions && (
        <div
          className={cn(
            isDev && '__PageError_Actions', // DEBUG
            'mt-4 flex w-full flex-wrap justify-center gap-4',
          )}
        >
          <Button
            variant="theme"
            onClick={goBack}
            className="content-overflow flex items-center gap-2"
          >
            <Icons.ArrowLeft className="size-4" />
            <span className="truncate">{t('GoBack')}</span>
          </Button>
          <Button
            variant="theme"
            onClick={goHome}
            className="content-overflow flex items-center gap-2"
          >
            <Icons.Home className="size-4" />
            <span className="truncate">{t('GoHome')}</span>
          </Button>
          {/*
        <Link href={rootAliasRoute} className={cn(buttonVariants({ variant: 'default' }), 'flex gap-2')}>
          <Icons.Home className="size-4" />
           <span className="truncate">{t('GoHome')}</span>
        </Link>
        */}
          {!!reset && (
            <Button
              onClick={reset}
              variant="theme"
              className="content-overflow flex items-center gap-2"
            >
              <Icons.Refresh className="size-4" />
              <span className="truncate">{t('TryAgain')}</span>
            </Button>
          )}
          {extraActions}
          {ExtraActions && <ExtraActions />}
        </div>
      )}
    </ErrorPlaceHolder>
  );
}
