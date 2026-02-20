'use client';

import React from 'react';

import { isDev } from '@/config/env';
import { cn } from '@/lib/utils';
import { FormControl, FormField, FormItem } from '@/components/ui/Form';
import { Label } from '@/components/ui/Label';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Switch } from '@/components/ui/Switch';
import { FormHint } from '@/components/blocks/FormHint';

import { TFormType } from './UiDemoFormDefinitions';

interface TUiDemoFormFieldsProps {
  className?: string;
  form: TFormType;
}

export function UiDemoFormFields(props: TUiDemoFormFieldsProps) {
  const { className, form } = props;

  const showDebugDataKey = React.useId();

  return (
    <ScrollArea
      className={cn(
        isDev && '__UiDemoFormFields_Scroll', // DEBUG
        // 'flex flex-col',
        className,
      )}
      viewportClassName={cn(
        isDev && '__UiDemoFormFields_ScrollViewport', // DEBUG
        'px-6 [&>div]:!flex [&>div]:flex-col [&>div]:gap-4 [&>div]:flex-1',
      )}
    >
      {/* Show Debug Data */}
      <FormField
        control={form.control}
        name="showDebugData"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <Label htmlFor={showDebugDataKey}>Show debug data</Label>
              <FormHint>
                When enabled, the system will return fake local data instead of making a real API
                call.
              </FormHint>
            </div>
            <FormControl>
              <Switch
                id={showDebugDataKey}
                checked={field.value}
                className="data-[state=checked]:bg-red-500"
                onCheckedChange={field.onChange}
                aria-label="Toggle show debug data"
              />
            </FormControl>
          </FormItem>
        )}
      />
    </ScrollArea>
  );
}
