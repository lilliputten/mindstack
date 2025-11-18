'use client';

import * as React from 'react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';

import { cn } from '@/lib/utils';
import { isDev } from '@/constants';

// @see https://www.radix-ui.com/primitives/docs/components/scroll-area

interface ScrollAreaExtraProps {
  viewportClassName?: string;
  saveScrollKey?: string;
  saveScrollHash?: string;
  onScrollEvent?: (ev: Event, node?: HTMLDivElement) => void;
  disableScroll?: boolean;
}
type ComponentType = React.ForwardRefExoticComponent<
  ScrollAreaPrimitive.ScrollAreaProps & React.RefAttributes<HTMLDivElement>
>;

/* Data pack delimiter */
const packDelim = ';';
/** Regex to remove empty final chunks */
const finalDelimsReg = new RegExp(`${packDelim}+$`);
/** Local storage key prefix */
const saveScrollKeyPrefix = 'ScrollArea-';

const ScrollArea = React.forwardRef<
  React.ElementRef<ComponentType>,
  Omit<
    ScrollAreaPrimitive.ScrollAreaProps &
      React.RefAttributes<HTMLDivElement> &
      ScrollAreaExtraProps,
    'ref'
  >
>((props, ref) => {
  const {
    className,
    viewportClassName,
    children,
    saveScrollKey,
    saveScrollHash,
    onScrollEvent,
    disableScroll,
    ...rest
  } = props;
  const scrollRef = React.useRef<HTMLDivElement>(null);
  /**
   * Save scroll positions if `saveScrollKey` and `saveScrollHash` are provided:
   * - `saveScrollKey` used to override values for each instance of `ScrollArea`.
   * - `saveScrollHash` used to override the instance's scroll data if conditions or state have changed.
   * Data save in a packed form: `{saveScrollHash};{scrollTop};{scrollLeft}` (the delimiter is defined above,
   * in the `packDelim` constant, now is semicolon, ";").
   */
  React.useEffect(() => {
    const node = scrollRef.current;
    if (node && saveScrollKey) {
      if (!saveScrollHash || saveScrollHash.includes(packDelim)) {
        throw new Error(`saveScrollHash should be non-empty string without "${packDelim}" symbols`);
      }
      const savedData = sessionStorage.getItem(saveScrollKeyPrefix + saveScrollKey);
      // Restore scroll if data has been saved and saved hash value correspond current hash.
      if (savedData) {
        const unpacked = savedData.split(packDelim);
        const hash = unpacked.shift();
        if (hash === saveScrollHash) {
          const [scrollTop = 0, scrollLeft = 0] = unpacked.map((v) => Number(v) || 0);
          node.scrollTop = scrollTop;
          node.scrollLeft = scrollLeft;
        }
      }
      const handleScroll = (ev: Event) => {
        const { scrollTop, scrollLeft } = node;
        if (!scrollTop && !scrollLeft) {
          sessionStorage.removeItem(saveScrollKeyPrefix + saveScrollKey);
        } else {
          // Save scroll position to restore later.
          const packed = [saveScrollHash, scrollTop, scrollLeft]
            .map((v) => (v ? String(v) : ''))
            .join(packDelim)
            .replace(finalDelimsReg, '');
          sessionStorage.setItem(saveScrollKeyPrefix + saveScrollKey, packed);
        }
        if (onScrollEvent) {
          onScrollEvent(ev, node);
        }
      };
      node.addEventListener('scroll', handleScroll);
      return () => {
        node.removeEventListener('scroll', handleScroll);
      };
    }
  }, [scrollRef, saveScrollKey, saveScrollHash, onScrollEvent]);
  if (disableScroll) {
    return (
      <div
        ref={ref}
        className={cn(
          isDev && '__ScrollArea_Root_DISABLED', // DEBUG
          'relative flex flex-col overflow-hidden',
          className,
        )}
        {...rest}
      >
        <div
          ref={scrollRef}
          className={cn(
            isDev && '__ScrollArea_Viewport_DISABLED', // DEBUG
            viewportClassName,
            'size-full rounded-[inherit]',
          )}
        >
          <div
            ref={scrollRef}
            className={cn(
              isDev && '__ScrollArea_Inset_DISABLED', // DEBUG
              'flex',
            )}
          >
            {children}
          </div>
        </div>
      </div>
    );
  }
  return (
    <ScrollAreaPrimitive.Root
      ref={ref}
      className={cn(
        isDev && '__ScrollArea_Root', // DEBUG
        'relative flex flex-col overflow-hidden',
        className,
      )}
      {...rest}
    >
      <ScrollAreaPrimitive.Viewport
        ref={scrollRef}
        className={cn(
          isDev && '__ScrollArea_Viewport', // DEBUG
          viewportClassName,
          'size-full rounded-[inherit]',
          '[&>div]:!flex', // XXX ??? Try to make inner page scrollable?
        )}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
});
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = 'vertical', ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      'flex touch-none select-none transition-colors',
      orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent p-px',
      orientation === 'horizontal' && 'h-2.5 flex-col border-t border-t-transparent p-px',
      className,
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
