'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageContent } from '@langchain/core/messages';
import { useForm } from 'react-hook-form';

import { getErrorText, truncateString } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { FormProvider } from '@/components/ui/Form';
import { TActionMenuItem } from '@/components/dashboard/DashboardActions';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ShowLogRecords, TLogRecord } from '@/components/debug/ShowLogRecords';
import { Check, Close, Eye, FlaskConical } from '@/components/shared/Icons';
import { isDev } from '@/config';
import { sendAiTextQuery } from '@/features/ai/actions/sendAiTextQuery';
import { TPlainMessage } from '@/features/ai/types/messages';
import { useMediaQuery } from '@/hooks';

import { defaultValues, formSchema, TFormData, TFormType } from './TextQueryFormDefinitions';
import { TextQueryFormFields } from './TextQueryFormFields';

export function TextQueryForm() {
  const [_error, setError] = React.useState<string | null>(null);
  const [showForm, toggleForm] = React.useState(true);

  const [logs, setLogs] = React.useState<TLogRecord[]>([
    /* // DEMO: Sample data
     * {
     *   type: 'data',
     *   title: 'Sample data record',
     *   content: 'Extra long data content text for testing purposes',
     * },
     */
  ]);

  const form: TFormType = useForm<TFormData>({
    mode: 'onChange',
    criteriaMode: 'all',
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // const { handleSubmit } = form;

  const [isPending, startTransition] = React.useTransition();

  const addLog = React.useCallback((record: TLogRecord) => {
    setLogs((prev) => [...prev, record]);
  }, []);

  const sendQuery = React.useCallback(
    async (formData: TFormData) => {
      const { clientType, systemQueryText, userQueryText } = formData;
      setError(null);
      const queryInfo = [systemQueryText, userQueryText]
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => `"${s}"`)
        .join(' / ');
      addLog({
        type: 'info',
        content: `Submitting query ${truncateString(queryInfo, 50)} to client type ${clientType}...`,
      });
      try {
        const messages: TPlainMessage[] = [
          { role: 'system', content: systemQueryText },
          { role: 'user', content: userQueryText },
        ];
        addLog({ type: 'data', title: 'Retrieving data with messages:', content: messages });
        /* // DEBUG
         * console.log('[TextQueryForm:sendQuery] start', {
         *   messages,
         *   messagesJson: JSON.stringify(messages, null, 2),
         * });
         */
        const queryResult = await sendAiTextQuery(messages, {
          clientType,
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
        toggleForm(false);
      } catch (error) {
        const errMsg = getErrorText(error);
        // eslint-disable-next-line no-console
        console.error('[TextQueryForm:sendQuery]', errMsg, { error });
        debugger; // eslint-disable-line no-debugger
        setError(errMsg);
        addLog({ type: 'error', content: `Error occurred: ${errMsg}` });
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
        id: 'Submit',
        content: 'Submit',
        variant: 'theme',
        icon: Check,
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
        icon: Eye,
        onClick: () => toggleForm(!showForm),
        visibleFor: 'sm',
      },
      {
        id: 'Clear log',
        content: 'Clear log',
        variant: 'ghost',
        icon: Close,
        disabled: !hasLogs || isPending,
        onClick: clearLogs,
        visibleFor: 'lg',
      },
    ],
    [
      isPending,
      isSubmitEnabled,
      showForm,
      hasLogs,
      form,
      startTransition,
      sendQuery,
      toggleForm,
      clearLogs,
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
              <FlaskConical className="size-4 opacity-50" />
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
