'use client';

import React from 'react';
import { ExtendedUser } from '@/@types/next-auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { defaultAIGenerationTemperature } from '@/config/env';
import {
  aiClientTypes,
  AiClientTypeSchema,
  defaultAiClientType,
} from '@/lib/ai/types/TAiClientType';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { FormControl, FormField, FormItem, FormMessage, FormProvider } from '@/components/ui/Form';
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
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { AIGenerationsStatusInfo } from '@/features/ai-generations/components';
import {
  maxAnswersToGeneration,
  maxQuestionsToGeneration,
} from '@/features/ai-generations/constants';
import {
  answersGenerationTypes,
  answersGenerationTypeTextIds,
} from '@/features/ai/types/GenerateAnswersTypes';
import {
  generateTopicQuestionsParamsSchema,
  questionsGenerationTypes,
  questionsGenerationTypeTextIds,
} from '@/features/ai/types/GenerateQuestionsTypes';
import { TTopicId } from '@/features/topics/types';

const formSchema = generateTopicQuestionsParamsSchema
  .pick({
    debugData: true,
    questionsGenerationType: true,
    questionsCountMin: true,
    questionsCountMax: true,
    answersGenerationType: true,
    answersCountMin: true,
    answersCountMax: true,
    extraText: true,
  })
  .extend({
    clientType: AiClientTypeSchema.default(defaultAiClientType),
    temperature: z.number().min(0).max(1).default(defaultAIGenerationTemperature),
  });

export type TFormData = z.infer<typeof formSchema>;

export interface TGenerateQuestionsFormProps {
  handleGenerateQuestions: (p: TFormData) => Promise<unknown>;
  handleClose?: () => void;
  className?: string;
  isPending?: boolean;
  topicId: TTopicId;
  user?: ExtendedUser;
  error?: string;
}

export function GenerateQuestionsForm(props: TGenerateQuestionsFormProps) {
  const { className, handleGenerateQuestions, handleClose, isPending, user, error } = props;
  const isAdmin = user?.role === 'ADMIN';
  const t = useT();

  const __useDebugData = isDev || isAdmin;

  const defaultValues: TFormData = React.useMemo(
    () => ({
      debugData: __useDebugData,
      questionsGenerationType: questionsGenerationTypes[0],
      questionsCountMin: isDev ? 1 : 5,
      questionsCountMax: isDev ? 1 : 10,
      answersGenerationType: answersGenerationTypes[0],
      answersCountMin: isDev ? 1 : 2,
      answersCountMax: isDev ? 1 : 6,
      extraText: '',
      clientType: defaultAiClientType,
      temperature: defaultAIGenerationTemperature,
    }),
    [__useDebugData],
  );

  const form = useForm<TFormData>({
    mode: 'onChange',
    criteriaMode: 'all',
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { formState, handleSubmit } = form;
  const { isValid } = formState;
  const isSubmitEnabled = !isPending && isValid;

  const onSubmit = handleSubmit((formData) => {
    handleGenerateQuestions(formData);
  });

  const onClose = (ev: React.MouseEvent) => {
    if (handleClose) {
      handleClose();
    }
    ev.preventDefault();
  };

  const generationTypeKey = React.useId();
  const questionsCountKey = React.useId();
  const answersGenerationTypeKey = React.useId();
  const answersCountKey = React.useId();
  const extraTextKey = React.useId();
  const debugDataKey = React.useId();
  const clientTypeKey = React.useId();
  const temperatureKey = React.useId();

  const Icon = isPending ? Icons.Spinner : Icons.Check;
  const buttonText = isPending
    ? t('GenerateQuestionsForm.GeneratingButtonText')
    : t('GenerateQuestionsForm.GenerateButtonText');

  return (
    <FormProvider {...form}>
      <form
        onSubmit={onSubmit}
        className={cn(isDev && '__GenerateQuestionsForm', 'flex w-full flex-col gap-4', className)}
      >
        {error && (
          <div className="flex items-center gap-1 rounded-md border border-red-500/20 bg-red-500/20 p-3 py-2 text-sm">
            <Icons.Warning className="mr-1 size-4 text-red-500 opacity-50" />
            <span className="text-red-500">{error}</span>
          </div>
        )}
        <AIGenerationsStatusInfo />
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
                  <Switch
                    id={debugDataKey}
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-red-500 data-[state=checked]:hover:bg-red-600"
                  />
                </FormControl>
                <FormHint>{t('GenerateQuestionsForm.DebugDataHint')}</FormHint>
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
              <FormHint>{t('GenerateQuestionsForm.TemperatureHint')}</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <FormItem className="flex w-full flex-col gap-4">
          <Label className="m-0" htmlFor={questionsCountKey}>
            {t('GenerateQuestionsForm.QuestionsCountLabelPrefix')} {form.watch('questionsCountMin')}{' '}
            - {form.watch('questionsCountMax')}
          </Label>
          <FormControl>
            <Slider
              id={questionsCountKey}
              min={1}
              max={maxQuestionsToGeneration}
              step={1}
              value={[form.watch('questionsCountMin'), form.watch('questionsCountMax')]}
              onValueChange={(value) => {
                form.setValue('questionsCountMin', value[0]);
                form.setValue('questionsCountMax', value[1]);
              }}
            />
          </FormControl>
          <FormHint>{t('GenerateQuestionsForm.QuestionsCountHint')}</FormHint>
          <FormMessage />
        </FormItem>
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
        <FormItem className="flex w-full flex-col gap-4">
          <Label className="m-0" htmlFor={answersCountKey}>
            {t('GenerateQuestionsForm.AnswersCountLabelPrefix')} {form.watch('answersCountMin')} -{' '}
            {form.watch('answersCountMax')}
          </Label>
          <FormControl>
            <Slider
              id={answersCountKey}
              min={1}
              max={maxAnswersToGeneration}
              step={1}
              value={[form.watch('answersCountMin'), form.watch('answersCountMax')]}
              onValueChange={(value) => {
                form.setValue('answersCountMin', value[0]);
                form.setValue('answersCountMax', value[1]);
              }}
            />
          </FormControl>
          <FormHint>{t('GenerateQuestionsForm.AnswersCountHint')}</FormHint>
          <FormMessage />
        </FormItem>
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
        <div className="flex w-full gap-4">
          <Button
            type="submit"
            variant={isSubmitEnabled ? 'secondary' : 'disabled'}
            disabled={!isSubmitEnabled}
            className="gap-2"
          >
            <Icon className={cn('size-4', isPending && 'animate-spin')} /> <span>{buttonText}</span>
          </Button>
          <Button variant="ghost" onClick={onClose} className="gap-2">
            <Icons.Close className="hidden size-4 opacity-50 sm:flex" />
            <span>{t('Cancel')}</span>
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
