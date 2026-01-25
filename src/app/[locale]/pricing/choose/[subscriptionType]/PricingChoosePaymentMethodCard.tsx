'use client';

import React from 'react';
import NextLink from 'next/link';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';

interface PricingChoosePaymentMethodCardProps {
  title: string;
  icon: React.ElementType;
  description: string | React.ReactNode;
  buttonText?: string;
  onClick?: () => void;
  className?: string;
  link?: string;
  isLink?: boolean;
  disabled?: boolean;
}

export function PricingChoosePaymentMethodCard({
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
        <Button variant="theme" disabled={disabled} className="mt-auto flex w-full">
          <NextLink
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex w-full items-center justify-center gap-1',
              disabled && 'pointer-events-none opacity-50',
            )}
          >
            <span className="truncate">{buttonText}</span>
            <Icons.ExternalLink className="size-3.5 opacity-50" />
          </NextLink>
        </Button>
      ) : buttonText && onClick ? (
        <Button variant="theme" onClick={onClick} disabled={disabled} className="mt-auto w-full">
          <span className="truncate">{buttonText}</span>
        </Button>
      ) : null}
    </Card>
  );
}
