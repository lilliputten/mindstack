'use client';

import React from 'react';
import { useFormatter } from 'next-intl';

import { compareDates, getFormattedRelativeDate } from '@/lib/helpers/dates';
import { truncateMarkdown } from '@/lib/helpers/markdown';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Link } from '@/i18n/routing';
import { Badge } from '@/components/ui/Badge';
import { buttonVariants } from '@/components/ui/Button';
import { MarkdownText } from '@/components/ui/MarkdownText';
import { Separator } from '@/components/ui/Separator';
import * as Icons from '@/components/shared/Icons';
import { TRoutePath } from '@/config';
import { isDev } from '@/constants';
import { AIGenerationsStatusInfo } from '@/features/ai-generations/components';
import { useAIGenerationsStatus } from '@/features/ai-generations/query-hooks';
import { TAvailableAnswer } from '@/features/answers/types';
import { TAvailableQuestion } from '@/features/questions/types';
import { TAvailableTopic } from '@/features/topics/types';
import { SmallUserBlock } from '@/features/users';
import { useUserById } from '@/features/users/query-hooks';
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
  // const user = useSessionUser();
  const { user: topicAuthor, loading: isAuthorLoading } = useUserById(topic?.userId);
  const { allowed: aiGenerationsAllowed, loading: aiGenerationsLoading } = useAIGenerationsStatus();

  const t = useT();

  const topicsListPath = `/topics/${manageScope}`;
  const topicRoutePath = `${topicsListPath}/${topic.id}`;
  const questionsListRoutePath = `${topicRoutePath}/questions`;
  const questionRoutePath = `${questionsListRoutePath}/${question.id}`;
  const answersListRoutePath = `${questionRoutePath}/answers`;
  // const answerRoutePath = `${answersListRoutePath}/${answer.id}`;

  // const isOwner = !!topic?.userId && topic?.userId === user?.id;

  const topicInfoContent = (
    <div data-testid="__ViewAnswerContentSummary_Section_Topic" className="flex flex-col gap-4">
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="content-truncate text-lg font-semibold">{t('Topic')}</h3>
        <div className="content-truncate flex flex-wrap gap-2">
          <Link
            href={`${topicRoutePath}` as TRoutePath}
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'flex items-center gap-2 truncate',
              (!aiGenerationsAllowed || aiGenerationsLoading) && 'disabled',
            )}
          >
            <Icons.Topics className="size-4 shrink-0 opacity-50" />
            <span className="truncate">{t('GoToTheTopic')}</span>
          </Link>
          <Link
            href={`${questionsListRoutePath}/generate` as TRoutePath}
            className={cn(
              buttonVariants({ variant: 'gr1' }),
              'flex items-center gap-2 truncate',
              (!aiGenerationsAllowed || aiGenerationsLoading) && 'disabled',
            )}
            title={t('GenerateQuestions')}
          >
            <Icons.WandSparkles className="size-4 shrink-0 opacity-50" />
            <span className="truncate">{t('GenerateQuestions')}</span>
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-2 rounded-lg bg-slate-500/10 p-3">
        <p className="font-medium">{topic.name}</p>
        {topic.description && (
          <p className="text-sm opacity-50">{truncateMarkdown(topic.description, 100)}</p>
        )}
        <p className="text-sm opacity-50">
          {topic._count?.questions ? (
            <span className="truncate">
              <span className="opacity-50">{t('ViewAnswerContentSummary.TotalQuestions')}:</span>{' '}
              {topic._count?.questions}
            </span>
          ) : (
            <span className="opacity-50">{t('NoQuestions')}:</span>
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
      <h3 className="content-truncate text-lg font-semibold">
        {t('ViewAnswerContentSummary.AnswerText')}
      </h3>
      <div className="content-truncate rounded-lg bg-slate-500/10 p-4">
        <MarkdownText className="content-truncate">{answer.text}</MarkdownText>
      </div>
    </div>
  );

  const answerExplanationContent = answer.explanation ? (
    <div
      data-testid="__ViewAnswerContentSummary_Section_AnswerExplanation"
      className="flex flex-col gap-4"
    >
      <h3 className="content-truncate text-lg font-semibold">
        {t('ViewAnswerContentSummary.Explanation')}
      </h3>
      <div className="content-truncate rounded-lg bg-slate-500/10 p-4">
        <MarkdownText className="content-truncate">{answer.explanation || ''}</MarkdownText>
      </div>
    </div>
  ) : undefined;

  const answerPropertiesContent = (
    <div
      data-testid="__ViewAnswerContentSummary_Section_Properties"
      className="flex flex-col gap-4"
    >
      <h3 className="content-truncate text-lg font-semibold">
        {t('ViewAnswerContentSummary.Properties')}
      </h3>
      <div className="content-truncate flex flex-wrap gap-2">
        <Badge
          className={cn(
            answer.isCorrect ? 'bg-green-500' : 'bg-red-500',
            'flex items-center gap-1 px-2 py-1',
          )}
        >
          <Icons.Check className="size-4 shrink-0 opacity-50" />
          {answer.isCorrect
            ? t('ViewAnswerContentSummary.CorrectAnswer')
            : t('ViewAnswerContentSummary.IncorrectAnswer')}
        </Badge>
        {answer.isGenerated && (
          <Badge
            variant="outline"
            className={cn(
              'flex items-center gap-1 px-2 py-1',
              'bg-secondary-500 text-xs text-secondary-foreground',
            )}
          >
            <Icons.WandSparkles className="size-4 shrink-0 opacity-50" />
            {t('ViewAnswerContentSummary.AiGenerated')}
          </Badge>
        )}
      </div>
    </div>
  );

  // TODO: Use skeleton if is lolading
  const questionInfoContent = (
    <div data-testid="__ViewAnswerContentSummary_Section_Question" className="flex flex-col gap-4">
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="content-truncate text-lg font-semibold">{t('Question')}</h3>
        <div className="content-truncate flex flex-wrap gap-2">
          <Link
            href={`${questionsListRoutePath}/${question.id}` as TRoutePath}
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'flex items-center gap-2 truncate',
              (!aiGenerationsAllowed || aiGenerationsLoading) && 'disabled',
            )}
          >
            <Icons.Questions className="size-4 shrink-0 opacity-50" />
            <span className="truncate">{t('GoToTheQuestion')}</span>
          </Link>
          <Link
            href={`${answersListRoutePath}/generate` as TRoutePath}
            className={cn(
              buttonVariants({ variant: 'gr1' }),
              'flex items-center gap-2 truncate',
              (!aiGenerationsAllowed || aiGenerationsLoading) && 'disabled',
            )}
            title={t('GenerateAnswers')}
          >
            <Icons.WandSparkles className="size-4 shrink-0 opacity-50" />
            <span className="truncate">{t('GenerateAnswers')}</span>
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-2 rounded-lg bg-slate-500/10 p-3">
        <p className="font-medium">{truncateMarkdown(question.text, 100)}</p>
        <p className="text-sm opacity-50">
          {question._count?.answers ? (
            <span className="truncate">
              <span className="opacity-50">{t('ViewAnswerContentSummary.TotalAnswers')}:</span>{' '}
              {question._count.answers}
            </span>
          ) : (
            <span className="opacity-50">{t('ViewAnswerContentSummary.NoAnswers')}</span>
          )}
        </p>
      </div>
    </div>
  );

  const authorInfoContent = (isAuthorLoading || topicAuthor) && (
    <div data-testid="__ViewAnswerContentSummary_Section_Author" className="flex flex-col gap-4">
      <h3 className="content-truncate text-lg font-semibold">{t('Author')}</h3>
      <div className="content-truncate flex items-center gap-2 text-sm">
        <SmallUserBlock user={topicAuthor} isLoading={isAuthorLoading} className="truncate" />
      </div>
    </div>
  );

  const timestampsContent = (
    <div data-testid="__ViewAnswerContentSummary_Section_Timeline" className="flex flex-col gap-4">
      <h3 className="content-truncate text-lg font-semibold">
        {t('ViewAnswerContentSummary.Timeline')}
      </h3>
      <div className="content-truncate flex flex-wrap gap-4 gap-y-2 text-sm">
        <div className="content-truncate flex flex-wrap items-center gap-2 gap-y-1">
          <span className="flex gap-2 truncate opacity-50">
            <Icons.CalendarDays className="size-4 shrink-0" />
            <span className="truncate">{t('Created')}:</span>
          </span>
          <span className="truncate">{getFormattedRelativeDate(format, answer.createdAt)}</span>
        </div>
        {!!compareDates(answer.updatedAt, answer.createdAt) && (
          <div className="content-truncate flex flex-wrap items-center gap-2 gap-y-1">
            <span className="flex gap-2 truncate opacity-50">
              <Icons.Edit className="size-4 shrink-0" />
              <span className="truncate">{t('Modified')}:</span>
            </span>
            <span className="truncate">{getFormattedRelativeDate(format, answer.updatedAt)}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        isDev && '__ViewAnswerContentSummary', // DEBUG
        'content-truncate mx-6 flex w-full flex-col gap-4',
      )}
    >
      <AIGenerationsStatusInfo className="content-truncate" />
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
