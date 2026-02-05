import React from 'react';

import { getPeriodDiff, TDateLike, translatedPeriod } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { isDev, minuteMs, secondMs } from '@/constants';

interface TProps {
  className?: string;
  date?: TDateLike;
  timeout?: number;
  dontUpdate?: boolean;
}

function getTimeoutFroDiff(diff: number) {
  if (diff < 5 * secondMs) {
    // Update often for short periods ("now")
    return 300;
  }
  // Update pretty often...
  if (diff < 30 * secondMs) {
    return secondMs + 300;
  }
  if (diff < minuteMs) {
    return 3 * secondMs;
  }
  // Update rarely...
  if (diff < 10 * minuteMs) {
    return 20 * secondMs;
  }
  if (diff < 60 * minuteMs) {
    return 5 * minuteMs;
  }
  // Don't update
  return 0;
}

interface TMemo {
  mounted?: boolean;
  handler?: ReturnType<typeof setTimeout>;
  updateCallback?: () => void;
}

export function ShowTimeSince(props: TProps) {
  const {
    className,
    date,
    // timeout = 15000,
    dontUpdate,
    // minNow = 100000,
  } = props;
  // TODO: Use different timeouts depending on the date age?
  const t = useT();

  const memo = React.useMemo<TMemo>(() => ({}), []);

  const diff = getPeriodDiff(date);
  const dateStr = translatedPeriod(diff, t);
  const [parsedDate, setParsedDate] = React.useState(dateStr);

  memo.updateCallback = React.useCallback(() => {
    if (!dontUpdate && memo.mounted) {
      // Update date string...
      const diff = getPeriodDiff(date);
      const dateStr = translatedPeriod(diff, t);
      setParsedDate(dateStr);
      // Set next handler or clear current...
      const timeout = getTimeoutFroDiff(diff);
      if (timeout && memo.updateCallback) {
        if (memo.handler) {
          clearTimeout(memo.handler);
        }
        memo.handler = setTimeout(memo.updateCallback, timeout);
      } else if (memo.handler) {
        memo.handler = undefined;
      }
    }
  }, [dontUpdate, memo, date, t]);

  React.useLayoutEffect(() => {
    memo.mounted = true;
    if (!dontUpdate && memo.updateCallback) {
      memo.updateCallback();
    }
    return () => {
      if (memo.handler) {
        clearTimeout(memo.handler);
        memo.handler = undefined;
      }
      memo.mounted = false;
    };
  }, [dontUpdate, memo, memo.updateCallback]);

  return (
    <span
      className={cn(
        isDev && '__ShowTimeSince', // DEBUG
        className,
      )}
    >
      {parsedDate}
    </span>
  );
}
