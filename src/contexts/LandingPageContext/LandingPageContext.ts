import { createContext, useContext } from 'react';

import { TCategory } from '@/features/categories/types';

export interface LandingPageContextType {
  recentCategories: TCategory[];
}

export const LandingPageContext = createContext<LandingPageContextType>({
  recentCategories: [],
});

export const useLandingPageContext = () => useContext(LandingPageContext);
