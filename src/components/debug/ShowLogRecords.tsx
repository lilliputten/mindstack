'use client';

import React from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { isDev } from '@/config';

type TLogType = 'info' | 'error' | 'success' | 'data' | 'imageData';

export type TLogRecord = {
  type: TLogType;
  title?: string;
  content: unknown;
};

const logStyles: Partial<Record<TLogType, string>> = {
  error: 'font-medium text-red-600',
  success: 'text-green-700',
  info: 'whitespace-pre-wrap text-gray-400',
  data: 'text-gray-600',
};

function JsonContent({ content }: { content: unknown }) {
  return <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(content, null, 2)}</pre>;
}

function ImageContent({ content }: { content: string }) {
  const base64Encoded = btoa(content);
  const src = 'data:image/jpeg;base64,' + base64Encoded;

  const openInNewWindow = () => {
    if (typeof window !== 'object') {
      return;
    }
    // Convert base64 to blob for better browser support
    const byteCharacters = atob(base64Encoded);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  };

  return (
    <div className="relative h-[400px] rounded-lg bg-black/10">
      <Image
        className="cursor-pointer overflow-hidden rounded-md object-contain p-4 transition hover:opacity-80"
        onClick={openInNewWindow}
        src={src}
        alt="Image"
        fill
      />
    </div>
  );
}

function UnknownContent({ content }: { content: unknown }) {
  const result =
    typeof content === 'string' || React.isValidElement(content) ? (
      <div className="whitespace-pre-wrap text-sm">{content}</div>
    ) : (
      <JsonContent content={content} />
    );
  return result;
}

function LogContent({ log }: { log: TLogRecord }) {
  const { type, content } = log;
  if (type === 'imageData') {
    return <ImageContent content={String(content)} />;
  }
  if (type === 'data') {
    return <JsonContent content={content} />;
  }
  return <UnknownContent content={content} />;
}

interface TShowLogRecordsProps {
  logs: TLogRecord[];
  className?: string;
}

export function ShowLogRecords(props: TShowLogRecordsProps) {
  const { logs, className } = props;
  const reversedLogs = [...logs].reverse();
  return (
    <div
      className={cn(
        isDev && '__ShowLogRecords', // DEBUG
        'flex flex-col gap-4 overflow-hidden rounded-md border border-gray-500/10 py-4',
        className,
      )}
    >
      <h2 className="flex px-4">
        <span className="flex-1 text-lg font-semibold">Operation Log</span>{' '}
        <span className="text-sm opacity-30">(reversed)</span>
      </h2>
      {!!reversedLogs.length && (
        <ScrollArea
          className={cn(
            isDev && '__ShowLogRecords_Scroll', // DEBUG
            // 'flex flex-col gap-4',
          )}
          viewportClassName={cn(
            isDev && '__ShowLogRecords_ScrollViewport', // DEBUG
            '[&>div]:!flex [&>div]:flex-col [&>div]:gap-4 [&>div]:flex-1 [&>div]:px-4',
          )}
        >
          {reversedLogs.map((log, i) => {
            const { type, title } = log;
            const result = <LogContent log={log} />;
            return (
              <div
                className={cn(
                  isDev && '__ShowLogRecords_Item', // DEBUG
                  'flex flex-col gap-2',
                  logStyles[type],
                )}
                key={i}
              >
                {title && <h3 className="font-semibold">{title}</h3>}
                {result}
              </div>
            );
          })}
        </ScrollArea>
      )}
    </div>
  );
}
