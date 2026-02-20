import { Answer } from '@/generated/prisma';

import { cn } from '@/lib/utils';
import { MarkdownText } from '@/components/ui/MarkdownText';
import { Icons } from '@/components/shared';
import { isDev } from '@/constants';

type TMinimalAnswerShape = Partial<Pick<Answer, 'id' | 'text' | 'isCorrect'>>;

interface TProps {
  className?: string;
  answers?: TMinimalAnswerShape[];
}

export function PreviewAnswers(props: TProps) {
  const { answers, className } = props;
  return (
    <div
      className={cn(
        isDev && '__PreviewAnswers', // DEBUG
        'content-truncate flex flex-col gap-2 text-sm',
        className,
      )}
    >
      {/* Display preview of generated answers */}
      {answers?.map((answer, no) => {
        const {
          id = String(no),
          text = '', // "Answer markdown text",
          isCorrect, // false,
          // questionId, // "cmlgsuq5i0005nvikvocydif7",
          // explanation, // "Explanation markdown text...",
          // isGenerated, // true,
        } = answer;
        const Icon = isCorrect ? Icons.Check : Icons.Dot;
        return (
          <div key={id} className="content-truncate flex gap-2 text-left">
            <div
              className={cn(
                'mt-1.5 flex size-4 shrink-0 items-center justify-center rounded-full',
                isCorrect ? 'bg-green-500' : 'bg-theme-500/50 opacity-20',
              )}
            >
              <Icon className="size-3 text-white" />
            </div>
            <MarkdownText className="content-truncate flex-1">{text}</MarkdownText>
          </div>
        );
      })}
    </div>
  );
}
