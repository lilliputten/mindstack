import { setRequestLocale } from 'next-intl/server';

import { constructMetadata } from '@/lib/constructMetadata';
import { getErrorText, getRandomHashString } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { getT } from '@/i18n';
import { strictLocalesList, TAwaitedLocaleProps, TLocale } from '@/i18n/types';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { LandingContent } from '@/components/screens/LandingContent';
import { isDev } from '@/constants';
import { LandingPageContextRoot } from '@/contexts/LandingPageContext/LandingPageContextRoot';
import { getCachedRecentCategories, getRecentCategories } from '@/features/categories/actions';
import { TCategory } from '@/features/categories/types';
import { getRecentTopics, TTopic } from '@/features/topics';

type TLandingPageProps = TAwaitedLocaleProps & {
  recentCategories?: TCategory[];
  recentTopics?: TTopic[];
};

export async function generateMetadata({ params }: TAwaitedLocaleProps) {
  const { locale } = await params;
  const t = await getT({ locale });
  return constructMetadata({
    title: t('Pages.RootTitle'),
    locale,
  });
}

const saveScrollHash = getRandomHashString();

async function getCategories(locale: TLocale) {
  const promise = isDev ? getRecentCategories({ locale }) : getCachedRecentCategories({ locale });
  return await promise;
}

async function getTopics(locale: TLocale) {
  const promise = getRecentTopics({ locale }); // isDev ? getRecentTopics({ locale }) : getCachedRecentTopics({ locale });
  return await promise;
}

export async function generateStaticParams() {
  const locales = strictLocalesList;
  const params = [];
  // TODO: To run all request at once (via `Promise.all`)
  for (const locale of locales) {
    let recentCategories: TCategory[] = [];
    let recentTopics: TTopic[] = [];
    try {
      // Fetch categories for each locale to enable per-locale SSG generation
      const [categories, topics] = await Promise.allSettled([
        getCategories(locale),
        getTopics(locale),
      ]);
      // Get all fulfilled results
      if (categories.status === 'fulfilled') {
        recentCategories = categories.value;
      }
      if (topics.status === 'fulfilled') {
        recentTopics = topics.value;
      }
    } catch (error) {
      const message = 'Failed to fetch recent categories for static generation';
      const details = getErrorText(error);
      const comboMsg = [message, details].filter(Boolean).join(': ');
      // eslint-disable-next-line no-console
      console.error('[LandingPage:generateStaticParams]', comboMsg, {
        error,
        locale,
        locales,
      });
      debugger; // eslint-disable-line no-debugger
    }
    params.push({ locale, recentCategories, recentTopics });
  }
  return params;
}

export async function LandingPage(props: TLandingPageProps) {
  const resolvedParams = await props.params;
  const { locale } = resolvedParams;

  let recentCategories: TCategory[] = props.recentCategories || [];
  let recentTopics: TTopic[] = props.recentTopics || [];

  // Use pre-fetched categories from generateStaticParams if available,
  // otherwise fetch them (for non-SSG scenarios)
  if (!recentCategories.length && !recentTopics.length) {
    try {
      // Fetch categories for each locale to enable per-locale SSG generation
      const [categories, topics] = await Promise.allSettled([
        getCategories(locale),
        getTopics(locale),
      ]);
      // Get all fulfilled results
      if (categories.status === 'fulfilled') {
        recentCategories = categories.value;
      }
      if (topics.status === 'fulfilled') {
        recentTopics = topics.value;
      }
    } catch (error) {
      const message = 'Failed to fetch recent categories';
      const details = getErrorText(error);
      const comboMsg = [message, details].filter(Boolean).join(': ');
      // eslint-disable-next-line no-console
      console.error('[LandingPage]', comboMsg, {
        error,
        locale,
        resolvedParams,
        props,
      });
      debugger; // eslint-disable-line no-debugger
    }
  }

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <LandingPageContextRoot
      // Data parameters...
      recentCategories={recentCategories}
      recentTopics={recentTopics}
    >
      <PageWrapper
        id="LandingPage"
        className={cn(
          isDev && '__LandingPage', // DEBUG
        )}
        innerClassName={cn(
          isDev && '__LandingPage_Inner', // DEBUG
          'size-full',
        )}
        // scrollable
        // limitWidth
      >
        <ScrollArea
          saveScrollKey="LandingPage"
          saveScrollHash={saveScrollHash}
          className={cn(
            isDev && '__LandingPage_Scroll', // DEBUG
            'flex flex-1 flex-col overflow-hidden',
            'bg-theme-500/5',
          )}
          viewportClassName={cn(
            isDev && '__LandingPage_ScrollViewport', // DEBUG
            'flex flex-1 flex-col',
            'bg-decorative-gradient',
            '[&>div]:flex-col [&>div]:flex-1 [&>div]:justify-center [&>div]:items-center',
          )}
        >
          <LandingContent />
        </ScrollArea>
      </PageWrapper>
    </LandingPageContextRoot>
  );
}
