'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/ScrollArea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';
import { useT } from '@/i18n';

interface ComparisonFeature {
  name: string;
  basic: string | boolean;
  pro: string | boolean;
  premium: string | boolean;
  future?: boolean;
  // unlimited: string | boolean;
}

const useDarkHeader = true;

export function PricingComparisonTable() {
  const t = useT();

  const features: ComparisonFeature[] = React.useMemo(
    () => [
      {
        name: t('Pricing.Comparison.Topics'),
        basic: '5',
        pro: t('Pricing.Unlimited'),
        premium: t('Pricing.Unlimited'),
        // unlimited: t('Pricing.Unlimited'),
      },
      {
        name: t('Pricing.Comparison.AiGenerations'),
        basic: '10 ' + t('Pricing.Comparison.Total'),
        pro: '100 ' + t('Pricing.Comparison.PerMonth'),
        premium: t('Pricing.Unlimited'),
        // unlimited: t('Pricing.Unlimited'),
      },
      {
        name: t('Pricing.Comparison.WorkoutSessions'),
        basic: true,
        pro: true,
        premium: true,
        // unlimited: true,
      },
      {
        name: t('Pricing.Comparison.ProgressTracking'),
        basic: true,
        pro: true,
        premium: true,
        // unlimited: true,
      },
      {
        name: t('Pricing.Comparison.CommunityAccess'),
        basic: true,
        pro: true,
        premium: true,
        future: true,
        // unlimited: true,
      },
      {
        name: t('Pricing.Comparison.Analytics'),
        basic: false,
        pro: true,
        premium: true,
        future: true,
        // unlimited: true,
      },
      {
        name: t('Pricing.Comparison.PrioritySupport'),
        basic: false,
        pro: true,
        premium: true,
        future: true,
        // unlimited: true,
      },
      {
        name: t('Pricing.Comparison.ExportImport'),
        basic: false,
        pro: false,
        premium: true,
        future: true,
        // unlimited: true,
      },
      {
        name: t('Pricing.Comparison.EnterpriseSecurity'),
        basic: false,
        pro: false,
        premium: false,
        future: true,
        // unlimited: true,
      },
    ],
    [t],
  );

  const renderCell = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Icons.Check className="inline size-4 text-theme" />
      ) : (
        <span className="text-muted-foreground opacity-20">—</span>
      );
    }
    return <span className="text-sm">{value}</span>;
  };

  return (
    <section
      className={cn(
        isDev && '__PricingComparisonTable', // DEBUG
        'mb-6 mt-2',
      )}
    >
      <ScrollArea orientation="horizontal">
        <Table
          className={cn(
            isDev && '__PricingComparisonTable_Table', // DEBUG
            'overflow-hidden rounded-md transition',
          )}
        >
          <TableHeader
            className={cn(
              isDev && '__PricingComparisonTable_TableHeader', // DEBUG
              'sticky top-0 z-10',
              // Dark theme
              useDarkHeader && 'dark-theme bg-theme-500 text-white',
            )}
          >
            <TableRow>
              <TableHead></TableHead>
              <TableHead className="text-center">{t('Pricing.Plans.Basic.Name')}</TableHead>
              <TableHead className="text-center">{t('Pricing.Plans.Pro.Name')}</TableHead>
              <TableHead className="text-center">{t('Pricing.Plans.Premium.Name')}</TableHead>
              {/* <TableHead className="text-center">{t('Pricing.Plans.Unlimited.Name')}</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {features.map((feature, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {feature.name}
                  {feature.future && <span className="ml-1 text-theme">*</span>}
                </TableCell>
                <TableCell className="text-center">{renderCell(feature.basic)}</TableCell>
                <TableCell className="text-center">{renderCell(feature.pro)}</TableCell>
                <TableCell className="text-center">{renderCell(feature.premium)}</TableCell>
                {/* <TableCell className="text-center">{renderCell(feature.unlimited)}</TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
        <span className="text-theme">*</span>
        <span className="opacity-50">{t('Pricing.FutureFeatureNote')}</span>
      </div>
    </section>
  );
}
