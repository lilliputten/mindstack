'use client';

import { RichTranslationValues } from 'next-intl';

import { generateArray } from '@/lib/helpers';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Link } from '@/i18n/routing';
import {
  aboutAliasRoute,
  availableCategoriesRoute,
  availableTopicsRoute,
  myTopicsRoute,
  pricingAliasRoute,
  recentTrainingsRoute,
} from '@/config';
import { isDev } from '@/constants';
import { useEnvContext } from '@/contexts/EnvContext';
import { getUserStatusText } from '@/features/users/helpers/getUserStatusText';
import { useSessionData } from '@/hooks';

import { Skeleton } from '../ui/Skeleton';

export function AppIntroBlock(props: TPropsWithClassName) {
  const t = useT();
  const { className } = props;
  const { user, loading: isUserLoading } = useSessionData();
  const isAdmin = user?.role === 'ADMIN';
  const {
    BASIC_USER_GENERATIONS,
    PRO_USER_MONTHLY_GENERATIONS,
    BASIC_TOPICS_LIMIT,
    BASIC_QUESTIONS_LIMIT,
    BASIC_ANSWERS_LIMIT,
    PRO_TOPICS_LIMIT,
    PRO_QUESTIONS_LIMIT,
    // PRO_ANSWERS_LIMIT,
    // PREMIUM_TOPICS_LIMIT,
    // PREMIUM_QUESTIONS_LIMIT,
    // PREMIUM_ANSWERS_LIMIT,
  } = useEnvContext();

  const richTextTags: RichTranslationValues = {
    p: (chunks) => <p>{chunks}</p>,
    ol: (chunks) => <ol className="items">{chunks}</ol>,
    ul: (chunks) => <ul className="items">{chunks}</ul>,
    li: (chunks) => <li>{chunks}</li>,
    strong: (chunks) => <strong>{chunks}</strong>,
    LinkAvailableTopics: (chunks) => <Link href={availableTopicsRoute}>{chunks}</Link>,
    LinkPricing: (chunks) => <Link href={pricingAliasRoute}>{chunks}</Link>,
    CategoriesLink: (chunks) => <Link href={availableCategoriesRoute}>{chunks}</Link>,
    LinkMyTopics: (chunks) => <Link href={myTopicsRoute}>{chunks}</Link>,
    Trainings: (chunks) => <Link href={recentTrainingsRoute}>{chunks}</Link>,
  };

  return (
    <div
      className={cn(
        isDev && '__AppIntroBlock', // DEBUG
        'flex flex-col gap-2',
        'content-text',
        className,
      )}
    >
      <p className="text-gr3 py-2 text-lg font-semibold">{t('AppIntro.Subtitle')}</p>

      <p>
        {t.rich('AppIntro.BlockContent', {
          AboutLink: (chunks) => <Link href={aboutAliasRoute}>{chunks}</Link>,
        })}
      </p>

      {isUserLoading ? (
        <>
          {generateArray(1).map((_, i) => (
            <Skeleton key={i} className="h-6 w-1/2 rounded-lg" />
          ))}
        </>
      ) : (
        <>
          <p className="font-bold">
            {t('AppIntro.CurrentUserStatus', { status: getUserStatusText(user, t) })}
          </p>

          {/* Guest specific */}
          {!user && (
            <>
              <p>{t.rich('AppIntro.GuestSpecificText', richTextTags)}</p>

              {/* Guest features */}
              <div className="space-y-1">
                <p>{t.rich('AppIntro.GuestFeaturesTitle', richTextTags)}</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>{t.rich('AppIntro.ViewPublicTopics', richTextTags)}</li>
                  <li>{t('AppIntro.TryWorkoutSessions')}</li>
                  <li>{t('AppIntro.AdjustPersonalSettings')}</li>
                  <li>
                    {t('AppIntro.TrackBasicPerformance')} <span className="text-theme">*</span>
                  </li>
                </ul>
              </div>
            </>
          )}

          {/* Basic user */}
          {user && user.grade === 'BASIC' && (
            <div className="space-y-1">
              <p>{t.rich('AppIntro.BasicFeaturesTitle', richTextTags)}</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  {t('AppIntro.CreateTopics', {
                    limit: (BASIC_TOPICS_LIMIT ?? 5).toString(),
                  })}
                </li>
                <li>
                  {t('AppIntro.AddQuestionsPerTopic', {
                    limit: (BASIC_QUESTIONS_LIMIT ?? 50).toString(),
                  })}
                </li>
                <li>
                  {t('AppIntro.AddAnswersPerQuestion', {
                    limit: (BASIC_ANSWERS_LIMIT ?? 10).toString(),
                  })}
                </li>
                <li>{t('AppIntro.AIGenerationsTotal', { count: BASIC_USER_GENERATIONS })}</li>
                <li>{t('AppIntro.BasicProgressTracking')}</li>
                <li>
                  {t('AppIntro.PublicCommunityAccess')} <span className="text-theme">*</span>
                </li>
                <li>{t('AppIntro.BasicWorkoutSessions')}</li>
              </ul>
            </div>
          )}

          {/* PRO user */}
          {user && user.grade === 'PRO' && (
            <div className="space-y-1">
              <p>{t.rich('AppIntro.ProFeaturesTitle', richTextTags)}</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>{t('AppIntro.CreateUnlimitedTopics')}</li>
                <li>
                  {t('AppIntro.AddQuestionsPerTopicPro', {
                    limit: (PRO_TOPICS_LIMIT ?? 100).toString(),
                  })}
                </li>
                <li>
                  {t('AppIntro.AddAnswersPerQuestionPro', {
                    limit: (PRO_QUESTIONS_LIMIT ?? 20).toString(),
                  })}
                </li>
                <li>
                  {t('AppIntro.AIGenerationsPerMonth', { count: PRO_USER_MONTHLY_GENERATIONS })}
                </li>
                <li>
                  {t('AppIntro.AdvancedAnalyticsInsights')} <span className="text-theme">*</span>
                </li>
                <li>
                  {t('AppIntro.PrioritySupport')} <span className="text-theme">*</span>
                </li>
                <li>{t('AppIntro.AIQuestionAnswerGeneration')}</li>
              </ul>
            </div>
          )}

          {/* PREMIUM user */}
          {user && user.grade === 'PREMIUM' && (
            <div className="space-y-1">
              <p>{t.rich('AppIntro.PremiumFeaturesTitle', richTextTags)}</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>{t('AppIntro.EverythingInProPlan')}</li>
                <li>{t('AppIntro.UnlimitedContentCreation')}</li>
                <li>{t('AppIntro.UnlimitedAIGenerations')}</li>
                <li>
                  {t('AppIntro.AdvancedPrioritySupport')} <span className="text-theme">*</span>
                </li>
                <li>
                  {t('AppIntro.ExportImportFunctionality')} <span className="text-theme">*</span>
                </li>
                <li>
                  {t('AppIntro.AdvancedIntegrations')} <span className="text-theme">*</span>
                </li>
              </ul>
            </div>
          )}

          {/* Admin */}
          {isAdmin && (
            <p className="border-l-2 border-red-500 pl-3">
              {t.rich('AppIntro.AdminAccessText', richTextTags)}
            </p>
          )}
        </>
      )}

      {/* Features available to all */}
      <div className="space-y-1">
        <p>
          <strong>{t('AppIntro.EveryoneCan')}</strong>
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>{t.rich('AppIntro.ViewPublicTopics', richTextTags)}</li>
          <li>{t.rich('AppIntro.BrowseCategories', richTextTags)}</li>
          <li>{t('AppIntro.AdjustWorkoutSettings')}</li>
          <li>
            {t.rich('AppIntro.ProgressTracking', richTextTags)}{' '}
            <span className="text-theme">**</span>
          </li>
        </ul>
      </div>

      {/* Link to pricing page */}
      <div className="space-y-1">
        <p>{t.rich('AppIntro.PremiumUsersAlsoGet', richTextTags)}</p>
      </div>

      <div className="space-y-2">
        {/* Future features note */}
        <div className="mt-2 flex items-start gap-2 text-sm">
          <span className="text-theme">*</span>
          <span className="opacity-50">{t('AppIntro.FutureFeatureNote')}</span>
        </div>

        {/* Local progress tracking note for unauthorized users */}
        <div className="mt-2 flex items-start gap-2 text-sm">
          <span className="text-theme">**</span>
          <span className="opacity-50">{t('AppIntro.LocalProgressTrackingNote')}</span>
        </div>
      </div>
    </div>
  );
}
