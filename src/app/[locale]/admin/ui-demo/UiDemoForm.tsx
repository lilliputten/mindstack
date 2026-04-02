'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { getErrorText } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { FormProvider } from '@/components/ui/Form';
import { TActionMenuItem } from '@/components/dashboard/DashboardActions';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ShowLogRecords, TLogRecord } from '@/components/debug/ShowLogRecords';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';
// import { HeadlessAnswersEditorDemo } from '@/entities/HeadlessEditor/demo/HeadlessAnswersEditorDemo';
// import { HeadlessQuestionsEditorDemo } from '@/entities/HeadlessEditor/demo/HeadlessQuestionsEditorDemo';
import { getServerInfo } from '@/features/app/helpers/getServerInfo';
import { QuestionsEditorDemo } from '@/features/questions/components/QuestionsEditor/QuestionsEditorDemo';
import { TTopicId } from '@/features/topics';
import { useMediaQuery } from '@/hooks';

import {
  defaultValues as defaultValuesBase,
  formSchema,
  TFormData,
  TFormType,
} from './UiDemoFormDefinitions';
import { UiDemoFormFields } from './UiDemoFormFields';

interface TProps {
  topicId?: TTopicId;
}

export function UiDemoForm(props: TProps) {
  const { topicId } = props;
  const [_error, setError] = React.useState<string | null>(null);
  const [showForm, toggleForm] = React.useState(false);

  const [logs, setLogs] = React.useState<TLogRecord[]>([
    /* // DEMO: Sample log data
     * {
     *   type: 'data',
     *   title: 'Sample data record',
     *   content: 'Extra long data content text for testing purposes',
     * },
     */
  ]);

  const defaultValues = React.useMemo<TFormData>(() => {
    return {
      // Create new demo default values...
      ...defaultValuesBase,
    } satisfies TFormData;
  }, []);

  const form: TFormType = useForm<TFormData>({
    mode: 'onChange',
    criteriaMode: 'all',
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const [isPending, _startTransition] = React.useTransition();
  const [isShowServerInfoRunning, startShowServerInfo] = React.useTransition();

  const addLog = React.useCallback((record: TLogRecord) => {
    setLogs((prev) => [...prev, record]);
  }, []);

  const showServerInfo = React.useCallback(() => {
    startShowServerInfo(async () => {
      // return await new Promise((r) => setTimeout(r, 3000)); // DEBUG
      setError(null);
      addLog({ type: 'info', content: `Fetching server info...` });
      try {
        const res = await getServerInfo();
        addLog({ type: 'data', title: 'Response data:', content: res });
        toast.success('Successfully received server info!');
      } catch (error) {
        const errMsg = getErrorText(error);
        // eslint-disable-next-line no-console
        console.error('[UiDemoForm:showServerInfo]', errMsg, { error });
        debugger; // eslint-disable-line no-debugger
        setError(errMsg);
        toast.error(errMsg);
        addLog({ type: 'error', content: `Error occurred: ${errMsg}` });
      } finally {
        addLog({ type: 'info', content: 'Request complete' });
      }
    });
  }, [addLog]);

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
          // value === '' ||
          value == null || (Array.isArray(value) && value.length === 0),
      );
  }, [values]);

  const { isMobile } = useMediaQuery();

  const _isSubmitEnabled = !isPending && !isEmpty && isValid && isReady;
  const hasLogs = !!logs.length;

  const actions: TActionMenuItem[] = React.useMemo(
    () => [
      {
        id: 'Show server info',
        content: 'Show server info',
        variant: 'theme',
        icon: Icons.Check,
        pending: isShowServerInfoRunning,
        onClick: showServerInfo,
        visibleFor: 'xl',
      },
      /* // TODO: Submit button
       * {
       *   id: 'Submit',
       *   content: 'Submit',
       *   variant: 'theme',
       *   icon: Icons.Check,
       *   disabled: !isSubmitEnabled,
       *   pending: isPending,
       *   onClick: () =>
       *     form.handleSubmit((formData) => {
       *       startTransition(async () => {
       *         // Do action
       *         console.log('[UiDemoForm:Submit]', {
       *           formData,
       *         });
       *         debugger;
       *       });
       *     })(),
       *   visibleFor: 'sm',
       * },
       */
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
      // form,
      // isSubmitEnabled,
      clearLogs,
      hasLogs,
      isPending,
      isShowServerInfoRunning,
      showForm,
      showServerInfo,
    ],
  );

  return (
    <>
      <DashboardHeader
        className={cn(
          isDev && '__UiDemoForm_DashboardHeader', // DEBUG
          'mx-6',
        )}
        actions={actions}
      >
        <div className="flex flex-wrap gap-4">
          <h1 className="truncate text-2xl">UI Demo</h1>
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
            isDev && '__UiDemoForm', // DEBUG
            'flex w-full flex-1 flex-col gap-6 overflow-hidden',
            isPending && 'pointer-events-none opacity-50',
          )}
        >
          {showForm && <UiDemoFormFields form={form} className="shrink-0 overflow-hidden" />}
          <div
            className={cn(
              isDev && '__UiDemoForm_UiDemoBlock', // DEBUG
              'mx-6 flex flex-1 flex-col overflow-hidden py-6',
              'rounded-md border border-dashed border-theme-500/20',
            )}
          >
            {/*
            <HeadlessQuestionsEditorDemo className="overflow-hidden" />
            */}
            <QuestionsEditorDemo topicId={topicId} />
          </div>
          {(!showForm || !isMobile) && (
            <ShowLogRecords logs={logs} className={cn('mx-6', showForm && 'max-h-[300px]')} />
          )}
        </div>
      </FormProvider>
    </>
  );
}
