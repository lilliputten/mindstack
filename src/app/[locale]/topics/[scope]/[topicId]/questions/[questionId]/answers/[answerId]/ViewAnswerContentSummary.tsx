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
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { TAvailableAnswer } from '@/features/answers/types';
import { TAvailableQuestion } from '@/features/questions/types';
import { TAvailableTopic } from '@/features/topics/types';
import { useSessionUser } from '@/hooks';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

interface TViewAnswerContentSummaryProps {
  topic: TAvailableTopic;
  question: TAvailableQuestion;
  answer: TAvailableAnswer;
}

export function ViewAnswerContentSummary(props: TViewAnswerContentSummaryProps) {
  const { topic, question, answer } = props;
  const { manageScope } = useManageTopicsStore();
  const format = useFormatter();
  const user = useSessionUser();

  const topicsListPath = `/topics/${manageScope}`;
  const topicRoutePath = `${topicsListPath}/${topic.id}`;
  const questionsListRoutePath = `${topicRoutePath}/questions`;
  // const questionRoutePath = `${questionsListRoutePath}/${question.id}`;
  // const answersListRoutePath = `${questionRoutePath}/answers`;
  // const answerRoutePath = `${answersListRoutePath}/${answer.id}`;

  const isOwner = !!topic?.userId && topic?.userId === user?.id;

  const topicInfoContent = (
    <div data-testid="__ViewAnswerContentSummary_Section_Topic" className="flex flex-col gap-4">
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold">Topic</h3>
        {isOwner && (
          <Button variant="ghost" size="sm">
            <Link href={`${topicsListPath}/${topic.id}`} className="flex items-center gap-2">
              <Icons.Edit className="size-3" />
              <span>Manage Topic</span>
            </Link>
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-2 rounded-lg bg-slate-500/10 p-3">
        <p className="font-medium">{topic.name}</p>
        {topic.description && (
          <p className="text-sm opacity-50">{truncateMarkdown(topic.description, 100)}</p>
        )}
        <p className="text-sm opacity-50">
          {topic._count?.questions ? (
            <span>
              <span className="opacity-50">Total questions:</span> {topic._count?.questions}
            </span>
          ) : (
            <span className="opacity-50">No questions:</span>
          )}
        </p>
      </div>
    </div>
  );

  const answerTextContent = (
    <div
      data-testid="__ViewAnswerContentSummary_Section_AnswerText"
      className="flex flex-col gap-4"
    >
      <h3 className="text-lg font-semibold">Answer Text</h3>
      <div className="rounded-lg bg-slate-500/10 p-4">
        <MarkdownText>{answer.text}</MarkdownText>
      </div>
    </div>
  );

  const answerExplanationContent = answer.explanation ? (
    <div
      data-testid="__ViewAnswerContentSummary_Section_AnswerExplanation"
      className="flex flex-col gap-4"
    >
      <h3 className="text-lg font-semibold">Explanation</h3>
      <div className="rounded-lg bg-slate-500/10 p-4">
        <MarkdownText>{answer.explanation || ''}</MarkdownText>
      </div>
    </div>
  ) : undefined;

  const answerPropertiesContent = (
    <div
      data-testid="__ViewAnswerContentSummary_Section_Properties"
      className="flex flex-col gap-4"
    >
      <h3 className="text-lg font-semibold">Properties</h3>
      <div className="flex flex-wrap gap-2">
        <Badge
          className={cn(
            answer.isCorrect ? 'bg-green-500' : 'bg-red-500',
            'flex items-center gap-1 px-2 py-1',
          )}
        >
          <Icons.Check className="size-4 opacity-50" />
          {answer.isCorrect ? 'Correct answer' : 'Incorrect answer'}
        </Badge>
        {answer.isGenerated && (
          <Badge
            variant="outline"
            className={cn(
              'flex items-center gap-1 px-2 py-1',
              'bg-theme-900 text-xs text-theme-400',
            )}
          >
            <Icons.WandSparkles className="size-3 opacity-50" />
            AI Generated
          </Badge>
        )}
      </div>
    </div>
  );

  // TODO: Use skeleton if is lolading
  const questionInfoContent = (
    <div data-testid="__ViewAnswerContentSummary_Section_Question" className="flex flex-col gap-4">
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold">Question</h3>
        {isOwner && (
          <Button variant="ghost" size="sm">
            <Link
              href={`${questionsListRoutePath}/${question.id}`}
              className="flex items-center gap-2"
            >
              <Icons.Edit className="size-3" />
              <span>Manage Question</span>
            </Link>
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-2 rounded-lg bg-slate-500/10 p-3">
        <p className="font-medium">{truncateMarkdown(question.text, 100)}</p>
        <p className="text-sm opacity-50">
          {question._count?.answers ? (
            <span>
              <span className="opacity-50">Total answers:</span> {question._count.answers}
            </span>
          ) : (
            <span className="opacity-50">No answers</span>
          )}
        </p>
      </div>
    </div>
  );

  const authorInfoContent = (
    <div data-testid="__ViewAnswerContentSummary_Section_Author" className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Author</h3>
      <div className="flex items-center gap-2 text-sm">
        {isOwner ? (
          <>
            <Icons.ShieldCheck className="h-4 w-4 opacity-50" />
            <span>You're the author</span>
          </>
        ) : (
          topic && (
            <>
              <Icons.User className="h-4 w-4 opacity-50" />
              <span className="opacity-50">Topic created by:</span>
              <span>{topic.user?.name || topic.user?.email || 'Unknown'}</span>
            </>
          )
        )}
      </div>
    </div>
  );

  const timestampsContent = (
    <div data-testid="__ViewAnswerContentSummary_Section_Timeline" className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Timeline</h3>
      <div className="flex flex-wrap gap-4 gap-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Icons.CalendarDays className="h-4 w-4 opacity-50" />
          <span className="opacity-50">Created:</span>
          <span>{getFormattedRelativeDate(format, answer.createdAt)}</span>
        </div>
        {!!compareDates(answer.updatedAt, answer.createdAt) && (
          <div className="flex items-center gap-2">
            <Icons.Edit className="h-4 w-4 opacity-50" />
            <span className="opacity-50">Modified:</span>
            <span>{getFormattedRelativeDate(format, answer.updatedAt)}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        isDev && '__ViewAnswerContentSummary', // DEBUG
        'mx-6 flex w-full flex-col gap-4',
      )}
    >
      {answerTextContent}
      {answerExplanationContent}
      {answerPropertiesContent}
      <Separator />
      {questionInfoContent}
      {topicInfoContent}
      <Separator />
      {timestampsContent}
      {authorInfoContent}
    </div>
  );
}
