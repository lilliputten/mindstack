import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { PageWrapper } from '@/components/layout/PageWrapper';
import NotFoundScreen from '@/components/pages/shared/NotFoundScreen';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return { status: 404 };
}

export default function NotFound() {
  const t = useT();
  return (
    <PageWrapper
      className={cn(
        isDev && '__TopicNotFoundPage', // DEBUG
      )}
      innerClassName="gap-6 justify-center items-center"
      scrollable
      limitWidth
    >
      <NotFoundScreen
        className={cn(
          isDev && '__TopicNotFoundPage_Screen', // DEBUG
          'w-full',
        )}
        icon={Icons.Topics}
        title={t('NotFoundPages.WrongTopicComponentRequested')}
      />
    </PageWrapper>
  );
}
