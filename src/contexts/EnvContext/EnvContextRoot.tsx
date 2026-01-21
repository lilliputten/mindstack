import React from 'react';

import { EnvContextProvider, EnvContextType } from '@/contexts/EnvContext';

import '@/styles/globals.scss';
import '@/styles/root.scss';

import {
  BASIC_ANSWERS_LIMIT,
  BASIC_QUESTIONS_LIMIT,
  BASIC_TOPICS_LIMIT,
  BASIC_USER_GENERATIONS,
  BOT_USERNAME,
  PREMIUM_ANSWERS_LIMIT,
  PREMIUM_QUESTIONS_LIMIT,
  PREMIUM_TOPICS_LIMIT,
  PRO_ANSWERS_LIMIT,
  PRO_QUESTIONS_LIMIT,
  PRO_TOPICS_LIMIT,
  PRO_USER_MONTHLY_GENERATIONS,
} from '@/config/envServer';
import { getAllCurrencyRatios } from '@/features/currencies';

const TOPICS_LIMIT = {
  GUEST: 0,
  BASIC: BASIC_TOPICS_LIMIT,
  PRO: PRO_TOPICS_LIMIT,
  PREMIUM: PREMIUM_TOPICS_LIMIT,
} as const;

const QUESTIONS_LIMIT = {
  GUEST: 0,
  BASIC: BASIC_QUESTIONS_LIMIT,
  PRO: PRO_QUESTIONS_LIMIT,
  PREMIUM: PREMIUM_QUESTIONS_LIMIT,
} as const;

const ANSWERS_LIMIT = {
  GUEST: 0,
  BASIC: BASIC_ANSWERS_LIMIT,
  PRO: PRO_ANSWERS_LIMIT,
  PREMIUM: PREMIUM_ANSWERS_LIMIT,
} as const;

type TEnvContextRootProps = {
  children: React.ReactNode;
};

export async function EnvContextRoot(props: TEnvContextRootProps) {
  const { children } = props;
  const currencyRatios = await getAllCurrencyRatios();
  const envContextProps: EnvContextType = {
    BOT_USERNAME,
    BASIC_USER_GENERATIONS,
    PRO_USER_MONTHLY_GENERATIONS,
    BASIC_TOPICS_LIMIT: TOPICS_LIMIT.BASIC,
    BASIC_QUESTIONS_LIMIT: QUESTIONS_LIMIT.BASIC,
    BASIC_ANSWERS_LIMIT: ANSWERS_LIMIT.BASIC,
    PRO_TOPICS_LIMIT: TOPICS_LIMIT.PRO,
    PRO_QUESTIONS_LIMIT: QUESTIONS_LIMIT.PRO,
    PRO_ANSWERS_LIMIT: ANSWERS_LIMIT.PRO,
    PREMIUM_TOPICS_LIMIT: TOPICS_LIMIT.PREMIUM,
    PREMIUM_QUESTIONS_LIMIT: QUESTIONS_LIMIT.PREMIUM,
    PREMIUM_ANSWERS_LIMIT: ANSWERS_LIMIT.PREMIUM,
    currencyRatios,
  };
  return (
    <EnvContextProvider {...envContextProps}>
      {/* Other nodes */}
      {children}
    </EnvContextProvider>
  );
}
