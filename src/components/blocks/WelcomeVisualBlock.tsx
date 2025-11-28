import Image from 'next/image';

import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { SmallWelcomeText } from '@/components/screens/SmallWelcomeText';
import svgArt from '@/assets/arts/bink-bus-single.svg';
// import svgArt from '@/assets/arts/girl-with-a-book.svg';
import logoSvg from '@/assets/logo/logo-on-dark.svg';
import { siteTitle } from '@/config';
import { isDev } from '@/constants';

export function WelcomeVisualBlock(props: TPropsWithClassName) {
  const { className } = props;
  return (
    <div
      className={cn(
        isDev && '__WelcomeVisualBlock_Scroll', // DEBUG
        'flex flex-1 flex-col items-center justify-center',
        className,
      )}
    >
      <div
        className={cn(
          isDev && '__WelcomeVisualBlock', // DEBUG
          'relative w-full px-6',
          'flex flex-1 flex-col items-center justify-center',
        )}
      >
        <Image
          src={svgArt}
          alt="Intro illustration"
          className={cn(
            isDev && '__WelcomeVisualBlock_Art', // DEBUG
            'mx-auto my-6',
            'w-full sm:max-w-md',
            'select-none',
          )}
        />
        <div
          className={cn(
            isDev && '__WelcomeVisualBlock_Logo', // DEBUG
            'absolute right-4 top-4 p-1',
            'flex flex-1 flex-col items-center justify-center',
            'bg-theme-700/70 dark:bg-transparent',
            'rounded-full',
            'select-none',
          )}
        >
          <Image src={logoSvg} className="h-12 w-auto" alt={siteTitle} priority={false} />
        </div>
        <SmallWelcomeText className="p-6 pb-8 pt-0" />
      </div>
    </div>
  );
}
