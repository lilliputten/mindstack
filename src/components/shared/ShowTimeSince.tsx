import React from 'react';

import { TDateLike, translatedPeriod } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { isDev } from '@/constants';

interface TProps {
  className?: string;
  date?: TDateLike;
  timeout?: number;
}
export function ShowTimeSince(props: TProps) {
  const { className, date, timeout = 15000 } = props;
  // TODO: Use different timeouts depending on the date age?
  const t = useT();
  const [parsedDate, setParsedDate] = React.useState(translatedPeriod(date, t));
  React.useLayoutEffect(() => {
    let isMounted = true;
    let handler: ReturnType<typeof setInterval> | undefined;
    if (date && timeout) {
      handler = setInterval(() => {
        if (isMounted) {
          setParsedDate(translatedPeriod(date, t));
        }
      }, timeout);
    }
    return () => {
      isMounted = false;
      if (handler) {
        clearInterval(handler);
        handler = undefined;
      }
    };
  }, [date, timeout, t]);
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
