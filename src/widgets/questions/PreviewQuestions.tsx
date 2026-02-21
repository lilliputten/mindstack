import { cn } from '@/lib/utils';
import { MarkdownText } from '@/components/ui/MarkdownText';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { TAvailableQuestion } from '@/features/questions/types';

interface TMinimalQuestionShape
  extends Partial<Pick<TAvailableQuestion, 'id' | 'text' | '_count'>> {
  answers?: unknown[]; // Just to count answers
}

interface TProps {
  className?: string;
  questions?: TMinimalQuestionShape[];
}

export function PreviewQuestions(props: TProps) {
  const { questions, className } = props;
  return (
    <div
      className={cn(
        isDev && '__PreviewQuestions', // DEBUG
        'content-truncate flex flex-col gap-2 text-sm',
        className,
      )}
    >
      {/* Display preview of generated questions */}
      {questions?.map((question, no) => {
        const {
          id = String(no),
          text = '', // "Question markdown text",
          _count,
          answers,
        } = question;
        const Icon = Icons.Dot;
        const count = answers?.length || _count?.answers;
        return (
          <div key={id} className="content-truncate flex gap-2 text-left">
            <div
              className={cn(
                'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full',
                'bg-theme-500/50 opacity-20',
              )}
            >
              <Icon className="size-3 text-white" />
            </div>
            <MarkdownText className="content-truncate flex-1">{text}</MarkdownText>
            <div
              className={cn(
                'mt-0.5 flex h-4 w-8 shrink-0 items-center justify-center rounded-md',
                'bg-theme-500/50 text-xs text-white opacity-50',
              )}
            >
              {count ? <span className="truncate">{count}</span> : <Icon className="size-3" />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
