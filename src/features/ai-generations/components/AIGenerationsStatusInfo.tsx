'use client';

import React from 'react';

import { welcomeRoute } from '@/config/routesConfig';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import * as Icons from '@/components/shared/Icons';
import { PageError } from '@/components/shared/PageError';
import { isDev } from '@/constants';
import { useT } from '@/i18n';
import { Link } from '@/i18n/routing';

import { useAIGenerationsStatus } from '../query-hooks/useAIGenerationsStatus';
import { unlimitedGenerations } from '../types/TAIGenerationsStatus';

interface TProps extends TPropsWithClassName {
  noFrame?: boolean;
}

export function AIGenerationsStatusInfo(props: TProps) {
  const t = useT();
  const { className, noFrame } = props;
  const showFrame = !noFrame;

  const aiGenerationsStatusQuery = useAIGenerationsStatus();

  const {
    // Core properties...
    availableGenerations, // number;
    usedGenerations, // number;
    // generationMode, // TGenerationMode;
    // role, // UserRoleType;
    // grade, // UserGradeType;
    // reasonCode, // TAIGenerationErrorCode;
    // Calculated properties...
    allowed, // boolean
    loading, // boolean
    error, // possible error
  } = aiGenerationsStatusQuery;

  if (loading) {
    return (
      <div
        className={cn(
          isDev && '__AIGenerationsStatusInfo_Skeleton', // DEBUG
          'flex flex-col',
          className,
        )}
      >
        <Skeleton className="h-10" />
      </div>
    );
  }

  if (error) {
    return (
      <PageError
        className={cn(
          isDev && '__AIGenerationsStatusInfo_Error', // DEBUG
          className,
        )}
        error={error || 'Unknown error'}
        padded={false}
        border={false}
      />
    );
  }

  const isUnlimited = availableGenerations === unlimitedGenerations;

  return (
    <div
      className={cn(
        isDev && '__AIGenerationsStatusInfo', // DEBUG
        'flex',
        'flex-wrap',
        'items-center',
        'gap-4',
        'gap-y-1',
        'rounded-md',
        showFrame && 'border',
        showFrame && 'border-theme-600/5',
        showFrame && 'bg-theme-600/5',
        showFrame && 'p-3',
        showFrame && 'py-2',
        'text-sm',
        // 'opacity-50',
        className,
      )}
    >
      {/* Available Generations */}
      {isUnlimited ? (
        <span className={cn('flex items-center gap-1 text-green-600')}>
          <Icons.CircleCheck className="mr-1 size-4 opacity-50" />
          <span>{t('AIGenerationsStatusInfo.UnlimitedAIGenerationsAvailable')}</span>
        </span>
      ) : allowed ? (
        <span className={cn('flex items-center gap-1 text-green-600')}>
          <Icons.CircleCheck className="mr-1 size-4 opacity-50" />
          <span>
            {t('AIGenerationsStatusInfo.AvailableAIGenerations', { availableGenerations })}
          </span>
        </span>
      ) : (
        <span className={cn('flex items-center gap-1')}>
          <Icons.Warning className="mr-1 size-4 text-red-500 opacity-50" />
          <span>
            <span className="font-semibold text-red-500">
              {t('AIGenerationsStatusInfo.NoAIGenerationsAvailable')}
            </span>{' '}
            Please{' '}
            <Link href={welcomeRoute} className="text-theme-500 hover:underline">
              {t('AIGenerationsStatusInfo.CheckYourUsagePlan')}
            </Link>
            .
          </span>
        </span>
      )}

      {/* Used Generations */}
      {!!usedGenerations && (
        <span className="flex items-center gap-1" title={t('UsedGenerations')}>
          <Icons.LineChart className="mr-1 size-4 opacity-50" />
          {t('AIGenerationsStatusInfo.UsedGenerationsText', { usedGenerations })}
        </span>
      )}

      {/*
      <span className="flex items-center gap-1" title="Generation mode">
        <Icons.Settings className="mr-1 size-4 opacity-50" />
        Mode: {generationMode}
      </span>
      <span className="flex items-center gap-1" title="User role">
        <Icons.User className="mr-1 size-4 opacity-50" />
        Role: {role}
      </span>
      <span className="flex items-center gap-1" title="User grade">
        <Icons.Shield className="mr-1 size-4 opacity-50" />
        Grade: {grade}
      </span>
      {reasonCode && (
        <span className="flex items-center gap-1" title="Reason code">
          <Icons.Warning className="mr-1 size-4 opacity-50" />
          Reason: {reasonCode}
        </span>
      )}
      <span className="flex items-center gap-1" title="Allowed to generate">
        <Icons.Shield className="mr-1 size-4 opacity-50" />
        Allowed: {allowed ? 'Yes' : 'No'}
      </span>
      */}
    </div>
  );
}
