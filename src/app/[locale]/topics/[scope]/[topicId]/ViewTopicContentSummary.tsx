'use client';

import React from 'react';
import { useFormatter } from 'next-intl';

import { generateArray } from '@/lib/helpers';
import { compareDates, getFormattedRelativeDate } from '@/lib/helpers/dates';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Link } from '@/i18n/routing';
import { Badge } from '@/components/ui/Badge';
import { buttonVariants } from '@/components/ui/Button';
import { MarkdownText } from '@/components/ui/MarkdownText';
import { Separator } from '@/components/ui/Separator';
import { Skeleton } from '@/components/ui/Skeleton';
import { LanguageName } from '@/components/shared';
import * as Icons from '@/components/shared/Icons';
import { TRoutePath } from '@/config';
import { defaultStaleTime, isDev } from '@/constants';
import { AIGenerationsStatusInfo } from '@/features/ai-generations/components';
import { MediumCategoriesListByCategoryIds } from '@/features/categories/components';
import { QuestionsEditor } from '@/features/questions/components/QuestionsEditor';
import { SmallUserBlock } from '@/features/users';
import { useAvailableQuestions, useAvailableTopicById } from '@/hooks';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

interface TProps {
  availableTopicQuery: ReturnType<typeof useAvailableTopicById>;
}

