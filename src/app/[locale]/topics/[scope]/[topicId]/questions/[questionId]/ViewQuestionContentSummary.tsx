'use client';

import React from 'react';
import Link from 'next/link';
import { useFormatter } from 'next-intl';

import { compareDates, getFormattedRelativeDate } from '@/lib/helpers/dates';
import { truncateMarkdown } from '@/lib/helpers/markdown';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MarkdownText } from '@/components/ui/MarkdownText';
import { Separator } from '@/components/ui/Separator';
import { Skeleton } from '@/components/ui/Skeleton';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { useAIGenerationsStatus } from '@/features/ai-generations/query-hooks';
import { TAvailableQuestion } from '@/features/questions/types';
import { TAvailableTopic } from '@/features/topics/types';
import { useSessionUser } from '@/hooks';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

interface TProps {
  topic: TAvailableTopic;
  question: TAvailableQuestion;
}

export function ViewQuestionContentSummary(props: TProps) {
  const { topic, question } = props;
  const { manageScope } = useManageTopicsStore();
  const routePath = `/topics/${manageScope}`;
  const format = useFormatter();
  const user = useSessionUser();
  const isLogged = !!user;
  const { allowed: aiGenerationsAllowed, loading: aiGenerationsLoading } = useAIGenerationsStatus();

  const isTopicLoadingOverall = false; // !topic && /* !isTopicsFetched || */ (!isTopicFetched || isTopicLoading);
  const isOwner = !!topic?.userId && topic?.userId === user?.id;

  const questionTextContent = (
    <div
      data-testid="__ViewQuestionContentSummary_Section_QuestionText"
      className="flex flex-col gap-4"
    >
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">Question Text</h3>
        {question.isGenerated && (
          <div className="flex items-center gap-1 rounded-md bg-theme-100 px-2 py-1 text-xs text-theme-600">
            <Icons.WandSparkles className="size-3 opacity-50" />
            AI Generated
          </div>
        )}
      </div>
      <div className="rounded-lg bg-slate-500/10 p-4">
        <MarkdownText>{question.text}</MarkdownText>
      </div>
    </div>
  );

  const questionPropertiesContent = (
    <div
      data-testid="__ViewQuestionContentSummary_Section_Properties"
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold">Answers</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" disabled={!isLogged}>
            <Link
              href={`${routePath}/${question.topicId}/questions/${question.id}/answers`}
              className="flex items-center gap-2"
              title="Manage answers"
            >
              <Icons.Edit className="size-4 opacity-50" />
              <span>Manage Answers</span>
            </Link>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={!aiGenerationsAllowed || aiGenerationsLoading}
          >
            <Link
              href={`${routePath}/${question.topicId}/questions/${question.id}/answers/generate`}
              className="flex items-center gap-2"
              title="Generate Answers"
            >
              <Icons.WandSparkles className="size-4 opacity-50" />
              <span>Generate Answers</span>
            </Link>
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="flex items-center gap-2 px-2 py-1">
          <Icons.Answers className="size-4 opacity-50" />
          {question._count?.answers ? (
            <span>Answers: {question._count.answers}</span>
          ) : (
            <span>No answers yet</span>
          )}
        </Badge>

        {question.answersCountRandom && question.answersCountMin && question.answersCountMax && (
          <Badge
            variant="outline"
            className="flex items-center gap-2 border-blue-500 px-2 py-1 text-blue-500"
          >
            <Icons.Hash className="size-4 opacity-50" />
            <span>
              Random Answers: {question.answersCountMin}-{question.answersCountMax}
            </span>
          </Badge>
        )}
      </div>
    </div>
  );

  const topicInfoContent = isTopicLoadingOverall ? (
    <div
      className={cn(
        isDev && '___ViewQuestionContentSummary_Section_Topic_Skeleton', // DEBUG
        'flex size-full flex-1 flex-col gap-4',
      )}
    >
      <Skeleton className="h-8 w-full rounded-lg" />
      {[...Array(1)].map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-lg" />
      ))}
    </div>
  ) : topic ? (
    <div data-testid="__ViewQuestionContentSummary_Section_Topic" className="flex flex-col gap-4">
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold">Topic</h3>
        <div className="flex gap-2">
          {isOwner && (
            <Button variant="ghost" size="sm">
              <Link href={`${routePath}/${topic.id}`} className="flex items-center gap-2">
                <Icons.Edit className="size-4 opacity-50" />
                <span>Manage Topic</span>
              </Link>
            </Button>
          )}
          <Button variant="secondary" size="sm" disabled={!aiGenerationsAllowed}>
            <Link
              href={`${routePath}/${topic.id}/questions/generate`}
              className="flex items-center gap-2"
              title="Generate Questions"
            >
              <Icons.WandSparkles className="size-4 opacity-50" />
              <span>Generate Questions</span>
            </Link>
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-2 rounded-lg bg-slate-500/10 p-3">
        <p className="font-medium">{topic.name}</p>
        {topic.description && (
          <p className="text-sm opacity-50">{truncateMarkdown(topic.description, 100)}</p>
        )}
        {!!topic._count?.questions && (
          <p className="text-sm opacity-50">
            <span className="opacity-50">Total questions:</span> {topic._count?.questions}
          </p>
        )}
      </div>
    </div>
  ) : null;

  const authorInfoContent = (
    <div data-testid="__ViewQuestionContentSummary_Section_Author" className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Author</h3>
      <div className="flex items-center gap-2 text-sm">
        {isOwner ? (
          <>
            <Icons.ShieldCheck className="hidden size-4 opacity-50 sm:flex" />
            <span>You're the author</span>
          </>
        ) : (
          topic?.user && (
            <>
              <Icons.User className="hidden size-4 opacity-50 sm:flex" />
              <span className="opacity-50">Topic created by:</span>
              <span>{topic.user?.name || topic.user?.email || 'Unknown'}</span>
            </>
          )
        )}
      </div>
    </div>
  );

  const timestampsContent = (
    <div
      data-testid="__ViewQuestionContentSummary_Section_Timeline"
      className="flex flex-col gap-4"
    >
      <h3 className="text-lg font-semibold">Timeline</h3>
      <div className="flex flex-wrap gap-4 gap-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Icons.CalendarDays className="hidden size-4 opacity-50 sm:flex" />
          <span className="opacity-50">Created:</span>
          <span>{getFormattedRelativeDate(format, question.createdAt)}</span>
        </div>
        {!!compareDates(question.updatedAt, question.createdAt) && (
          <div className="flex items-center gap-2">
            <Icons.Edit className="hidden size-4 opacity-50 sm:flex" />
            <span className="opacity-50">Modified:</span>
            <span>{getFormattedRelativeDate(format, question.updatedAt)}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        isDev && '__ViewQuestionContentSummary', // DEBUG
        'mx-6 flex w-full flex-col gap-4',
      )}
    >
      {questionTextContent}
      {questionPropertiesContent}
      <Separator />
      {topicInfoContent}
      <Separator />
      {timestampsContent}
      {authorInfoContent}
    </div>
  );
}
