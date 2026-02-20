import React from 'react';

import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/shared';
import { TCurrencyType } from '@/features/currencies';

type TSymbolItem = ({ className }: TPropsWithClassName) => React.JSX.Element;

export const currencyNames: Record<TCurrencyType, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  RUB: 'Рубль',
  TGSTAR: 'Telegram Star',
};

export const currencySignsStr: Record<TCurrencyType, string> = {
  USD: '$',
  EUR: '€',
  RUB: '₽',
  TGSTAR: 'TgStar',
};

const CurrencySignByStr = ({
  currency,
  className,
}: {
  currency: TCurrencyType;
  className?: string;
}) => <span className={className}>{currencySignsStr[currency]}</span>;

export const CurrencySigns: Record<TCurrencyType, TSymbolItem> = {
  USD: ({ className }: TPropsWithClassName) => (
    <CurrencySignByStr currency="USD" className={className} />
  ),
  EUR: ({ className }: TPropsWithClassName) => (
    <CurrencySignByStr currency="EUR" className={className} />
  ),
  RUB: ({ className }: TPropsWithClassName) => (
    <CurrencySignByStr currency="RUB" className={className} />
  ),
  TGSTAR: ({ className }: TPropsWithClassName) => (
    <Icons.TgStar className={cn('inline text-amber-300', className)} />
  ),
};
