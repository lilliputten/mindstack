'use client';

import React from 'react';
import { toast } from 'sonner';

import { getServerInfo, sendSetCommandsRequest, sendWebhookStartRequest } from '@/lib/admin/';
import { getErrorText } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { TActionMenuItem } from '@/components/dashboard/DashboardActions';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ShowLogRecords, TLogRecord } from '@/components/debug/ShowLogRecords';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';

const __useDebugData = isDev && true;

export function BotControlPage() {
  const [_error, setError] = React.useState<string | null>(null);
  const [logs, setLogs] = React.useState<TLogRecord[]>([]);

  const addLog = React.useCallback((record: TLogRecord) => {
    setLogs((prev) => [...prev, record]);
  }, []);

  const [isInitWebhookRunning, startInitWebhook] = React.useTransition();
  const [isSetCommandsRunning, startSetCommands] = React.useTransition();
  const [isShowServerInfoRunning, startShowServerInfo] = React.useTransition();

  const isPending = isInitWebhookRunning || isSetCommandsRunning;

  const showServerInfo = React.useCallback(() => {
    startShowServerInfo(async () => {
      // return await new Promise((r) => setTimeout(r, 3000));
      setError(null);
      addLog({ type: 'info', content: `Displaying server info...` });
      try {
        const res = await getServerInfo();
        addLog({ type: 'data', title: 'Response data:', content: res });
        toast.success('Successfully received server info!');
      } catch (error) {
        const errMsg = getErrorText(error);
        // eslint-disable-next-line no-console
        console.error('[BotControlPage:showServerInfo]', errMsg, { error });
        debugger; // eslint-disable-line no-debugger
        setError(errMsg);
        toast.error(errMsg);
        addLog({ type: 'error', content: `Error occurred: ${errMsg}` });
      } finally {
        addLog({ type: 'info', content: 'Request complete' });
      }
    });
  }, [addLog]);

  const initWebhook = React.useCallback(() => {
    startInitWebhook(async () => {
      setError(null);
      addLog({ type: 'info', content: `Initializing bot webhook...` });
      try {
        const res = await sendWebhookStartRequest();
        addLog({ type: 'data', title: 'Response data:', content: res });
        toast.success('Successfully initialized webhook');
      } catch (error) {
        const errMsg = getErrorText(error);
        // eslint-disable-next-line no-console
        console.error('[BotControlPage:initWebhook]', errMsg, { error });
        debugger; // eslint-disable-line no-debugger
        setError(errMsg);
        toast.error(errMsg);
        addLog({ type: 'error', content: `Error occurred: ${errMsg}` });
      } finally {
        addLog({ type: 'info', content: 'Request complete' });
      }
    });
  }, [addLog]);

  const setCommands = React.useCallback(() => {
    startSetCommands(async () => {
      // return await new Promise((r) => setTimeout(r, 3000));
      setError(null);
      addLog({ type: 'info', content: `Setting bot commands...` });
      try {
        const res = await sendSetCommandsRequest();
        addLog({ type: 'data', title: 'Response data:', content: res });
        toast.success('Successfully set bot commands!');
      } catch (error) {
        const errMsg = getErrorText(error);
        // eslint-disable-next-line no-console
        console.error('[BotControlPage:setCommands]', errMsg, { error });
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
      {
        id: 'Initialize webhook',
        content: 'Initialize webhook',
        variant: 'theme',
        icon: Icons.Check,
        pending: isInitWebhookRunning,
        onClick: initWebhook,
        visibleFor: 'lg',
      },
      {
        id: 'Set commands',
        content: 'Set commands',
        variant: 'theme',
        icon: Icons.Check,
        pending: isSetCommandsRunning,
        onClick: setCommands,
        visibleFor: 'lg',
      },
      {
        id: 'Clear log',
        content: 'Clear log',
        variant: 'ghost',
        icon: Icons.Close,
        disabled: !hasLogs || isPending,
        onClick: clearLogs,
        // visibleFor: 'xl',
      },
    ],
    [
      showServerInfo,
      initWebhook,
      setCommands,
      clearLogs,
      isShowServerInfoRunning,
      isInitWebhookRunning,
      isSetCommandsRunning,
      hasLogs,
      isPending,
    ],
  );

  return (
    <>
      <DashboardHeader
        // heading={'Control Telegram Bot'}
        className={cn(
          isDev && '__BotControlPage_DashboardHeader', // DEBUG
          'mx-6',
        )}
        actions={actions}
      >
        <div className="flex flex-wrap gap-4">
          <h1 className="truncate text-2xl">Control Telegram Bot</h1>
          {__useDebugData && (
            <Badge variant="destructive" className="flex gap-2 truncate">
              <Icons.FlaskConical className="size-4 opacity-50" />
              <span className="truncate font-bold">DEBUG MODE</span>{' '}
              <span className="truncate opacity-70">The fake local data will be returned</span>
            </Badge>
          )}
        </div>
      </DashboardHeader>
      <div
        // onSubmit={onSubmit}
        className={cn(
          isDev && '__BotControlPage', // DEBUG
          'flex flex-1 flex-col overflow-hidden',
        )}
      >
        <ShowLogRecords logs={logs} className="mx-6" />
      </div>
    </>
  );
}
