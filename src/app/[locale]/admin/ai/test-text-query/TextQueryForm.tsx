'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageContent } from '@langchain/core/messages';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { getErrorText, truncateString } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { FormProvider } from '@/components/ui/Form';
import { TActionMenuItem } from '@/components/dashboard/DashboardActions';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ShowLogRecords, TLogRecord } from '@/components/debug/ShowLogRecords';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';
import { fetchGigaChatAvailableTokens } from '@/features/ai/actions';
import { sendAiTextQuery } from '@/features/ai/actions/sendAiTextQuery';
import { createGenerateTopicQuestionsMessages } from '@/features/ai/helpers';
import { TGenerateTopicQuestionsParams } from '@/features/ai/types';
import { TPlainMessage } from '@/features/ai/types/messages';
import { getServerInfo } from '@/features/app/helpers/getServerInfo';
import { useMediaQuery } from '@/hooks';

import {
  defaultValues as defaultValuesBase,
  formSchema,
  TFormData,
  TFormType,
} from './TextQueryFormDefinitions';
import { TextQueryFormFields } from './TextQueryFormFields';

const topicParams: Record<string, TGenerateTopicQuestionsParams> = {
  SpanishLanguage: {
    questionsGenerationType: 'MIXED',
    questionsCountMin: 3,
    questionsCountMax: 5,
    answersGenerationType: 'RANDOM',
    answersCountMin: 2,
    answersCountMax: 4,
    topicText: ' Introducción a la Gramática Básica del Español',
    topicDescription:
      'Este tema cubre gramática elemental del español, como conjugaciones de verbos en presente, pronombres personales, artículos, adjetivos y formas básicas de sustantivos.',
    topicKeywords:
      'gramática, conjugaciones, verbos, pronombres, presente, artículos, adjetivos, sustantivos, formas',
    extraText:
      'Las preguntas deben enfocarse en gramática simple: conjugaciones de verbos en presente (ej. ser/estar/tener), uso de pronombres personales (yo/tú/él), artículos (el/la/un/una), concordancia de adjetivos y plurales de sustantivos. Evita preguntas de traducción directa inglés-español o definiciones de palabras aisladas. Haz preguntas sobre completar oraciones, elegir la forma correcta o identificar errores gramaticales básicos.',
    existedQuestions: [
      { text: `¿Cómo se conjuga 'vivir' en futuro para 'ellos'?` },
      { text: `Reemplaza 'a mí' con el pronombre correcto: ______ gusta el español.` },
      { text: `Cambia al plural y concuerda el adjetivo: El gato negro → ______.` },
      { text: `Elige la forma correcta: Ayer ______ (ella / leer) el libro.` },
    ],
    langName: 'Spanish',
    langCode: 'es',
  },
  Dummy: {
    questionsGenerationType: 'BASIC',
    questionsCountMin: 1,
    questionsCountMax: 3,
    answersGenerationType: 'RANDOM',
    answersCountMin: 2,
    answersCountMax: 4,
    topicText: 'Sample Topic',
    extraText: 'No additional instructions',
    topicDescription: 'This is a sample topic for testing purposes',
    topicKeywords: 'sample, testing, dummy',
    existedQuestions: [
      { text: 'Sample existing question?' },
      { text: 'Another existing question?' },
    ],
    langName: 'English',
    langCode: 'en',
  },
};
const topicParamsKeys = Object.keys(topicParams);

