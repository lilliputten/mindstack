'use client';

import React from 'react';

import { WorkoutsFiltersContextProvider } from '@/features/workouts/contexts/WorkoutsFiltersContext';

import { AvailableWorkoutsListPage } from './AvailableWorkoutsListPage';

interface TAvailableWorkoutsListWrapperProps {
  params?: { locale: string };
}

export function AvailableWorkoutsListWrapper(_props: TAvailableWorkoutsListWrapperProps) {
  // TODO: Handle modals etc
  return (
    <WorkoutsFiltersContextProvider storageKey="available-workouts-filters">
      <AvailableWorkoutsListPage />
    </WorkoutsFiltersContextProvider>
  );
}
