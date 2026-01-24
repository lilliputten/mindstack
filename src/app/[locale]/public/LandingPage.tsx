import { setRequestLocale } from 'next-intl/server';

import { constructMetadata } from '@/lib/constructMetadata';
import { getRandomHashString } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { getT } from '@/i18n';
import { TAwaitedLocaleProps } from '@/i18n/types';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { LandingContent } from '@/components/screens/LandingContent';
import { isDev } from '@/constants';
import { LandingPageContextRoot } from '@/contexts/LandingPageContext/LandingPageContextRoot';
import { getCachedRecentCategories, getRecentCategories } from '@/features/categories/actions';
import { TCategory } from '@/features/categories/types';

type TLandingPageProps = TAwaitedLocaleProps & {
  recentCategories?: TCategory[];
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

export async function generateStaticParams() {
  try {
    const promise = isDev ? getRecentCategories() : getCachedRecentCategories();
    const recentCategories = await promise;
    console.log('[LandingPage:generateStaticParams]', {
      recentCategories,
    });
    return [{ recentCategories }];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[LandingPage:generateStaticParams] Failed to fetch recent categories', {
      error,
    });
    return [{ recentCategories: [] }];
  }
}

export async function LandingPage({ params, recentCategories = [] }: TLandingPageProps) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <LandingPageContextRoot recentCategories={recentCategories}>
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
