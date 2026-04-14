'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { isDev } from '@/config';

import { TCmpItemBase } from './types';

interface TProps<T extends TCmpItemBase> {
  className?: string;
  itemsCount: number;
  compareMin: number;
  compareMax: number;
  compareTargetId?: T['id'];
}

export function HeadlessEditorDebug<T extends TCmpItemBase>(props: TProps<T>) {
  const { className, itemsCount, compareMin, compareMax, compareTargetId } = props;
  return (
    <div
      className={cn(
        isDev && '__HeadlessEditorDebug', // DEBUG
        'flex flex-wrap gap-2 text-sm opacity-50',
        className,
      )}
    >
      <span className="font-bold">DEBUG:</span>
      <span>
        <span className="opacity-50">count:</span> {itemsCount}
      </span>
      <span>
        <span className="opacity-50">compareMin:</span> {compareMin.toFixed(2)}
      </span>
      <span>
        <span className="opacity-50">compareMax:</span> {compareMax.toFixed(2)}
      </span>
      {!!compareTargetId && (
        <span>
          <span className="opacity-50">compareTargetId:</span> {compareTargetId}
        </span>
      )}
    </div>
  );
}
