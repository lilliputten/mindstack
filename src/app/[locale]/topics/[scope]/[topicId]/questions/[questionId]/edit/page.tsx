import { constructMetadata } from '@/lib/constructMetadata';
import { cn } from '@/lib/utils';
import { getT } from '@/i18n';
import { TAwaitedLocaleProps } from '@/i18n/types';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageError } from '@/components/shared/PageError';
import { isDev } from '@/config';
import { TTopicsManageScopeId } from '@/contexts/TopicsContext';

import { EditQuestionCardHolder } from './EditQuestionCardHolder';

type TAwaitedProps = TAwaitedLocaleProps<{
  scope: TTopicsManageScopeId;
  topicId: string;
  questionId: string;
}>;

export async function generateMetadata({ params }: TAwaitedProps) {
  const { locale } = await params;
  const t = await getT({ locale });
  const title = t('Pages.EditQuestionPropertiesTitle');
  return constructMetadata({
    locale,
    title,
  });
}

export default async function EditManageQuestionPage({ params }: TAwaitedProps) {
  const { topicId, questionId } = await params;

  if (!questionId) {
    return <PageError error={'Not specified question'} />;
  }

  return (
    <PageWrapper
      className={cn(
        isDev && '__EditManageQuestionPageWrapper', // DEBUG
      )}
      innerClassName={cn(
        isDev && '__EditManageQuestionPageWrapper_Inner', // DEBUG
        'w-full rounded-lg gap-6 py-6',
      )}
      limitWidth
      // vPadded
    >
      <EditQuestionCardHolder topicId={topicId} questionId={questionId} />
    </PageWrapper>
  );
}
