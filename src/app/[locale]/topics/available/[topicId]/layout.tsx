import { TAwaitedLocaleProps } from '@/i18n/types';
import { PageError } from '@/components/shared/PageError';
import { WorkoutContextProvider } from '@/contexts/WorkoutContext';

type TAwaitedProps = TAwaitedLocaleProps<{
  //  scope: TTopicsManageScopeId;
  topicId: string;
}>;

type TWorkoutTopicLayoutProps = TAwaitedProps & {
  children: React.ReactNode;
};

// const scope: TTopicsManageScopeId = TopicsManageScopeIds.AVAILABLE_TOPICS;

export default async function WorkoutTopicLayout(props: TWorkoutTopicLayoutProps) {
  const { children, params } = props;
  const resolvedParams = await params;
  const { topicId } = resolvedParams;

  if (!topicId) {
    return <PageError error={'Topic ID not specified.'} />;
  }

  return (
    <WorkoutContextProvider
      //  userId={userId}
      topicId={topicId}
    >
      {children}
    </WorkoutContextProvider>
  );
}
