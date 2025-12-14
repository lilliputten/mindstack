'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { LucideIcon } from '@/components/shared/IconTypes';
import { isDev } from '@/config';

interface CardWithIconProps {
  debugId?: string;
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function CardWithIcon({
  debugId,
  icon: Icon,
  title,
  description,
  className,
}: CardWithIconProps) {
  return (
    <Card
      className={cn(
        isDev && ['__CardWithIcon', debugId].filter(Boolean).join('_'), // DEBUG
        'flex flex-row gap-4 p-6',
        'bg-theme/10',
        className,
      )}
    >
      <div className="flex-shrink-0">
        <Icon className="size-11 text-theme" />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-base font-semibold">{title}</p>
        <p className="text-base leading-6 text-muted-foreground">{description}</p>
      </div>
    </Card>
  );
}
