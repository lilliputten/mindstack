import React from 'react';
import { UseFormReturn } from 'react-hook-form';

import { ErrorLike } from '@/lib/errors';

import { TFiltersData } from './TopicsFiltersTypes';

export type TApplyFiltersData = TFiltersData;

export interface TopicsFiltersContextData {
  // State
  isInited: boolean;
  isPending: boolean;
  isExpanded: boolean;
  onDefaults: boolean;
  error?: ErrorLike;
  filtersData?: TFiltersData;
  defaultFiltersData?: TFiltersData;

  // Form
  form: UseFormReturn<TFiltersData>;
  isReady: boolean;
  isSubmitEnabled: boolean;

  // Actions
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  toggleFilters: () => void;
  expandFilters: () => void;
  hideFilters: () => void;
  handleApplyButton: (filtersData: TFiltersData) => void;
  handleResetToDefaults: () => void;
  handleClearChanges: () => void;
}

export interface TopicsFiltersProviderProps {
  children: React.ReactNode;
  applyFilters: (applyFiltersData: TApplyFiltersData) => Promise<unknown> | void;
  augmentDefaults?: Partial<TFiltersData>;
  storeId?: string;
}
