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
  /** Whether to show the allowed/disallowed status indicator */
  showAllowedStatus?: boolean;
  /** Whether to show used generations count */
  showUsedGenerations?: boolean;
  /** Custom loading skeleton width */
  skeletonWidth?: string;
}

/**
 * Displays AI generations status information in a compact format.
 * Can be used in lists, cards, or any context where generation limits need to be shown.
 */
export function AIGenerationsStatusBadge(props: TProps) {
  const t = useT();
  const {
    className,
    showAllowedStatus = false,
    showUsedGenerations = true,
    skeletonWidth = 'w-3/4',
  } = props;

  const aiGenerationsStatusQuery = useAIGenerationsStatus({
    traceId: 'AIGenerationsStatusBadge',
  });

  const {
    allowed: aiGenerationsAllowed,
    loading: aiGenerationsLoading,
    availableGenerations,
    usedGenerations,
    generationMode,
  } = aiGenerationsStatusQuery;

  if (aiGenerationsLoading) {
    return (
      <span
        className={cn(
          isDev && '__AIGenerationsStatusBadge_Skeleton', // DEBUG
          'inline-block',
          className,
        )}
      >
        <Skeleton className={`h-4 ${skeletonWidth} align-middle`} />
      </span>
    );
  }

  const isUnlimited = availableGenerations === unlimitedGenerations;

  return (
    <span
      className={cn(
        isDev && '__AIGenerationsStatusBadge', // DEBUG
        'inline-flex items-center gap-1',
        className,
      )}
    >
      {/* Allowed Status Indicator */}
      {showAllowedStatus && (
        <>
          {aiGenerationsAllowed ? (
            <Icons.CircleCheck className="size-4 shrink-0 text-green-600 opacity-50" />
          ) : (
            <Icons.Warning className="size-4 shrink-0 text-red-500 opacity-50" />
          )}
        </>
      )}

      {/* Available Generations Text */}
      <span
        className={cn(
          'content-truncate',
          aiGenerationsAllowed ? 'text-green-600' : 'font-semibold text-red-500',
        )}
      >
        {isUnlimited
          ? t('AIGenerationsStatusInfo.UnlimitedAIGenerationsAvailable')
          : t('AIGenerationsStatusInfo.AvailableAIGenerations', {
              availableGenerations: availableGenerations?.toString() || '0',
            })}
      </span>

      {/* Used Generations (only for MONTHLY mode) */}
      {showUsedGenerations &&
        generationMode === 'MONTHLY' &&
        usedGenerations !== undefined &&
        usedGenerations > 0 && (
          <span className="ml-1 opacity-70">
            ({t('AIGenerationsStatusInfo.UsedGenerationsText', { usedGenerations })})
          </span>
        )}
    </span>
  );
}
