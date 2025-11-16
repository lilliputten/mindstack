'use client';

import React from 'react';
import Link from 'next/link';
import { useFormatter } from 'next-intl';

import { compareDates, getFormattedRelativeDate } from '@/lib/helpers/dates';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MarkdownText } from '@/components/ui/MarkdownText';
import { Separator } from '@/components/ui/Separator';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { AIGenerationsStatusInfo } from '@/features/ai-generations/components';
import { useAvailableTopicById, useSessionUser } from '@/hooks';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

interface TProps {
  availableTopicQuery: ReturnType<typeof useAvailableTopicById>;
}

export function ViewTopicContentSummary({ availableTopicQuery }: TProps) {
  const { manageScope } = useManageTopicsStore();
  const routePath = `/topics/${manageScope}`;
  const format = useFormatter();
  const user = useSessionUser();

  const { topic } = availableTopicQuery;

  // Check if query is actually being invalidated
  if (!topic) {
    throw new Error('No topic loaded');
  }

  const isOwner = !!topic.userId && topic.userId === user?.id;

  return (
    <div
      className={cn(
        isDev && '__ViewTopicContentSummary', // DEBUG
        'mx-6 flex w-full flex-col gap-4',
      )}
    >
      <AIGenerationsStatusInfo />

      {/* Topic Description */}
      {topic.description && (
        <div
          data-testid="__ViewTopicContentSummary_Section_TopicDescription"
          className="flex flex-col gap-4"
        >
          <h3 className="text-lg font-semibold">Description</h3>
          <div className="rounded-lg bg-slate-500/10 p-4">
            <MarkdownText>{topic.description}</MarkdownText>
          </div>
        </div>
      )}

      {/* Topic Questions */}
      <div
        data-testid="__ViewTopicContentSummary_Section_Questions"
        className="flex flex-col gap-4"
      >
        <h3 className="text-lg font-semibold">Questions</h3>
        <div className="flex flex-wrap gap-4">
          {!!topic._count?.questions && (
            <span className="flex items-center gap-2">
              <Icons.Questions className="size-4 opacity-50" />
              <span>Questions count: {topic._count.questions}</span>
            </span>
          )}
          <Button variant="theme">
            <Link href={`${routePath}/${topic.id}/questions`} className="flex items-center gap-2">
              <Icons.Edit className="size-4 opacity-50" />
              <span>Manage questions</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Topic Properties */}
      <div
        data-testid="__ViewTopicContentSummary_Section_Properties"
        className="flex flex-col gap-4"
      >
        <h3 className="text-lg font-semibold">Properties</h3>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={topic.isPublic ? 'success' : 'outline'}
            className="flex gap-2 px-2 py-1"
            title="Availability"
          >
            {topic.isPublic ? (
              <Icons.Eye className="size-4 opacity-50" />
            ) : (
              <Icons.EyeOff className="size-4 opacity-50" />
            )}
            {topic.isPublic ? 'Public' : 'Private'}
          </Badge>
          {topic.langName && (
            <Badge variant="outline" className="flex items-center gap-1 px-2 py-1" title="Language">
              <Icons.Languages className="size-4 opacity-50" />
              {topic.langName} {topic.langCode && `(${topic.langCode})`}
            </Badge>
          )}
          {topic.answersCountRandom && topic.answersCountMin && topic.answersCountMax && (
            <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
              <Icons.Hash className="size-4 opacity-50" />
              Random Answers: {topic.answersCountMin}-{topic.answersCountMax}
            </Badge>
          )}
        </div>
      </div>

      {/* Keywords */}
      {topic.keywords && (
        <div
          data-testid="__ViewTopicContentSummary_Section_Keywords"
          className="flex flex-col gap-4"
        >
          <h3 className="text-lg font-semibold">Keywords</h3>
          <div className="flex flex-wrap gap-1">
            {topic.keywords
              .split(',')
              .filter(Boolean)
              .map((keyword, idx) => (
                <span key={idx} className="rounded-sm bg-theme-300/10 px-2 text-sm">
                  {/* <Icons.Tags className="mr-1 size-3 opacity-50" /> */}
                  {keyword.trim()}
                </span>
              ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Timestamps */}
      <div data-testid="__ViewTopicContentSummary_Section_Timeline" className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Timeline</h3>
        <div className="flex flex-wrap gap-4 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Icons.CalendarDays className="size-4 text-muted-foreground opacity-50" />
            <span className="text-muted-foreground">Created:</span>
            <span>{getFormattedRelativeDate(format, topic.createdAt)}</span>
          </div>
          {!!compareDates(topic.updatedAt, topic.createdAt) && (
            <div className="flex items-center gap-2">
              <Icons.Edit className="size-4 text-muted-foreground opacity-50" />
              <span className="text-muted-foreground">Modified:</span>
              <span>{getFormattedRelativeDate(format, topic.updatedAt)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Author Info */}
      <div data-testid="__ViewTopicContentSummary_Section_Author" className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Author</h3>
        <div className="flex items-center gap-2 text-sm">
          {isOwner ? (
            <>
              <Icons.ShieldCheck className="size-4 text-muted-foreground opacity-50" />
              <span>You're the author</span>
            </>
          ) : (
            topic.user && (
              <>
                <Icons.User className="size-4 text-muted-foreground opacity-50" />
                <span className="text-muted-foreground">Topic created by:</span>
                <span>{topic.user.name || topic.user.email || 'Unknown'}</span>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}
