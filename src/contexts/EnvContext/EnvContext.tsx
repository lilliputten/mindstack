'use client';

import React from 'react';

import { TEnvServer } from '@/config/envServerSchema';
import { TCurrencyRatios } from '@/features/currencies';

export interface EnvContextType {
  BOT_USERNAME: string;
  BASIC_USER_GENERATIONS: TEnvServer['BASIC_USER_GENERATIONS'];
  PRO_USER_MONTHLY_GENERATIONS: TEnvServer['PRO_USER_MONTHLY_GENERATIONS'];
  currencyRatios: TCurrencyRatios;
}

const EnvContext = React.createContext<EnvContextType | undefined>(undefined);

export function EnvContextProvider(props: { children: React.ReactNode } & EnvContextType) {
  const { children, ...restProps } = props;
  return <EnvContext.Provider value={restProps}>{children}</EnvContext.Provider>;
}

export function useEnvConext() {
  const context = React.useContext(EnvContext);
  if (!context) {
    throw new Error('useEnvContext must be used within an EnvContextProvider');
  }
  return context;
}
