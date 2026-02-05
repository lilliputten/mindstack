'use client';

import React from 'react';

import { TCategory } from '@/features/categories/types';
import { TTopic } from '@/features/topics';

export interface TLandingPageContextType {
  recentCategories: TCategory[];
  recentTopics: TTopic[];
}

export const LandingPageContext = React.createContext<TLandingPageContextType>({
  recentCategories: [],
  recentTopics: [],
});

export function LandingPageContextProvider(
  props: { children: React.ReactNode } & TLandingPageContextType,
) {
  const { children, ...restProps } = props;
  return (
    <LandingPageContext.Provider value={restProps}>
      {/* Content tree */}
      {children}
    </LandingPageContext.Provider>
  );
}

export function useLandingPageContext() {
  const context = React.useContext(LandingPageContext);
  if (!context) {
    throw new Error('useLandingPageContext must be used within an LandingPageContextProvider');
  }
  return context;
}
