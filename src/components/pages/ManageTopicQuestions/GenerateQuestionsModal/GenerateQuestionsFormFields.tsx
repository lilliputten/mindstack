'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';

import { aiClientTypes } from '@/lib/ai/types/TAiClientType';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/Form';
import { Label } from '@/components/ui/Label';
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
import { FormColumns, FormSection } from '@/components/shared';
import { isDev } from '@/constants';
import {
  maxAnswersToGeneration,
  maxQuestionsToGeneration,
} from '@/features/ai-generations/constants';
import {
  answersGenerationTypes,
  answersGenerationTypeTextIds,
} from '@/features/ai/types/GenerateAnswersTypes';
import {
  questionsGenerationTypes,
  questionsGenerationTypeTextIds,
} from '@/features/ai/types/GenerateQuestionsTypes';
import { useSessionData } from '@/hooks';

import { TFormData } from './types';

export interface TGenerateQuestionsFormFieldsProps {
  form: UseFormReturn<TFormData>;
  className?: string;
}

export function GenerateQuestionsFormFields(props: TGenerateQuestionsFormFieldsProps) {
  const { form, className } = props;

  const { user } = useSessionData();
  const isAdmin = user?.role === 'ADMIN';
  const t = useT();

  const __useDebugData = isDev || isAdmin;

  const generationTypeKey = React.useId();
  const questionsCountKey = React.useId();
  const answersGenerationTypeKey = React.useId();
  const answersCountKey = React.useId();
  const extraTextKey = React.useId();
  const debugDataKey = React.useId();
  const clientTypeKey = React.useId();
  const temperatureKey = React.useId();

  const { questionsCountMin, questionsCountMax, answersCountMin, answersCountMax } = form.watch();

  return (
    <FormColumns
      className={cn(
        isDev && '__GenerateQuestionsFormFields', // DEBUG
        className,
      )}
    >
      <FormSection>
        {__useDebugData && (
          <FormField
            name="debugData"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-4">
                <Label className="m-0" htmlFor={debugDataKey}>
                  {t('GenerateQuestionsForm.UseDebugDataLabel')}
                </Label>
                <FormControl>
                  <div className="flex w-full items-center gap-2">
                    <Switch
                      id={debugDataKey}
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-red-500 data-[state=checked]:hover:bg-red-600"
                    />
                    <FormHint>{t('GenerateQuestionsForm.DebugDataHint')}</FormHint>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {/* AI Client Type */}
        <FormField
          name="clientType"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-4">
              <Label className="m-0" htmlFor={clientTypeKey}>
                {t('AiClientTypeLabel')}
              </Label>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id={clientTypeKey}>
                    <SelectValue placeholder={t('AiClientTypeLabel')} />
                  </SelectTrigger>
                  <SelectContent>
                    {aiClientTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormHint>{t('AiClientTypeHint')}</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Temperature */}
        <FormField
          name="temperature"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-4">
              <Label className="m-0 flex gap-2" htmlFor={temperatureKey}>
                <span className="truncate">{t('AiGenerationTemperature')}</span>
                <span className="text-normal opacity-50">({field.value.toFixed(1)})</span>
              </Label>
              <FormControl>
                <Slider
                  id={temperatureKey}
                  min={0}
                  max={1}
                  step={0.1}
                  value={[field.value]}
                  onValueChange={(value) => field.onChange(value[0])}
                />
              </FormControl>
              <FormHint>{t('AiGenerationTemperatureHint')}</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* extraText */}
        <FormField
          name="extraText"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-4">
              <Label className="m-0" htmlFor={extraTextKey}>
                {t('GenerateQuestionsForm.ExtraInstructionsLabel')}
              </Label>
              <FormControl>
                <Textarea
                  id={extraTextKey}
                  className="flex-1"
                  placeholder={t('GenerateQuestionsForm.ExtraInstructionsPlaceholder')}
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormHint>{t('GenerateQuestionsForm.ExtraInstructionsHint')}</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>
      <FormSection>
        {/* questionsGenerationType */}
        <FormField
          name="questionsGenerationType"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-4">
              <Label className="m-0" htmlFor={generationTypeKey}>
                {t('GenerateQuestionsForm.GenerationTypeLabel')}
              </Label>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id={generationTypeKey}>
                    <SelectValue
                      placeholder={t('GenerateQuestionsForm.GenerationTypePlaceholder')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {questionsGenerationTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(questionsGenerationTypeTextIds[type])}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormHint>{t('GenerateQuestionsForm.GenerationTypeHint')}</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* questionsCountKey */}
        <FormItem className="flex w-full flex-col gap-4">
          <Label className="m-0" htmlFor={questionsCountKey}>
            {t('GenerateQuestionsForm.QuestionsCountLabelPrefix')}{' '}
            {questionsCountMin === questionsCountMax
              ? questionsCountMin
              : `${questionsCountMin}-${questionsCountMax}`}
          </Label>
          <FormControl>
            <Slider
              id={questionsCountKey}
              min={1}
              max={maxQuestionsToGeneration}
              step={1}
              value={[questionsCountMin, questionsCountMax]}
              onValueChange={(value) => {
                form.setValue('questionsCountMin', value[0]);
                form.setValue('questionsCountMax', value[1]);
              }}
            />
          </FormControl>
          <FormHint>{t('GenerateQuestionsForm.QuestionsCountHint')}</FormHint>
          <FormMessage />
        </FormItem>
        {/* answersGenerationType */}
        <FormField
          name="answersGenerationType"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-4">
              <Label className="m-0" htmlFor={answersGenerationTypeKey}>
                {t('GenerateQuestionsForm.AnswersGenerationTypeLabel')}
              </Label>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id={answersGenerationTypeKey}>
                    <SelectValue
                      placeholder={t('GenerateQuestionsForm.AnswersGenerationTypePlaceholder')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {answersGenerationTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(answersGenerationTypeTextIds[type])}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormHint>{t('GenerateQuestionsForm.AnswersGenerationTypeHint')}</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* answersCount */}
        <FormItem className="flex w-full flex-col gap-4">
          <Label className="m-0" htmlFor={answersCountKey}>
            {t('GenerateQuestionsForm.AnswersCountLabelPrefix')}{' '}
            {answersCountMin === answersCountMax
              ? answersCountMin
              : `${answersCountMin}-${answersCountMax}`}
          </Label>
          <FormControl>
            <Slider
              id={answersCountKey}
              min={1}
              max={maxAnswersToGeneration}
              step={1}
              value={[answersCountMin, answersCountMax]}
              onValueChange={(value) => {
                form.setValue('answersCountMin', value[0]);
                form.setValue('answersCountMax', value[1]);
              }}
            />
          </FormControl>
          <FormHint>{t('GenerateQuestionsForm.AnswersCountHint')}</FormHint>
          <FormMessage />
        </FormItem>
      </FormSection>
    </FormColumns>
  );
}
