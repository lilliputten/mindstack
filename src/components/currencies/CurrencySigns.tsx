import React from 'react';

import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import * as Icons from '@/components/shared/Icons';
import { TCurrencyType } from '@/features/currencies';

type TSymbolItem = ({ className }: TPropsWithClassName) => React.JSX.Element;

export const CurrencySigns: Record<TCurrencyType, TSymbolItem> = {
  USD: ({ className }: TPropsWithClassName) => <span className={className}>$</span>,
  EUR: ({ className }: TPropsWithClassName) => <span className={className}>€</span>,
  RUB: ({ className }: TPropsWithClassName) => <span className={className}>₽</span>,
  TGSTAR: ({ className }: TPropsWithClassName) => (
    <Icons.TgStar className={cn('inline text-amber-300', className)} />
  ),
};
