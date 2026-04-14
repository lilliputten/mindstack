'use client';

import React from 'react';

import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Link } from '@/i18n/routing';
import { Skeleton } from '@/components/ui/Skeleton';
import { InfoFrame } from '@/components/shared';
import * as Icons from '@/components/shared/Icons';
import { PageError } from '@/components/shared/PageError';
import { welcomeAliasRoute } from '@/config';
import { isDev } from '@/constants';

import { useAIGenerationsStatus } from '../query-hooks/useAIGenerationsStatus';
import { unlimitedGenerations } from '../types/TAIGenerationsStatus';

interface TProps extends TPropsWithClassName {
  noFrame?: boolean;
}

export function AIGenerationsStatusInfo(props: TProps) {
  const t = useT();
  const { className, noFrame } = props;

  const aiGenerationsStatusQuery = useAIGenerationsStatus({ traceId: 'AIGenerationsStatusInfo' });

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
    <InfoFrame
      noFrame={noFrame}
      className={cn(
        isDev && '__AIGenerationsStatusInfo', // DEBUG
        className,
      )}
    >
      {/* Available Generations */}
      {isUnlimited ? (
        <span className="content-truncate flex items-center gap-1 text-green-600">
          <Icons.CircleCheck className="mr-1 inline size-4 shrink-0 opacity-50" />
          <span className="content-truncate">
            {t('AIGenerationsStatusInfo.UnlimitedAIGenerationsAvailable')}
          </span>
        </span>
      ) : allowed ? (
        <span className="content-truncate inline text-green-600">
          <Icons.CircleCheck className="mr-1 inline size-4 shrink-0 opacity-50" />
          <span className="content-truncate">
            {t('AIGenerationsStatusInfo.AvailableAIGenerations', { availableGenerations })}
          </span>
        </span>
      ) : (
        <span className="content-truncate inline gap-1">
          <Icons.Warning className="mr-1 inline size-4 shrink-0 text-red-500 opacity-50" />
          <span className="content-truncate">
            <span className="content-truncate font-semibold text-red-500">
              {t('AIGenerationsStatusInfo.NoAIGenerationsAvailable')}
            </span>{' '}
            {t('Please')}{' '}
            <Link
              href={welcomeAliasRoute}
              className="content-truncate text-theme-500 hover:underline"
            >
              {t('AIGenerationsStatusInfo.CheckYourUsagePlan')}
            </Link>
            .
          </span>
        </span>
      )}

      {/* Used Generations */}
      {!!usedGenerations && (
        <span className="inline" title={t('UsedGenerations')}>
          <Icons.LineChart className="mr-1 inline size-4 shrink-0 opacity-50" />
          {t('AIGenerationsStatusInfo.UsedGenerationsText', { usedGenerations })}
        </span>
      )}

      {/* // UNUSED: Other possible details
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
    </InfoFrame>
  );
}