export function TextQueryForm() {
  const [_error, setError] = React.useState<string | null>(null);
  const [showForm, toggleForm] = React.useState(true);

  const [topicParamsKey, setTopicParamsKey] = React.useState<string>(topicParamsKeys[0]);

  const [logs, setLogs] = React.useState<TLogRecord[]>([
    /* // DEMO: Sample data
     * {
     *   type: 'data',
     *   title: 'Sample data record',
     *   content: 'Extra long data content text for testing purposes',
     * },
     */
  ]);

  const [systemQueryText, userQueryText] = React.useMemo(
    () => createGenerateTopicQuestionsMessages(topicParams[topicParamsKey]).map((x) => x.content),
    [topicParamsKey],
  );

  const defaultValues = React.useMemo<TFormData>(() => {
    // const [systemQueryText, userQueryText] = createGenerateTopicQuestionsMessages(
    //   topicParams[topicParamsKey],
    // ).map((x) => x.content);
    return {
      // Create new demo default values...
      ...defaultValuesBase,
      systemQueryText,
      userQueryText,
    } satisfies TFormData;
  }, [systemQueryText, userQueryText]);

  const form: TFormType = useForm<TFormData>({
    mode: 'onChange',
    criteriaMode: 'all',
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Update form values when topicParamsKey changes
  React.useEffect(() => {
    // Update form values
    form.setValue('systemQueryText', systemQueryText);
    form.setValue('userQueryText', userQueryText);
    // form.setValue('topicParamsKey', topicParamsKey);
  }, [form, systemQueryText, userQueryText]);

  // const { handleSubmit } = form;

  const [isPending, startTransition] = React.useTransition();
  const [isShowServerInfoRunning, startShowServerInfo] = React.useTransition();
  const [isShowGigaChatBalanceInfoRunning, startShowGigaChatBalanceInfo] = React.useTransition();

  const addLog = React.useCallback((record: TLogRecord) => {
    setLogs((prev) => [...prev, record]);
  }, []);

  const showGigaChatBalanceInfo = React.useCallback(() => {
    startShowGigaChatBalanceInfo(async () => {
      // return await new Promise((r) => setTimeout(r, 3000));
      setError(null);
      addLog({ type: 'info', content: `Fetching GigaChat tokens balance...` });
      try {
        const res = await fetchGigaChatAvailableTokens();
        addLog({ type: 'data', title: 'Response data:', content: res });
        toast.success('Successfully received server info!');
      } catch (error) {
        const errMsg = getErrorText(error);
        // eslint-disable-next-line no-console
        console.error('[TextQueryForm:showGigaChatBalanceInfo]', errMsg, { error });
        debugger; // eslint-disable-line no-debugger
        setError(errMsg);
        toast.error(errMsg);
        addLog({ type: 'error', content: `Error occurred: ${errMsg}` });
      } finally {
        addLog({ type: 'info', content: 'Request complete' });
      }
    });
  }, [addLog]);

  const showServerInfo = React.useCallback(() => {
    startShowServerInfo(async () => {
      // return await new Promise((r) => setTimeout(r, 3000));
      setError(null);
      addLog({ type: 'info', content: `Fetching server info...` });
      try {
        const res = await getServerInfo();
        addLog({ type: 'data', title: 'Response data:', content: res });
        toast.success('Successfully received server info!');
      } catch (error) {
        const errMsg = getErrorText(error);
        // eslint-disable-next-line no-console
        console.error('[TextQueryForm:showServerInfo]', errMsg, { error });
        debugger; // eslint-disable-line no-debugger
        setError(errMsg);
        toast.error(errMsg);
        addLog({ type: 'error', content: `Error occurred: ${errMsg}` });
      } finally {
        addLog({ type: 'info', content: 'Request complete' });
      }
    });
  }, [addLog]);

  const sendQuery = React.useCallback(
    async (formData: TFormData) => {
      const { clientType, temperature, systemQueryText, userQueryText } = formData;
      setError(null);
      const queryInfo = [systemQueryText, userQueryText]
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => `"${s}"`)
        .join(' / ');
      const message = `Submitting query ${truncateString(queryInfo, 50)} to client type ${clientType} with temperature ${temperature}...`;
      addLog({
        type: 'info',
        content: message,
      });
      toast.info(message);
      try {
        const messages: TPlainMessage[] = [
          { role: 'system', content: systemQueryText },
          { role: 'user', content: userQueryText },
        ];
        addLog({ type: 'data', title: 'Retrieving data with messages:', content: messages });
        // DEBUG
        console.log('[TextQueryForm:sendQuery] start', {
          message,
          clientType,
          temperature,
          systemQueryText,
          userQueryText,
          // messages,
          // messagesJson: JSON.stringify(messages, null, 2),
        });
        debugger;
        const queryResult = await sendAiTextQuery(messages, {
          clientType,
          temperature,
          debugData: formData.showDebugData,
        });
        const { content } = queryResult;
        const resultText: MessageContent = content; // `Request ${queryInfo} for clientType ${model} processed successfully -> ${content}`;
        /* console.log('[TextQueryForm:sendQuery] done', {
         *   usage: queryResult.usage_metadata,
         *   resultText,
         *   resultData,
         *   queryResult,
         *   queryResultJson: JSON.stringify(queryResult, null, 2),
         * });
         */
        addLog({ type: 'data', title: 'Data received:', content: queryResult });
        addLog({ type: 'success', title: 'Received response:', content: `${resultText}` });
        toast.success('Received response');
        toggleForm(false);
      } catch (error) {
        const errMsg = getErrorText(error);
        // eslint-disable-next-line no-console
        console.error('[TextQueryForm:sendQuery]', errMsg, { error });
        debugger; // eslint-disable-line no-debugger
        setError(errMsg);
        const message = `Error occurred: ${errMsg}`;
        addLog({ type: 'error', content: message });
        toast.error(message);
      } finally {
        addLog({ type: 'info', content: 'Request complete' });
      }
    },
    [addLog],
  );

  const clearLogs = React.useCallback(() => {
    setLogs([]);
  }, []);

  const { formState, watch } = form;
  const { isValid, isReady } = formState;
  const values = watch();

  const { topicParamsKey: paramsKey } = values;

  React.useEffect(() => {
    if (paramsKey) {
      setTopicParamsKey(paramsKey);
    }
  }, [paramsKey]);

  console.log('XXX', {
    topicParamsKey,
    paramsKey,
    values,
  });

  // Ensure temperature is within valid range
  const temperature = values.temperature ?? 0.1;
  if (temperature < 0 || temperature > 1) {
    toast.error('Temperature must be between 0 and 1');
  }

  const isEmpty = React.useMemo(() => {
    return Object.entries(values)
      .filter(([id]) => id !== 'clientType')
      .every(
        ([_id, value]) =>
          value === '' ||
          value === null ||
          value === undefined ||
          (Array.isArray(value) && value.length === 0),
      );
  }, [values]);

  const { isMobile } = useMediaQuery();

  const isSubmitEnabled = !isPending && !isEmpty && isValid && isReady;
  const hasLogs = !!logs.length;

  const actions: TActionMenuItem[] = React.useMemo(
    () => [
      {
        id: 'Show GigaChat balance',
        content: 'Show GigaChat balance',
        variant: 'theme',
        icon: Icons.DollarSign,
        pending: isShowGigaChatBalanceInfoRunning,
        onClick: showGigaChatBalanceInfo,
        visibleFor: 'xl',
      },
      {
        id: 'Show server info',
        content: 'Show server info',
        variant: 'theme',
        icon: Icons.Check,
        pending: isShowServerInfoRunning,
        onClick: showServerInfo,
        visibleFor: 'xl',
      },
      {
        id: 'Submit',
        content: 'Submit',
        variant: 'theme',
        icon: Icons.Check,
        disabled: !isSubmitEnabled,
        pending: isPending,
        onClick: () =>
          form.handleSubmit((formData) => {
            startTransition(async () => {
              await sendQuery(formData);
            });
          })(),
        visibleFor: 'sm',
      },
      {
        id: 'Toggle view',
        content: showForm ? 'Hide form' : 'Show form',
        variant: 'theme',
        icon: Icons.Eye,
        onClick: () => toggleForm(!showForm),
        visibleFor: 'sm',
      },
      {
        id: 'Clear log',
        content: 'Clear log',
        variant: 'ghost',
        icon: Icons.Close,
        disabled: !hasLogs || isPending,
        onClick: clearLogs,
        visibleFor: 'lg',
      },
    ],
    [
      isShowGigaChatBalanceInfoRunning,
      showGigaChatBalanceInfo,
      isShowServerInfoRunning,
      showServerInfo,
      isSubmitEnabled,
      isPending,
      showForm,
      hasLogs,
      clearLogs,
      form,
      sendQuery,
    ],
  );

  return (
    <>
      <DashboardHeader
        className={cn(
          isDev && '__TextQueryForm_DashboardHeader', // DEBUG
          'mx-6',
        )}
        actions={actions}
      >
        <div className="flex flex-wrap gap-4">
          <h1 className="truncate text-2xl">Test AI Text Query</h1>
          {form.watch('showDebugData') && (
            <Badge variant="destructive" className="flex gap-1 truncate">
              <Icons.FlaskConical className="size-4 opacity-50" />
              <span className="truncate font-bold">DEBUG</span>{' '}
              {/* <span className="truncate opacity-70">The fake local data will be returned</span> */}
            </Badge>
          )}
        </div>
      </DashboardHeader>
      <FormProvider {...form}>
        <div
          className={cn(
            isDev && '__TextQueryForm', // DEBUG
            'flex w-full flex-1 flex-col overflow-hidden',
            isPending && 'pointer-events-none opacity-50',
          )}
        >
          {showForm && (
            <TextQueryFormFields form={form} className="flex-1 shrink-0 overflow-hidden" />
          )}
          {(!showForm || !isMobile) && (
            <ShowLogRecords logs={logs} className={cn('mx-6', showForm && 'max-h-[300px]')} />
          )}
        </div>
      </FormProvider>
    </>
  );
}
