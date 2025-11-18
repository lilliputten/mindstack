'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

import { cn } from '@/lib/utils';
import { isDev } from '@/constants';

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      isDev && '__SelectTrigger', // DEBUG
      'flex',
      'h-10',
      'w-full',
      'items-center',
      'justify-between',
      'rounded-md',
      'border',
      'border-input',
      'bg-background/50',
      'px-3',
      'py-2',
      'text-sm',
      'ring-offset-background',
      'placeholder:text-muted-foreground',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-ring',
      'focus:ring-offset-2',
      'disabled:cursor-not-allowed',
      'disabled:opacity-50',
      'transition',
      'active:bg-theme active:text-theme-foreground',
      'hover:bg-theme/20',
      'hover:ring-2 hover:ring-theme-500/50',
      // 'focus:ring-0',
      // 'focus:ring-offset-0',
      // 'focus-visible:outline-none',
      // 'focus-visible:border-2',
      // 'focus-visible:ring-theme/50',
      // 'focus-visible:ring-2',
      // 'focus-visible:ring-offset-2',
      // 'focus:ring-offset-2',
      'data-[state=open]:bg-theme/20',
      'data-[state=open]:ring-2',
      'data-[state=open]:ring-theme/50',
      'data-[state=open]:ring-offset-2',
      '[&>span]:line-clamp-1',
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="size-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      isDev && '__SelectScrollUpButton', // DEBUG
      'flex cursor-default items-center justify-center py-1',
      className,
    )}
    {...props}
  >
    <ChevronUp className="size-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      isDev && '__SelectScrollDownButton', // DEBUG
      'flex cursor-default items-center justify-center py-1',
      className,
    )}
    {...props}
  >
    <ChevronDown className="size-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => {
  /* // Custom container...
   * // Stock container styles:
   * //   position: fixed;
   * //   left: 0px;
   * //   top: 0px;
   * //   transform: translate(10px, 244px);
   * //   min-width: max-content;
   * //   --radix-popper-transform-origin: 100% 0px;
   * //   z-index: 50;
   * //   --radix-popper-available-width: 325px;
   * //   --radix-popper-available-height: 709.5px;
   * //   --radix-popper-anchor-width: 279px;
   * //   --radix-popper-anchor-height: 38px;
   * // Create custom container
   * const [portalContainer, setPortalContainer] = React.useState<HTMLElement | null>(null);
   * React.useEffect(() => {
   *   const container = document.createElement('div');
   *   container.className = cn(isDev && '__SelectPortal');
   *   document.body.appendChild(container);
   *   setPortalContainer(container);
   *   return () => {
   *     if (document.body.contains(container)) {
   *       document.body.removeChild(container);
   *     }
   *   };
   * }, []);
   */
  return (
    <SelectPrimitive.Portal
    // container={portalContainer} // Custom container
    >
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          isDev && '__SelectContent', // DEBUG
          'relative',
          'z-50',
          'max-h-96',
          'min-w-32',
          'max-w-full',
          'overflow-hidden',
          'rounded-md',
          'border',
          'bg-popover',
          'text-popover-foreground',
          'shadow-md',
          'data-[state=open]:animate-in',
          'data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0',
          'data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95',
          'data-[state=open]:zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-2',
          'data-[side=left]:slide-in-from-right-2',
          'data-[side=right]:slide-in-from-left-2',
          'data-[side=top]:slide-in-from-bottom-2',
          position === 'popper' && 'data-[side=bottom]:translate-y-1',
          'data-[side=left]:-translate-x-1',
          'data-[side=right]:translate-x-1',
          'data-[side=top]:-translate-y-1',
          '[&>div]:flex [&>div]:flex-col [&>div]:gap-1',
          className,
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            'p-1',
            position === 'popper' && 'h-[var(--radix-select-trigger-height)]',
            'w-full',
            // 'min-w-[var(--radix-select-trigger-width)]',
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn(
      isDev && '__SelectLabel', // DEBUG
      'py-1.5 pl-8 pr-2 text-sm font-semibold',
      className,
    )}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      isDev && '__SelectItem', // DEBUG
      'relative',
      'flex',
      'w-full',
      'cursor-pointer',
      'select-none',
      'items-center',
      'rounded-sm',
      'py-1.5',
      'pl-8',
      'pr-2',
      'text-sm',
      'outline-none',
      'hover:bg-theme/20 data-[highlighted]:bg-theme/20',
      'data-[state=checked]:bg-theme/10',
      'data-[state=checked]:data-[highlighted]:bg-theme/30',
      'data-[state=checked]:hover:bg-theme/30',
      // 'active:bg-theme active:text-theme-foreground',
      'focus:bg-accent',
      'focus:text-accent-foreground',
      'data-[disabled]:pointer-events-none',
      'data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex size-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="size-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn(
      isDev && '__SelectSeparator', // DEBUG
      '-mx-1 my-1 h-px bg-muted',
      className,
    )}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

const SelectIcon = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Icon>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Icon>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Icon
    ref={ref}
    className={cn(
      isDev && '__SelectIcon', // DEBUG
      '-mx-1 my-1 h-px bg-muted',
      className,
    )}
    {...props}
  />
));
SelectIcon.displayName = SelectPrimitive.Icon.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SelectIcon,
};
