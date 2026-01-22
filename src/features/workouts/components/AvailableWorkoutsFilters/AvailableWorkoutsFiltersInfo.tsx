'use client';

import React from 'react';

import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { TFiltersData } from '@/features/workouts/contexts/WorkoutsFiltersContext';
import { getFiltersLabelValueString } from '@/features/workouts/contexts/WorkoutsFiltersContext/WorkoutsFiltersHelpers';

interface TProps extends TPropsWithClassName {
  filtersData: TFiltersData;
}

export function AvailableWorkoutsFiltersInfo(props: TProps) {
  const { className, filtersData } = props;
  const t = useT('AvailableWorkoutsFilterTexts');

  const filtersString = React.useMemo(
    () => getFiltersLabelValueString(filtersData, t),
    [filtersData, t],
  );

  if (!filtersString) {
    return null;
  }

  return <span className={cn('text-sm text-muted-foreground', className)}>{filtersString}</span>;
}
