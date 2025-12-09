'use client';

import React from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { isDev } from '@/config';

interface FeatureCardProps {
  debugId?: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  imageAspectRatio?: 'aspect-video' | 'aspect-[4/3]' | 'aspect-square';
  descriptionSize?: 'sm' | 'lg';
  contentMaxWidth?: string;
  className?: string;
}

export function FeatureCard({
  debugId,
  title,
  description,
  imageSrc,
  imageAlt,
  imageAspectRatio = 'aspect-video',
  descriptionSize = 'sm',
  contentMaxWidth,
  className,
}: FeatureCardProps) {
  return (
    <Card
      className={cn(
        // isDev && '__FeatureCard', // DEBUG
        isDev && ['__FeatureCard', debugId].filter(Boolean).join('_'), // DEBUG
        'flex flex-col gap-4 p-6',
        'bg-theme/10',
        className,
      )}
    >
      <div className={cn(contentMaxWidth)}>
        <h3 className="mb-3 mt-0 text-xl font-semibold text-theme">{title}</h3>
        <p
          className={cn(
            descriptionSize === 'lg'
              ? 'text-base leading-6 text-muted-foreground lg:text-lg'
              : 'text-sm leading-5 text-muted-foreground',
          )}
        >
          {description}
        </p>
      </div>
      <div className={cn('relative w-full overflow-hidden rounded-lg', imageAspectRatio)}>
        <Image src={imageSrc} alt={imageAlt} fill className="object-cover" />
      </div>
    </Card>
  );
}
