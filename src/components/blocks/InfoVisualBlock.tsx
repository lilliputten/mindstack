import Image from 'next/image';

import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
// import svgArt from '@/assets/arts/girl-with-a-book.svg';
import { isDev } from '@/constants';

export function InfoVisualBlock(props: TPropsWithClassName) {
  const { className } = props;
  const t = useT();
  return (
    <div
      className={cn(
        isDev && '__InfoVisualBlock', // DEBUG
        className,
        // 'm-4',
        'gap-4',
        'flex flex-col',
        'items-stretch',
        'justify-center',
        'w-full',
        'max-w-xl',
      )}
    >
      <div
        className={cn(
          isDev && '__InfoVisualBlock_ImageContainer', // DEBUG
          'relative w-full overflow-hidden rounded-lg',
          'aspect-video',
        )}
      >
        <Image
          src="/static/landing/features/14.jpg"
          alt={t('Landing.HeroSection.Title')}
          fill
          className="object-cover"
          priority
        />
      </div>
      {/*
      <Image
        // priority
        src={svgArt}
        alt="Data illustration"
        className={cn(
          isDev && '__InfoVisualBlock_Art', // DEBUG
          'mx-auto mt-4',
          'sm:max-w-lg',
        )}
      />
      <div
        className={cn(
          isDev && '__InfoVisualBlock:Art', // DEBUG
          className,
          'flex flex-col',
          'items-center',
          'justify-center',
          'bg-contain',
          'bg-center',
          'bg-no-repeat',
          // 'min-h-40',
        )}
        style={{
          minHeight: '30vh',
          backgroundImage: 'url(/static/arts/data-blue.svg)',
        }}
      />
      <div
        className={cn(
          isDev && '__InfoVisualBlock:Content', // DEBUG
          className,
          'flex flex-col',
          'items-center',
          'justify-center',
        )}
      >
        Info Info Block
      </div>
      */}
    </div>
  );
}
