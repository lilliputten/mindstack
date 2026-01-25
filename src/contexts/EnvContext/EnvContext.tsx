'use client';

import React from 'react';

import { TEnvServer } from '@/config/envServerSchema';
import { TCurrencyRatios } from '@/features/currencies';

export interface EnvContextType {
  BOT_USERNAME: string;
  // AI limits
  BASIC_USER_GENERATIONS: TEnvServer['BASIC_USER_GENERATIONS'];
  PRO_USER_MONTHLY_GENERATIONS: TEnvServer['PRO_USER_MONTHLY_GENERATIONS'];
  // Core data limits
  BASIC_TOPICS_LIMIT: TEnvServer['BASIC_TOPICS_LIMIT'];
  BASIC_QUESTIONS_LIMIT: TEnvServer['BASIC_QUESTIONS_LIMIT'];
  BASIC_ANSWERS_LIMIT: TEnvServer['BASIC_ANSWERS_LIMIT'];
  PRO_TOPICS_LIMIT: TEnvServer['PRO_TOPICS_LIMIT'];
  PRO_QUESTIONS_LIMIT: TEnvServer['PRO_QUESTIONS_LIMIT'];
  PRO_ANSWERS_LIMIT: TEnvServer['PRO_ANSWERS_LIMIT'];
  PREMIUM_TOPICS_LIMIT: TEnvServer['PREMIUM_TOPICS_LIMIT'];
  PREMIUM_QUESTIONS_LIMIT: TEnvServer['PREMIUM_QUESTIONS_LIMIT'];
  PREMIUM_ANSWERS_LIMIT: TEnvServer['PREMIUM_ANSWERS_LIMIT'];
  // Currencies
  currencyRatios: TCurrencyRatios;
}

const EnvContext = React.createContext<EnvContextType | undefined>(undefined);

export function EnvContextProvider(props: { children: React.ReactNode } & EnvContextType) {
  const { children, ...restProps } = props;
  return <EnvContext.Provider value={restProps}>{children}</EnvContext.Provider>;
}

export function useEnvContext() {
  const context = React.useContext(EnvContext);
  if (!context) {
    throw new Error('useEnvContext must be used within an EnvContextProvider');
  }
  return context;
}
