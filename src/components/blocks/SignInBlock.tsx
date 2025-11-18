import { useTheme } from 'next-themes';

import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { SignInForm, SignInFormHeader } from '@/components/forms/SignInForm';
import { isDev } from '@/constants';

export function SignInBlock(props: TPropsWithClassName) {
  const { className } = props;
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  return (
    <div
      className={cn(
        isDev && '__SignInBlock', // DEBUG
        'm-auto w-full max-w-md',
        'flex flex-1 flex-col items-center justify-center',
        className,
      )}
    >
      <div
        className={cn(
          isDev && '__SignInBlock_Header', // DEBUG
          'flex',
          'flex-col',
          'items-center',
          'justify-center',
          'space-y-3',
          'px-6',
          'py-6',
          'pt-8',
          'md:px-16',
        )}
      >
        <SignInFormHeader dark={isDark} inBody />
      </div>
      <div
        className={cn(
          isDev && '__SignInBlock_Form', // DEBUG
          'flex',
          'flex-col',
          'space-y-4',
          'px-6',
          'py-6',
          'md:px-16',
        )}
      >
        <SignInForm inBody />
      </div>
    </div>
  );
}