export function ViewTopicContentSummary({ availableTopicQuery }: TProps) {
  const { manageScope } = useManageTopicsStore();
  const routePath = `/topics/${manageScope}`;
  const format = useFormatter();
  const t = useT();

  const { topic, isFetched: isTopicFetched, isFetching: isTopicFetching } = availableTopicQuery;

  const [hasQuestionsChanged, setHasQuestionsChanged] = React.useState(false);

  const topicId = topic?.id;

  const availableQuestionsQuery = useAvailableQuestions({
    traceId: 'ViewTopicContentSummary',
    topicId,
    itemsLimit: null, // Take all questions, without paging
    includeAnswers: true, // Include answers
    // NOTE: Disable update while editing
    staleTime: hasQuestionsChanged ? Infinity : defaultStaleTime,
  });
  const { isFetched: isQuestionsFetched, isFetching: isQuestionsFetching } =
    availableQuestionsQuery;

  // Check if query is actually being invalidated
  if (!topic) {
    throw new Error(t('ViewTopicContentSummary.NoTopicLoaded'));
  }

  const categoryIds = topic.categoryIds || topic.categories?.map(({ id }) => id);

  return (
    <div
      className={cn(
        isDev && '__ViewTopicContentSummary', // DEBUG
        'content-truncate mx-6 flex w-full flex-col gap-4',
      )}
    >
      <AIGenerationsStatusInfo />

      {/* Topic Name */}
      {!!topic.name && (
        <div
          data-testid="__ViewTopicContentSummary_Section_TopicName"
          className="flex flex-col gap-4"
        >
          <h3 className="content-truncate text-lg font-semibold">{t('Name')}</h3>
          <div className="content-truncate rounded-lg bg-slate-500/10 p-4 text-sm">
            {topic.name}
          </div>
        </div>
      )}

      {/* Topic Description */}
      {!!topic.description && (
        <div
          data-testid="__ViewTopicContentSummary_Section_TopicDescription"
          className="flex flex-col gap-4"
        >
          <h3 className="content-truncate text-lg font-semibold">
            {t('ViewTopicContentSummary.Description')}
          </h3>
          <div className="content-truncate rounded-lg bg-slate-500/10 p-4">
            <MarkdownText className="content-truncate">{topic.description}</MarkdownText>
          </div>
        </div>
      )}

      {/* Topic Extra Query */}
      {!!topic.extraQuery && (
        <div
          data-testid="__ViewTopicContentSummary_Section_TopicExtraQuery"
          className="flex flex-col gap-4"
        >
          <h3 className="content-truncate text-lg font-semibold">
            {t('ViewTopicContentSummary.ExtraQuery')}
          </h3>
          <div className="content-truncate rounded-lg bg-slate-500/10 p-4 text-sm">
            {topic.extraQuery}
          </div>
        </div>
      )}

      {/* Categories */}
      {!!categoryIds?.length && (
        <div
          data-testid="__ViewTopicContentSummary_Section_Categories"
          className="content-truncate flex flex-col gap-4"
        >
          <h3 className="content-truncate text-lg font-semibold">{t('Categories')}</h3>
          <MediumCategoriesListByCategoryIds
            className="flex-wrap gap-4 gap-y-2"
            categoryIds={categoryIds}
          />
        </div>
      )}

      {/* Topic Properties */}
      <div
        data-testid="__ViewTopicContentSummary_Section_Properties"
        className="content-truncate flex flex-col gap-4"
      >
        <h3 className="content-truncate text-lg font-semibold">
          {t('ViewTopicContentSummary.Properties')}
        </h3>
        <div className="content-truncate flex flex-wrap gap-2">
          <Badge
            variant={topic.isPublic ? 'success' : 'outline'}
            className="flex gap-2 truncate px-2 py-1"
            title={t('Availability')}
          >
            {topic.isPublic ? (
              <Icons.Eye className="size-4 shrink-0 opacity-50" />
            ) : (
              <Icons.EyeOff className="size-4 shrink-0 opacity-50" />
            )}
            <span className="truncate">
              {topic.isPublic
                ? t('ViewTopicContentSummary.Public')
                : t('ViewTopicContentSummary.Private')}
            </span>
          </Badge>
          {(topic.langName || topic.langCode) && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 truncate px-2 py-1"
              title={t('Language')}
            >
              <Icons.Languages className="size-4 shrink-0 opacity-50" />
              <LanguageName
                langName={topic.langName}
                langCode={topic.langCode}
                className="truncate"
              />
            </Badge>
          )}
          {topic.answersCountRandom && topic.answersCountMin && topic.answersCountMax && (
            <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
              <Icons.Hash className="size-4 shrink-0 opacity-50" />
              {t('ViewTopicContentSummary.RandomAnswers')}: {topic.answersCountMin}-
              <span className="truncate">{topic.answersCountMax}</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Keywords */}
      {topic.keywords && (
        <div
          data-testid="__ViewTopicContentSummary_Section_Keywords"
          className="content-truncate flex flex-col gap-4"
        >
          <h3 className="content-truncate text-lg font-semibold">
            {t('ViewTopicContentSummary.Keywords')}
          </h3>
          <div className="content-truncate flex flex-wrap gap-1">
            {topic.keywords
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
              .map((keyword, idx) => (
                <span key={idx} className="truncate rounded-sm bg-theme-700/10 px-2 text-sm">
                  {keyword}
                </span>
              ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Topic Questions */}
      <div
        data-testid="__ViewTopicContentSummary_Section_Questions"
        className="content-truncate flex flex-col gap-4"
      >
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="content-truncate flex gap-2 text-lg">
            <span className="truncate font-semibold">{t('Questions')}</span>
            {!!topic._count?.questions && (
              <span className="truncate opacity-50">({topic._count.questions})</span>
            )}
          </h3>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`${routePath}/${topic.id}/questions` as TRoutePath}
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                'flex items-center gap-2 truncate',
              )}
            >
              <Icons.Questions className="size-4 shrink-0 opacity-50" />
              <span className="truncate">{t('GoToTheQuestions')}</span>
            </Link>
            <Link
              href={`${routePath}/${topic.id}/questions/generate` as TRoutePath}
              className={cn(buttonVariants({ variant: 'gr1' }), 'flex items-center gap-2 truncate')}
            >
              <Icons.WandSparkles className="size-4 shrink-0 opacity-50" />
              <span className="truncate">{t('GenerateQuestions')}</span>
            </Link>
          </div>
        </div>
        {!!topicId && isTopicFetched && isQuestionsFetched ? (
          <QuestionsEditor
            topicId={topicId}
            availableTopicQuery={availableTopicQuery}
            availableQuestionsQuery={availableQuestionsQuery}
            isReady={isTopicFetched && isQuestionsFetched}
            isLoading={isTopicFetching || isQuestionsFetching}
            setHeadlessEditorState={(state) => setHasQuestionsChanged(state.hasChanges)}
          />
        ) : (
          <div className="flex w-full flex-col gap-2">
            <Skeleton className="h-10 w-full" />
            <div className="flex w-full flex-col gap-1">
              {generateArray(topic._count?.questions ?? 3).map((n) => (
                <Skeleton key={n} className="h-8 w-full" />
              ))}
            </div>
          </div>
        )}
        {/*
        <div className="content-truncate flex flex-wrap gap-2">
          {isQuestionsFetching || !isQuestionsFetched ? (
            generateArray(topic._count?.questions || 3).map((n) => (
              <Skeleton key={n} className="h-5 w-full" />
            ))
          ) : !allQuestions.length ? (
            <p className="text-sm opacity-50">No questions created yet</p>
          ) : (
            <PreviewQuestions className="w-full" questions={allQuestions} />
          )}
        </div>
        */}
        {/*!!topic._count?.questions && (
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="outline" className="flex items-center gap-2 px-2 py-1">
              <Icons.Questions className="size-4 shrink-0 opacity-50" />
              <span className="truncate">
                <span className="truncate opacity-50">
                  {t('ViewTopicContentSummary.QuestionsCount')}:
                </span>{' '}
                <span className="truncate">{topic._count.questions}</span>
              </span>
            </Badge>
          </div>
          )*/}
      </div>

      {/* Timestamps */}
      <div
        data-testid="__ViewTopicContentSummary_Section_Timeline"
        className="content-truncate flex flex-col gap-4"
      >
        <h3 className="content-truncate text-lg font-semibold">{t('Timeline')}</h3>
        <div className="flex flex-wrap gap-4 gap-y-2 text-sm">
          <div className="content-truncate flex flex-wrap items-center gap-2 gap-y-1">
            <span className="flex gap-2 truncate opacity-50">
              <Icons.CalendarDays className="size-4 shrink-0" />
              <span className="truncate">{t('Created')}:</span>
            </span>
            <span className="content-truncate">
              {getFormattedRelativeDate(format, topic.createdAt)}
            </span>
          </div>
          {!!compareDates(topic.updatedAt, topic.createdAt) && (
            <div className="content-truncate flex flex-wrap items-center gap-2 gap-y-1">
              <span className="flex gap-2 truncate opacity-50">
                <Icons.Edit className="size-4 shrink-0" />
                <span className="truncate">{t('Modified')}:</span>
              </span>
              <span className="content-truncate">
                {getFormattedRelativeDate(format, topic.updatedAt)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Author Info */}
      <div
        data-testid="__ViewTopicContentSummary_Section_Author"
        className="content-truncate flex flex-col gap-4"
      >
        <h3 className="content-truncate text-lg font-semibold">{t('Author')}</h3>
        <div className="content-truncate flex items-center gap-2 text-sm">
          <SmallUserBlock user={topic.user} className="truncate" />
        </div>
      </div>

      <Separator />
    </div>
  );
}
