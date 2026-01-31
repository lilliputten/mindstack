'use client';

import React from 'react';
import NextLink from 'next/link';

import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';

interface PricingChoosePaymentMethodCardProps {
  // priceText: React.ReactNode;
  title: string;
  icon: React.ElementType;
  description: string | React.ReactNode;
  buttonText?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  link?: string;
  isLink?: boolean;
  disabled?: boolean;
}

export function PricingChoosePaymentMethodCard({
  // priceText,
  title,
  icon: Icon,
  description,
  buttonText,
  onClick,
  className,
  link,
  isLink = false,
  disabled = false,
}: PricingChoosePaymentMethodCardProps) {
  const content =
    (isLink && link) || typeof buttonText === 'string' ? (
      <span className="content-truncate">{buttonText}</span>
    ) : (
      buttonText
    );
  const buttonClassName = 'mt-auto h-auto flex w-full';
  return (
    <Card
      className={cn(
        isDev && '__PricingChoosePaymentMethodCard', // DEBUG
        'relative flex flex-col justify-between gap-4 bg-theme/10 p-6',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className="size-6 text-theme" />
        <h3 className="content-truncate text-xl font-semibold text-theme">{title}</h3>
      </div>
      <div className="content-text content-truncate flex flex-1 flex-col gap-2">
        {typeof description === 'string' ? (
          <p className="content-truncate">{description}</p>
        ) : (
          description
        )}
      </div>
      {isLink && link ? (
        <NextLink
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            isDev && '__PricingChoosePaymentMethodCard_Link', // DEBUG
            buttonVariants({ variant: 'theme' }),
            buttonClassName,
            'flex flex-wrap items-center gap-x-1',
            disabled && 'pointer-events-none opacity-50',
          )}
        >
          {content}
          <Icons.ExternalLink className="size-3.5 shrink-0 opacity-50" />
        </NextLink>
      ) : buttonText && onClick ? (
        <Button
          variant="theme"
          onClick={onClick}
          disabled={disabled}
          className={cn(
            isDev && '__PricingChoosePaymentMethodCard_Button', // DEBUG
            buttonClassName,
          )}
        >
          {content}
        </Button>
      ) : null}
    </Card>
  );
  /*
inline-flex
items-center
justify-center
text-sm
font-medium
focus-visible:outline-none
disabled:opacity-30
disabled:cursor-default
disabled:pointer-events-none
select-none
transition
bg-theme
text-theme-foreground
hover:bg-theme-600
h-10
px-4
py-2
rounded-md
__PricingChoosePaymentMethodCard_Button
mt-auto
w-full
   */
}
