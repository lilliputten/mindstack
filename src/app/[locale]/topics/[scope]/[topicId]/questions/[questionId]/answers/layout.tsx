import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { isLoggedUser } from '@/lib/session';
import { PageError } from '@/components/shared/PageError';
import { welcomeAliasRoute } from '@/config';
import { TTopicsManageScopeId } from '@/contexts/TopicsContext';
import { TAwaitedLocaleProps } from '@/i18n/types';

type TAwaitedProps = TAwaitedLocaleProps<{
  scope: TTopicsManageScopeId;
  topicId: string;
  questionId: string;
}>;

type TManageTopicQuestionAnswersLayoutProps = TAwaitedProps & {
  children: React.ReactNode;
  generateAnswersModal: React.ReactNode; // slot from @generateAnswersModal
  addAnswerModal: React.ReactNode; // slot from @addAnswerModal
  deleteAnswerModal: React.ReactNode; // slot from @deleteAnswerModal
};

export default async function ManageTopicQuestionAnswersLayout(
  props: TManageTopicQuestionAnswersLayoutProps,
) {
  const {
    children,
    generateAnswersModal, // slot from @generateAnswersModal
    addAnswerModal, // slot from @addAnswerModal
    deleteAnswerModal, // slot from @deleteAnswerModal
    params,
  } = props;
  const resolvedParams = await params;
  const { locale, topicId, questionId } = resolvedParams;

  if (!topicId) {
    return <PageError error={'No topic ID specified.'} />;
  }

  if (!questionId) {
    return <PageError error={'No question ID specified.'} />;
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
      {generateAnswersModal}
      {addAnswerModal}
      {deleteAnswerModal}
    </>
  );
}
