'use client';

import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';
import { z } from 'zod';

import { cn } from '@/lib/utils';
import { isDev } from '@/config';

export const threeStateSchema = z.union([z.literal(null), z.literal(true), z.literal(false)]);

// export type TThreeState = null | true | false;
export type TThreeState = z.infer<typeof threeStateSchema>;

interface ThreeStateFieldProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>,
    'value' | 'onValueChange'
  > {
  value?: TThreeState;
  onValueChange?: (value: TThreeState) => void;
  trueText?: string;
  falseText?: string;
  nullText?: string;
}

export const ThreeStateField = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  ThreeStateFieldProps
>((props, ref) => {
  const { className, value, onValueChange, trueText, falseText, nullText, ...restProps } = props;

  const handleValueChange = (value: string) => {
    if (onValueChange) {
      const resolvedValue: TThreeState = value === 'true' ? true : value === 'false' ? false : null;
      onValueChange(resolvedValue);
    }
  };

  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      className={cn(
        isDev && '__ThreeStateField', // DEBUG
        'flex flex-wrap gap-2 gap-y-1',
        className,
      )}
      value={value?.toString() ?? 'null'}
      onValueChange={handleValueChange}
      {...restProps}
    >
      <label className="flex cursor-pointer items-center gap-2 pe-2">
        <RadioGroupPrimitive.Item
          className="size-4 rounded-full border border-input ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value="null"
        >
          <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
            <Circle className="size-2.5 fill-theme text-theme" />
          </RadioGroupPrimitive.Indicator>
        </RadioGroupPrimitive.Item>
        <span className="text-sm">{nullText || 'Undefined'}</span>
      </label>
      <label className="flex cursor-pointer items-center gap-2 pe-2">
        <RadioGroupPrimitive.Item
          className="size-4 rounded-full border border-input ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value="true"
        >
          <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
            <Circle className="size-2.5 fill-theme text-theme" />
          </RadioGroupPrimitive.Indicator>
        </RadioGroupPrimitive.Item>
        <span className="text-sm">{trueText || 'True'}</span>
      </label>
      <label className="flex cursor-pointer items-center gap-2 pe-2">
        <RadioGroupPrimitive.Item
          className="size-4 rounded-full border border-input ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value="false"
        >
          <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
            <Circle className="size-2.5 fill-theme text-theme" />
          </RadioGroupPrimitive.Indicator>
        </RadioGroupPrimitive.Item>
        <span className="text-sm">{falseText || 'False'}</span>
      </label>
    </RadioGroupPrimitive.Root>
  );
});
ThreeStateField.displayName = 'ThreeStateField';
