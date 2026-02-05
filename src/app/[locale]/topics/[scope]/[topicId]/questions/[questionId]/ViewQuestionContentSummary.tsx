'use client';

import React from 'react';
import { useFormatter } from 'next-intl';

import { generateArray } from '@/lib/helpers';
import { compareDates, getFormattedRelativeDate } from '@/lib/helpers/dates';
import { truncateMarkdown } from '@/lib/helpers/markdown';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Link } from '@/i18n/routing';
import { Badge } from '@/components/ui/Badge';
import { buttonVariants } from '@/components/ui/Button';
import { MarkdownText } from '@/components/ui/MarkdownText';
import { Separator } from '@/components/ui/Separator';
import { Skeleton } from '@/components/ui/Skeleton';
import * as Icons from '@/components/shared/Icons';
import { TRoutePath } from '@/config';
import { isDev } from '@/constants';
import { AIGenerationsStatusInfo } from '@/features/ai-generations/components';
import { useAIGenerationsStatus } from '@/features/ai-generations/query-hooks';
import { TAvailableQuestion } from '@/features/questions/types';
import { TAvailableTopic } from '@/features/topics/types';
import { useUserById } from '@/features/users/query-hooks';
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
  const { user: topicAuthor, loading: isAuthorLoading } = useUserById(topic?.userId);

  const t = useT();

  const isTopicLoadingOverall = false; // !topic && /* !isTopicsFetched || */ (!isTopicFetched || isTopicLoading);
  const isOwner = !!topic?.userId && topic?.userId === user?.id;

  const questionTextContent = (
    <div
      data-testid="__ViewQuestionContentSummary_Section_QuestionText"
      className="flex flex-col gap-4"
    >
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">{t('ViewQuestionContentSummary.QuestionText')}</h3>
        {question.isGenerated && (
          <div className="flex items-center gap-1 rounded-md bg-secondary-500 px-2 py-1 text-xs text-secondary-foreground">
            <Icons.WandSparkles className="size-3 opacity-50" />
            {t('ViewQuestionContentSummary.AiGenerated')}
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
        <h3 className="text-lg font-semibold">{t('ViewQuestionContentSummary.Answers')}</h3>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`${routePath}/${question.topicId}/questions/${question.id}/answers` as TRoutePath}
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'flex items-center gap-2',
              !isLogged && 'disabled',
            )}
            title={t('ViewQuestionContentSummary.ManageAnswers')}
          >
            <Icons.Edit className="size-4 opacity-50" />
            <span>{t('ViewQuestionContentSummary.ManageAnswers')}</span>
          </Link>
          <Link
            href={
              `${routePath}/${question.topicId}/questions/${question.id}/answers/generate` as TRoutePath
            }
            className={cn(
              buttonVariants({ variant: 'gr1' }),
              'flex items-center gap-2',
              (!aiGenerationsAllowed || aiGenerationsLoading) && 'disabled',
            )}
            title={t('ViewQuestionContentSummary.GenerateAnswers')}
          >
            <Icons.WandSparkles className="size-4 opacity-50" />
            <span>{t('ViewQuestionContentSummary.GenerateAnswers')}</span>
          </Link>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="flex items-center gap-2 px-2 py-1">
          <Icons.Answers className="size-4 opacity-50" />
          {question._count?.answers ? (
            <span>
              {t('ViewQuestionContentSummary.AnswersCount')}: {question._count.answers}
            </span>
          ) : (
            <span>{t('ViewQuestionContentSummary.NoAnswersYet')}</span>
          )}
        </Badge>

        {question.answersCountRandom && question.answersCountMin && question.answersCountMax && (
          <Badge
            variant="outline"
            className="flex items-center gap-2 border-blue-500 px-2 py-1 text-blue-500"
          >
            <Icons.Hash className="size-4 opacity-50" />
            <span>
              {t('ViewQuestionContentSummary.RandomAnswersRange')}: {question.answersCountMin}-
              {question.answersCountMax}
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
      {generateArray(1).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-lg" />
      ))}
    </div>
  ) : topic ? (
    <div data-testid="__ViewQuestionContentSummary_Section_Topic" className="flex flex-col gap-4">
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold">{t('ViewQuestionContentSummary.Topic')}</h3>
        <div className="flex flex-wrap gap-2">
          {isOwner && (
            <Link
              href={`${routePath}/${topic.id}` as TRoutePath}
              className={cn(buttonVariants({ variant: 'ghost' }), 'flex items-center gap-2')}
            >
              <Icons.Edit className="size-4 opacity-50" />
              <span className="truncate">{t('ViewQuestionContentSummary.ManageTopic')}</span>
            </Link>
          )}
          <Link
            href={`${routePath}/${topic.id}/questions/generate` as TRoutePath}
            className={cn(
              buttonVariants({ variant: 'gr1' }),
              'flex items-center gap-2',
              !aiGenerationsAllowed && 'disabled',
            )}
            title={t('GenerateQuestions')}
          >
            <Icons.WandSparkles className="size-4 opacity-50" />
            <span className="truncate">{t('GenerateQuestions')}</span>
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-2 rounded-lg bg-slate-500/10 p-3">
        <p className="font-medium">{topic.name}</p>
        {topic.description && (
          <p className="text-sm opacity-50">{truncateMarkdown(topic.description, 100)}</p>
        )}
        {!!topic._count?.questions && (
          <p className="text-sm opacity-50">
            <span className="opacity-50">{t('ViewQuestionContentSummary.TotalQuestions')}:</span>{' '}
            {topic._count?.questions}
          </p>
        )}
      </div>
    </div>
  ) : null;

  const authorInfoContent = (isAuthorLoading || topicAuthor) && (
    <div data-testid="__ViewQuestionContentSummary_Section_Author" className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">{t('ViewQuestionContentSummary.Author')}</h3>
      <div className="flex items-center gap-2 text-sm">
        {isAuthorLoading ? (
          <Skeleton className="h-4 w-32 rounded" />
        ) : isOwner ? (
          <>
            <Icons.ShieldCheck className="hidden size-4 opacity-50 sm:flex" />
            <span>{t('ViewQuestionContentSummary.YouAreTheAuthor')}</span>
          </>
        ) : (
          topicAuthor && (
            <>
              <Icons.User className="hidden size-4 opacity-50 sm:flex" />
              <span className="opacity-50">{t('ViewQuestionContentSummary.TopicCreatedBy')}:</span>
              <span>{topicAuthor.name || topicAuthor.email || 'Unknown'}</span>
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
      <h3 className="text-lg font-semibold">{t('ViewQuestionContentSummary.Timeline')}</h3>
      <div className="flex flex-wrap gap-4 gap-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Icons.CalendarDays className="hidden size-4 opacity-50 sm:flex" />
          <span className="opacity-50">{t('ViewQuestionContentSummary.Created')}:</span>
          <span>{getFormattedRelativeDate(format, question.createdAt)}</span>
        </div>
        {!!compareDates(question.updatedAt, question.createdAt) && (
          <div className="flex items-center gap-2">
            <Icons.Edit className="hidden size-4 opacity-50 sm:flex" />
            <span className="opacity-50">{t('ViewQuestionContentSummary.Modified')}:</span>
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
      <AIGenerationsStatusInfo />
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
