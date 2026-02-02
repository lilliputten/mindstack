'use client';

import React from 'react';

import { defaultAIGenerationTemperature, isDev } from '@/config/env';
import { aiClientTypes } from '@/lib/ai/types/TAiClientType';
import { cn } from '@/lib/utils';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/Form';
import { Label } from '@/components/ui/Label';
import { ScrollArea } from '@/components/ui/ScrollArea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Slider } from '@/components/ui/Slider';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { FormHint } from '@/components/blocks/FormHint';

import { TFormType } from './TextQueryFormDefinitions';

interface TTextQueryFormFieldsProps {
  className?: string;
  form: TFormType;
  // setTopicParamsKey: React.Dispatch<React.SetStateAction<string>>;
}

export function TextQueryFormFields(props: TTextQueryFormFieldsProps) {
  const {
    className,
    form,
    // setTopicParamsKey,
  } = props;

  const clientTypeKey = React.useId();
  const temperatureTypeKey = React.useId();
  const systemQueryTextKey = React.useId();
  const userQueryTextKey = React.useId();
  const showDebugDataKey = React.useId();
  const topicParamsKeyKey = React.useId();

  return (
    <ScrollArea
      className={cn(
        isDev && '__TextQueryFormFields_Scroll', // DEBUG
        // 'flex flex-col',
        className,
      )}
      viewportClassName={cn(
        isDev && '__TextQueryFormFields_ScrollViewport', // DEBUG
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

      <div className="flex gap-6 max-sm:flex-col">
        {/* AI Model */}
        <FormField
          name="clientType"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full flex-1 flex-col gap-4">
              <Label htmlFor={clientTypeKey}>AI Client Type</Label>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id={clientTypeKey} className="flex flex-1">
                    <SelectValue placeholder="Select AI client type…" />
                  </SelectTrigger>
                  <SelectContent>
                    {aiClientTypes.map((id) => (
                      <SelectItem key={id} value={id}>
                        {id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormHint>Select the AI Client Type to use for the query.</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Topic Params Key */}
        <FormField
          control={form.control}
          name="topicParamsKey"
          render={({ field }) => (
            <FormItem className="flex w-full flex-1 flex-col gap-4">
              <Label htmlFor={topicParamsKeyKey}>Topic Parameters</Label>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id={topicParamsKeyKey} className="flex flex-1">
                    <SelectValue placeholder="Select topic parameters..." />
                  </SelectTrigger>
                  <SelectContent>
                    {/* These would be populated with actual topic params keys in the parent component */}
                    <SelectItem value="Dummy">Dummy</SelectItem>
                    <SelectItem value="SpanishLanguage">SpanishLanguage</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormHint>Select the topic parameters to use for the query.</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Temperature */}
        <FormField
          control={form.control}
          name="temperature"
          render={({ field }) => (
            <FormItem className="flex w-full flex-1 flex-col gap-4">
              <Label htmlFor={temperatureTypeKey}>Temperature</Label>
              <div className="flex items-center gap-2">
                <Slider
                  id={temperatureTypeKey}
                  min={0}
                  max={1}
                  step={0.1}
                  value={[field.value ?? defaultAIGenerationTemperature]}
                  onValueChange={(value) => field.onChange(value[0])}
                  className="w-full sm:h-10"
                />
                <span className="w-16 text-right text-sm font-medium">
                  {(field.value ?? defaultAIGenerationTemperature).toFixed(1)}
                </span>
              </div>
              <FormHint>AI generation temperature.</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* System Query Text */}
      <FormField
        name="systemQueryText"
        control={form.control}
        render={({ field }) => (
          <FormItem className="flex w-full flex-col gap-4">
            <Label htmlFor={systemQueryTextKey}>System Query Text</Label>
            <FormControl>
              <Textarea
                id={systemQueryTextKey}
                className="h-32"
                placeholder="Provide the context, personality, and rules for the entire interaction. The system prompt is typically sent only once at the beginning."
                {...field}
              />
            </FormControl>
            <FormHint>
              Sets the context, personality, and rules for the entire interaction. Sent once at the
              beginning.
            </FormHint>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* User Query Text */}
      <FormField
        name="userQueryText"
        control={form.control}
        render={({ field }) => (
          <FormItem className="flex w-full flex-col gap-4">
            <Label htmlFor={userQueryTextKey}>User Query Text</Label>
            <FormControl>
              <Textarea
                id={userQueryTextKey}
                className="h-32"
                placeholder="User placeholder query text"
                {...field}
              />
            </FormControl>
            <FormHint>
              The user's question, command, or statement that requires a response from the AI.
            </FormHint>
            <FormMessage />
          </FormItem>
        )}
      />
    </ScrollArea>
  );
}
