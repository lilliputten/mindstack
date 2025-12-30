import React from 'react';

import { EnvContextProvider, EnvContextType } from '@/contexts/EnvContext';

import '@/styles/globals.scss';
import '@/styles/root.scss';

import {
  BASIC_USER_GENERATIONS,
  BOT_USERNAME,
  PRO_USER_MONTHLY_GENERATIONS,
} from '@/config/envServer';
import { getAllCurrencyRatios } from '@/features/currencies';

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
    currencyRatios,
  };
  return (
    <EnvContextProvider {...envContextProps}>
      {/* Other nodes */}
      {children}
    </EnvContextProvider>
  );
}
