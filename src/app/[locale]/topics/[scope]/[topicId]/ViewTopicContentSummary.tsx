'use client';

import React from 'react';
import { useFormatter } from 'next-intl';

import { compareDates, getFormattedRelativeDate } from '@/lib/helpers/dates';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Link } from '@/i18n/routing';
import { Badge } from '@/components/ui/Badge';
import { buttonVariants } from '@/components/ui/Button';
import { MarkdownText } from '@/components/ui/MarkdownText';
import { Separator } from '@/components/ui/Separator';
import { LanguageName } from '@/components/shared';
import * as Icons from '@/components/shared/Icons';
import { TRoutePath } from '@/config';
import { isDev } from '@/constants';
import { AIGenerationsStatusInfo } from '@/features/ai-generations/components';
import { MediumCategoriesListByCategoryIds } from '@/features/categories/components';
import { SmallUserBlock } from '@/features/users';
import { useAvailableTopicById } from '@/hooks';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

interface TProps {
  availableTopicQuery: ReturnType<typeof useAvailableTopicById>;
}

export function ViewTopicContentSummary({ availableTopicQuery }: TProps) {
  const { manageScope } = useManageTopicsStore();
  const routePath = `/topics/${manageScope}`;
  const format = useFormatter();
  const t = useT();

  const { topic } = availableTopicQuery;

  // Check if query is actually being invalidated
  if (!topic) {
    throw new Error(t('ViewTopicContentSummary.NoTopicLoaded'));
  }

  // const user = useSessionUser();
  // const isOwner = !!topic.userId && topic.userId === user?.id;

  const categoryIds = topic.categoryIds || topic.categories?.map(({ id }) => id);

  return (
    <div
      className={cn(
        isDev && '__ViewTopicContentSummary', // DEBUG
        'content-truncate mx-6 flex w-full flex-col gap-4',
      )}
    >
      <AIGenerationsStatusInfo />

      {/* Topic Description */}
      {topic.description && (
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

      {/* Topic Questions */}
      <div
        data-testid="__ViewTopicContentSummary_Section_Questions"
        className="content-truncate flex flex-col gap-4"
      >
        <h3 className="content-truncate text-lg font-semibold">{t('Questions')}</h3>
        <div className="flex flex-wrap gap-2">
          {!!topic._count?.questions && (
            <span className="flex items-center gap-2">
              <Icons.Questions className="size-4 shrink-0 opacity-50" />
              <span>
                {t('ViewTopicContentSummary.QuestionsCount')}: {topic._count.questions}
              </span>
            </span>
          )}
          <Link
            href={`${routePath}/${topic.id}/questions/generate` as TRoutePath}
            className={cn(buttonVariants({ variant: 'gr1' }), 'flex items-center gap-2 truncate')}
          >
            <Icons.WandSparkles className="size-4 shrink-0 opacity-50" />
            <span className="truncate">{t('GenerateQuestions')}</span>
          </Link>
          <Link
            href={`${routePath}/${topic.id}/questions` as TRoutePath}
            className={cn(buttonVariants({ variant: 'theme' }), 'flex items-center gap-2 truncate')}
          >
            <Icons.Edit className="size-4 shrink-0 opacity-50" />
            <span className="truncate">{t('ViewTopicContentSummary.ManageQuestions')}</span>
          </Link>
        </div>
      </div>

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
          {topic.langName && (
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
          {/*isOwner ? (
            <>
              <Icons.ShieldCheck className="size-4 opacity-50 opacity-50" />
              <span>{t('ViewTopicContentSummary.YouAreTheAuthor')}</span>
            </>
          ) : (
            topic.user && <SmallUserBlock user={topic.user} />
          )*/}
        </div>
      </div>
    </div>
  );
}
