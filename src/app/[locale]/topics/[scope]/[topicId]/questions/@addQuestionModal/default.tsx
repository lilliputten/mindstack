'use client';

import { usePathname } from 'next/navigation';

import { AddQuestionModalPage } from '@/components/pages/ManageTopicQuestions';

export default function AddQuestionModalDefault() {
  const pathname = usePathname();
  // Only render the modal if we're on the questions/add route (not answers/add)
  const isAddQuestionRoute = pathname?.endsWith('/questions/add');

  if (isAddQuestionRoute) {
    return <AddQuestionModalPage />;
  }

  return null;
}
