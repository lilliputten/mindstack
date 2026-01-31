'use client';

import React from 'react';
import { RichTranslationValues } from 'next-intl';

import { cn } from '@/lib/utils';
import { Link, useT } from '@/i18n';
import { CurrencySigns } from '@/components/currencies';
import { contactsAliasRoute, isDev, pricingAliasRoute } from '@/config';
import { stringifyPrice, TCurrencyType } from '@/features/currencies';
import { TGradeComparisonResult } from '@/features/payments/helpers';

interface TPriceTextProps {
  comparisonResult?: TGradeComparisonResult;
  price: number | string;
  className?: string;
  localeCurrency: TCurrencyType;
}

export function PriceText(props: TPriceTextProps) {
  const { className, localeCurrency, comparisonResult, price } = props;
  const t = useT();

  const isTg = localeCurrency === 'TGSTAR';
  const CurrencySign = CurrencySigns[localeCurrency];
  // const localePrice = prices?.[localeCurrency];

  const isDowngrade = comparisonResult?.type === 'downgrade';

  const richProps = React.useMemo<RichTranslationValues>(
    () => ({
      PricingLink: (chunks) => <Link href={pricingAliasRoute}>{chunks}</Link>,
      ContactsLink: (chunks) => <Link href={contactsAliasRoute}>{chunks}</Link>,
      strong: (chunks) => <strong>{chunks}</strong>,
      currentGrade: comparisonResult?.currentGrade,
      requestedGrade: comparisonResult?.requestedGrade,
    }),
    [comparisonResult?.currentGrade, comparisonResult?.requestedGrade],
  );

  if (isDowngrade) {
    return t.rich('PricingChoosePage.ContactSupportForDowngrade', richProps);
  }

  const currencyBlock = <CurrencySign className={cn(isTg && 'size-4')} />;

  return (
    <span
      className={cn(
        isDev && '__PriceText', // DEBUG
        'flex items-baseline gap-x-1',
        className,
      )}
    >
      <span className="flex items-baseline gap-x-1">
        <span className="flex items-center gap-x-0.5">
          {currencyBlock}
          <span>{typeof price === 'number' ? stringifyPrice(price) : price}</span>
        </span>
      </span>
    </span>
  );
}
