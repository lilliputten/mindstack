import Image from 'next/image';

import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { SmallWelcomeText } from '@/components/screens/SmallWelcomeText';
import svgArt from '@/assets/arts/girl-with-a-book.svg';
import { isDev } from '@/constants';

import { ScrollArea } from '../ui/ScrollArea';

export function WelcomeVisualBlock(props: TPropsWithClassName) {
  const { className } = props;
  return (
    <ScrollArea
      className={cn(
        isDev && '__WelcomeVisualBlock_Scroll', // DEBUG
      )}
    >
      <div
        className={cn(
          isDev && '__WelcomeVisualBlock', // DEBUG
          className,
          'm-6 gap-4',
          'flex flex-1 flex-col',
          'items-center justify-center',
        )}
      >
        <Image
          src={svgArt}
          alt="Intro illustration"
          className={cn(
            isDev && '__WelcomeVisualBlock_Art', // DEBUG
            'mx-auto mt-4',
            'w-full sm:max-w-md',
          )}
        />
        {/* // XXX: Alternate layout: the art as a background
      <div
        className={cn(
          isDev && '__WelcomeVisualBlock_Art', // DEBUG
          'bg-contain',
          'bg-center',
          'bg-no-repeat',
        )}
        style={{
          // minHeight: '40vw',
          minHeight: '50vh',
          backgroundImage: 'url(/static/arts/login-blue.svg)',
        }}
      />
      */}
        <SmallWelcomeText />
      </div>
    </ScrollArea>
  );
}
