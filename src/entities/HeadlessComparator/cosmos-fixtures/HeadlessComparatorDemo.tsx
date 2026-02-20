import { cn } from '@/lib/utils';
import { MarkdownText } from '@/components/ui/MarkdownText';
import { Icons } from '@/components/shared';
import { isDev } from '@/config';
import { TNewOrOldQuestion } from '@/features/questions/types';

import { HeadlessComparator } from '../HeadlessComparator';

const topicId = 'test-topic';

const items: TNewOrOldQuestion[] = [
  {
    topicId,
    text: 'Specific question',
  },
  {
    topicId,
    text: 'Which of the following accurately describes the flow of tasks in the JavaScript event loop',
  },
  {
    topicId,
    text: 'Which of the following accurately describes the flow of tasks in the JavaScript event loop, considering both microtasks and macrotasks?',
    answers: [
      {
        text: 'Microtasks are executed before macrotasks.',
        explanation:
          'This statement is true because microtasks, such as those from Promises and setImmediate, are processed first within each cycle of the event loop before macrotasks, such as setTimeout and I/O operations.',
        isCorrect: true,
      },
      {
        text: 'Macrotasks are always executed before microtasks.',
        explanation:
          'This statement is false because microtasks are processed before macrotasks in each event loop cycle.',
        isCorrect: false,
      },
    ],
  },
];

function RenderItem({ item, idx }: { item: TNewOrOldQuestion; idx?: number }) {
  const {
    id = String(idx),
    text = '', // "Question markdown text",
    _count,
    answers,
  } = item;
  const Icon = Icons.Dot;
  const count = answers?.length || _count?.answers;
  return (
    <div key={id} className="content-truncate flex gap-4 text-left">
      <div
        className={cn(
          'mt-1.5 flex size-4 shrink-0 items-center justify-center rounded-full',
          'bg-theme-500/50 opacity-20',
        )}
      >
        <Icon className="size-3 text-white" />
      </div>
      <MarkdownText className="content-truncate flex-1">{text}</MarkdownText>
      <div
        className={cn(
          'mt-1.5 flex h-4 w-8 shrink-0 items-center justify-center rounded-md',
          'bg-theme-500/50 text-xs text-white opacity-50',
        )}
      >
        {count ? <span className="truncate">{count}</span> : <Icon className="size-3" />}
      </div>
    </div>
  );
}

interface TProps {
  className?: string;
}

export function HeadlessComparatorDemo(props: TProps) {
  const { className } = props;
  return (
    <HeadlessComparator<TNewOrOldQuestion>
      className={cn(
        isDev && '__HeadlessComparatorDemo', // DEBUG
        className,
      )}
      items={items}
      RenderItem={RenderItem}
    />
  );
}
