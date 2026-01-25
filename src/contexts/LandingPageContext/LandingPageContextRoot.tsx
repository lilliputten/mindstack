import React from 'react';

import { LandingPageContextProvider, TLandingPageContextType } from '@/contexts/LandingPageContext';
import { TCategory } from '@/features/categories/types';

type TLandingPageContextRootProps = {
  children: React.ReactNode;
  recentCategories: TCategory[];
};
export async function LandingPageContextRoot(props: TLandingPageContextRootProps) {
  const { children, recentCategories } = props;
  const envContextProps: TLandingPageContextType = {
    recentCategories,
  };
  return (
    <LandingPageContextProvider {...envContextProps}>
      {/* Other nodes */}
      {children}
    </LandingPageContextProvider>
  );
}
