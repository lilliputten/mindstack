'use client';

import React from 'react';

import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Skeleton } from '@/components/ui/Skeleton';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';

import { useAIGenerationsStatus } from '../query-hooks/useAIGenerationsStatus';
import { unlimitedGenerations } from '../types/TAIGenerationsStatus';

interface TProps extends TPropsWithClassName {
  /** Whether to show the detailed breakdown section */
  showDetails?: boolean;
  /** Whether to show user grade and role information */
  showUserInfo?: boolean;
  /** Whether to show generation mode */
  showGenerationMode?: boolean;
}

/**
 * Displays comprehensive AI generations status information including:
 * - Overall status (allowed/disallowed)
 * - Available and used generation counts
 * - Generation mode (TOTAL/MONTHLY)
 * - User grade and role
 * - Reason code if access is denied
 */
export function AIGenerationsDetails(props: TProps) {
  const t = useT();
  const { className, showDetails = true, showUserInfo = true, showGenerationMode = true } = props;

  const aiGenerationsStatusQuery = useAIGenerationsStatus({
    traceId: 'AIGenerationsDetails',
  });

  const {
    allowed: aiGenerationsAllowed,
    loading: aiGenerationsLoading,
    availableGenerations,
    usedGenerations,
    generationMode,
    role,
    grade,
    // reasonCode,
  } = aiGenerationsStatusQuery;

  // Loading state
  if (aiGenerationsLoading) {
    return (
      <div
        className={cn(
          isDev && '__AIGenerationsDetails_Skeleton', // DEBUG
          'flex flex-col gap-2',
          className,
        )}
      >
        <Skeleton className="h-6 w-full" />
        {showDetails && (
          <>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </>
        )}
      </div>
    );
  }

  const isUnlimited = availableGenerations === unlimitedGenerations;
  const hasUsedGenerations = !!usedGenerations && usedGenerations > 0;

  const details = [
    // Generation Mode
    showDetails && showGenerationMode && generationMode && (
      <li key="GenerationMode" data-testid="GenerationMode">
        <span className="flex items-center">
          <Icons.Settings className="size-4 shrink-0" />
          <span>{t('GenerationMode')}:</span>
        </span>
        <span className="font-medium capitalize">{generationMode.toLowerCase()}</span>
      </li>
    ),
    // User Grade
    showDetails && showUserInfo && grade && (
      <li key="UserGrade" data-testid="UserGrade">
        <span className="flex items-center">
          <Icons.Shield className="size-4 shrink-0" />
          <span>{t('UserGrade')}:</span>
        </span>
        <span className="font-medium capitalize">{grade.toLowerCase()}</span>
      </li>
    ),
    // User Role
    showDetails && showUserInfo && role && (
      <li key="UserRole" data-testid="UserRole">
        <span className="flex items-center">
          <Icons.User className="size-4 shrink-0" />
          <span>{t('UserRole')}:</span>
        </span>
        <span className="font-medium capitalize">{role.toLowerCase()}</span>
      </li>
    ),
  ].filter(Boolean);

  const items = [
    // Header: Main Status
    <li key="aiGenerationsAllowed" data-testid="aiGenerationsAllowed">
      {aiGenerationsAllowed ? (
        <span className="text-green-500">
          {t('AIGenerationsStatusInfo.AIGenerationAvailable')}.
        </span>
      ) : (
        <span className="text-red-500">
          {t('AIGenerationsStatusInfo.AIGenerationNotAvailable')}.
        </span>
      )}
    </li>,
    // Main Info: Available Generations
    !!grade && grade !== 'GUEST' && (
      <li key="aiGenerationsAllowed" data-testid="aiGenerationsAllowed">
        {isUnlimited
          ? t('AIGenerationsStatusInfo.UnlimitedAIGenerationsAvailable')
          : t('AIGenerationsStatusInfo.AvailableAIGenerations', {
              availableGenerations: availableGenerations?.toString() || '0',
            })}
        .
      </li>
    ),
    // Used Generations
    !!hasUsedGenerations && (
      <li key="hasUsedGenerations" data-testid="hasUsedGenerations">
        <span>{t('AIGenerationsStatusInfo.UsedGenerationsText', { usedGenerations })}</span>.
      </li>
    ),

    // Detailed Breakdown
    ...details,
  ].filter(Boolean);

  return (
    <div
      className={cn(
        isDev && '__AIGenerationsDetails', // DEBUG
        className,
      )}
    >
      <p>{t('AIGenerationsStatusInfo.AiGenerationDetails')}:</p>
      <ul className="list-disc space-y-1 pl-5">{items}</ul>
    </div>
  );
}
