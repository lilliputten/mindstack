'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { AvailableTopicsListItem } from '@/app/[locale]/topics/available/AvailableTopicsListItem';
import { isDev } from '@/config';
import { TTopic } from '@/features/topics/types';

interface TProps {
  topic: TTopic;
  className?: string;
}

export function RecentTopicsSectionItem(props: TProps) {
  const { topic, className } = props;
  /* // DEMO: topic properties
   * const {
   *   status, // TopicStatusSchema
   *   id, // z.string().cuid()
   *   createdAt, // z.coerce.date()
   *   updatedAt, // z.coerce.date()
   *   createdBy, // z.string().nullable()
   *   imageUrl, // z.string().nullable()
   *   updatedBy, // z.string().nullable()
   * } = topic;
   */
  return (
    <AvailableTopicsListItem
      topic={topic}
      className={cn(
        isDev && '__RecentTopicsSectionItem', // DEBUG
        className,
      )}
    />
  );
}
