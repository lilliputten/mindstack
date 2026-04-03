import { redirect } from 'next/navigation';

import { constructMetadata } from '@/lib/constructMetadata';
import { prisma } from '@/lib/db';
import { checkIfUserIsAdmin, getCurrentUser } from '@/lib/session';
import { cn } from '@/lib/utils';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { isDev, welcomeAliasRoute } from '@/config';

import { UiDemoForm } from './UiDemoForm';

export async function generateMetadata() {
  return constructMetadata({
    title: 'UI Demo',
  });
}

export default async function TestQueryPage() {
  const user = await getCurrentUser();
  const userId = user?.id;
  const isAdmin = checkIfUserIsAdmin(user); // await isAdminUser();

  // Fetch the first available public topic (which has questions) id
  const topic = await prisma.topic.findFirst({
    where: {
      isPublic: true,
      questions: { some: {} },
      ...(userId ? { userId } : {}),
    },
    include: {
      questions: true,
      _count: { select: { questions: true } },
    },
    // select: { id: true },
    orderBy: { createdAt: 'asc' },
  });

  const topicId = topic?.id;

  if (!isAdmin) {
    return redirect(welcomeAliasRoute);
  }

  return (
    <PageWrapper
      id="UiDemoPage"
      className={cn(
        isDev && '__UiDemoPage', // DEBUG
      )}
      innerClassName={cn(
        isDev && '__UiDemoPage_Inner', // DEBUG
        'w-full rounded-lg gap-6 py-6',
      )}
      limitWidth
      // scrollable
    >
      <UiDemoForm topicId={topicId} />
    </PageWrapper>
  );
}
