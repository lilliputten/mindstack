// Using client side in order to regenerate save scroll hash on each app open
'use client';

import { getRandomHashString } from '@/lib/helpers/strings';
import { TPropsWithChildrenAndClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { MaxWidthWrapper } from '@/components/shared/MaxWidthWrapper';
import { TLayoutType, UseScrollableLayout } from '@/components/shared/ScrollableLayout';
import { isDev } from '@/constants';

const saveScrollHash = getRandomHashString();

interface TPageWrapperProps extends TPropsWithChildrenAndClassName {
  id?: string;
  innerClassName?: string;
  scrollable?: boolean;
  limitWidth?: boolean;
  padded?: boolean;
  xPadded?: boolean;
  vPadded?: boolean;
  layoutType?: TLayoutType;
}

export function PageWrapper(props: TPageWrapperProps) {
  const {
    id,
    className,
    children,
    scrollable,
    limitWidth,
    padded,
    xPadded,
    vPadded,
    layoutType = 'clippable',
    innerClassName,
  } = props;

  let content = children;

  content = (
    <div
      className={cn(
        isDev && '__PageWrapper_InnerWrapper', // DEBUG
        'flex flex-1 flex-col',
        !scrollable && 'overflow-hidden',
        innerClassName,
      )}
    >
      {content}
    </div>
  );

  if (scrollable) {
    content = (
      <ScrollArea
        saveScrollKey={id}
        saveScrollHash={saveScrollHash}
        className={cn(
          isDev && '__PageWrapper_Scroll', // DEBUG
          'items-center',
          'layout-scrollable',
        )}
        viewportClassName={cn(
          isDev && '__PageWrapper_Viewport', // DEBUG
          'flex-1 flex flex-col',
          '[&>div]:!flex [&>div]:flex-1',
        )}
      >
        {content}
      </ScrollArea>
    );
  }

  if (limitWidth) {
    content = (
      <MaxWidthWrapper
        className={cn(
          isDev && '__PageWrapper_Wrapper', // DEBUG
          'layout-follow m-auto flex flex-1 flex-col',
        )}
      >
        {content}
      </MaxWidthWrapper>
    );
  }

  return (
    <div
      data-page-id={id}
      className={cn(
        isDev && '__PageWrapper', // DEBUG
        'single-child flex flex-1 flex-col items-center overflow-hidden',
        (padded || xPadded) && 'mx-6',
        (padded || vPadded) && 'my-6',
        className,
      )}
    >
      <UseScrollableLayout type={layoutType} />
      {content}
    </div>
  );
}
