import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { isLoggedUser } from '@/lib/session';
import { TAwaitedLocaleProps } from '@/i18n/types';
import { PageError } from '@/components/shared/PageError';
import { welcomeAliasRoute } from '@/config';
import { TTopicsManageScopeId } from '@/contexts/TopicsContext';

type TAwaitedProps = TAwaitedLocaleProps<{ scope: TTopicsManageScopeId; topicId: string }>;

type TManageTopicQuestionsLayoutProps = TAwaitedProps & {
  children: React.ReactNode;
  addQuestionModal: React.ReactNode; // slot from @addQuestionModal
  deleteQuestionModal: React.ReactNode; // slot from @deleteQuestionModal
  generateQuestionsModal: React.ReactNode; // slot from @generateQuestionsModal
};

export default async function ManageTopicQuestionsLayout(props: TManageTopicQuestionsLayoutProps) {
  const {
    children,
    addQuestionModal, // slot from @addQuestionModal
    deleteQuestionModal, // slot from @deleteQuestionModal
    generateQuestionsModal, // slot from @generateQuestionsModal
    params,
  } = props;
  const resolvedParams = await params;
  const {
    locale,
    // scope,
    topicId,
  } = resolvedParams;

  if (!topicId) {
    return <PageError error={'Topic ID not specified.'} />;
  }

  const isLogged = await isLoggedUser();
  if (!isLogged) {
    redirect(welcomeAliasRoute);
  }

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <>
      {children}
      {addQuestionModal}
      {deleteQuestionModal}
      {generateQuestionsModal}
    </>
  );
}
