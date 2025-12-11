import { setRequestLocale } from 'next-intl/server';

import { constructMetadata } from '@/lib/constructMetadata';
import { getRandomHashString } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PricingContent } from '@/components/screens/PricingContent';
import { isDev } from '@/constants';
import { TAwaitedLocaleProps } from '@/i18n/types';

type TPricingPageProps = TAwaitedLocaleProps;

export async function generateMetadata({ params }: TAwaitedLocaleProps) {
  const { locale } = await params;
  return constructMetadata({
    title: 'Pricing - Mind Stack',
    locale,
  });
}

const saveScrollHash = getRandomHashString();

export async function PricingPage({ params }: TPricingPageProps) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <PageWrapper
      id="PricingPage"
      className={cn(
        isDev && '__PricingPage', // DEBUG
      )}
      innerClassName={cn(
        isDev && '__PricingPage_Inner', // DEBUG
        'w-full h-full',
      )}
    >
      <ScrollArea
        saveScrollKey="PricingPage"
        saveScrollHash={saveScrollHash}
        className={cn(
          isDev && '__PricingPage_Scroll', // DEBUG
          'flex flex-1 flex-col overflow-hidden',
          'bg-theme-500/5',
        )}
        viewportClassName={cn(
          isDev && '__PricingPage_ScrollViewport', // DEBUG
          'flex flex-1 flex-col',
          'bg-decorative-gradient',
          '[&>div]:flex-col [&>div]:flex-1 [&>div]:justify-center [&>div]:items-center',
        )}
      >
        <PricingContent />
      </ScrollArea>
    </PageWrapper>
  );
}
