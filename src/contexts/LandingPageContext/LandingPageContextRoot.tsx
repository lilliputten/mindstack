import React from 'react';

import { LandingPageContextProvider, TLandingPageContextType } from '@/contexts/LandingPageContext';
import { TCategory } from '@/features/categories/types';
import { TTopic } from '@/features/topics';

type TLandingPageContextRootProps = {
  children: React.ReactNode;
  recentCategories: TCategory[];
  recentTopics: TTopic[];
};
export async function LandingPageContextRoot(props: TLandingPageContextRootProps) {
  const {
    children,
    // Data parameters...
    recentCategories,
    recentTopics,
  } = props;
  const envContextProps: TLandingPageContextType = {
    recentCategories,
    recentTopics,
  };
  return (
    <LandingPageContextProvider {...envContextProps}>
      {/* Other nodes */}
      {children}
    </LandingPageContextProvider>
  );
}
