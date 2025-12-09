import { setRequestLocale } from 'next-intl/server';

import { constructMetadata } from '@/lib/constructMetadata';
import { getRandomHashString } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { LandingContent } from '@/components/screens/LandingContent';
import { isDev } from '@/constants';
import { TAwaitedLocaleProps } from '@/i18n/types';

type TLandingPageProps = TAwaitedLocaleProps;

export async function generateMetadata({ params }: TAwaitedLocaleProps) {
  const { locale } = await params;
  // const t = await getTranslations({ locale, namespace: 'LandingPage' });
  return constructMetadata({
    title: 'Mind Stack',
    locale,
  });
}

const saveScrollHash = getRandomHashString();

export async function LandingPage({ params }: TLandingPageProps) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <PageWrapper
      id="LandingPage"
      className={cn(
        isDev && '__LandingPage', // DEBUG
      )}
      innerClassName={cn(
        isDev && '__LandingPage_Inner', // DEBUG
        'w-full h-full',
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
          '[&>div]:flex-col [&>div]:p-6 [&>div]:flex-1 [&>div]:justify-center [&>div]:items-center',
        )}
      >
        <LandingContent />
      </ScrollArea>
    </PageWrapper>
  );
}
