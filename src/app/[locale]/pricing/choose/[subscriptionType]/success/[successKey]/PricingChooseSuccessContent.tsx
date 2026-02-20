'use client';

import React from 'react';

import { UserGradeType } from '@/generated/prisma';

import { pricingAliasRoute, userStartAliasRoute } from '@/config/routesConfig';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Icons } from '@/components/shared';
import { isDev } from '@/config';
import {
  ensurePaidableSubscriptionType,
  parsePaidableSubscriptionType,
  TPaidableSubscriptionType,
} from '@/features/subscriptions';

interface PricingChooseSuccessContentProps {
  subscriptionType: TPaidableSubscriptionType;
}

export function PricingChooseSuccessContent({
  subscriptionType: rawSubscriptionType,
}: PricingChooseSuccessContentProps) {
  const t = useT();

  // Convert & check the subscription type
  const subscriptionType: TPaidableSubscriptionType = ensurePaidableSubscriptionType(
    rawSubscriptionType,
    t,
  );

  // Extract grade from subscription type (e.g., 'PRO-MONTHLY' -> 'PRO')
  const { grade } = parsePaidableSubscriptionType(subscriptionType, t);

  // Define features based on subscription grade using real features from pricing components
  const getFeaturesByGrade = (grade: UserGradeType) => {
    switch (grade) {
      case 'PRO':
        return [
          t('Pricing.Plans.Pro.Features.Unlimited'),
          t('Pricing.Plans.Pro.Features.Ai'),
          t('Pricing.Plans.Pro.Features.Generations'),
          t('Pricing.FutureFeatureNote') + ' ' + t('Pricing.Plans.Pro.Features.Analytics'),
          t('Pricing.FutureFeatureNote') + ' ' + t('Pricing.Plans.Pro.Features.Support'),
        ];
      case 'PREMIUM':
        return [
          t('Pricing.Plans.Premium.Features.Everything'),
          t('Pricing.Plans.Premium.Features.UnlimitedGenerations'),
          t('Pricing.FutureFeatureNote') + ' ' + t('Pricing.Plans.Premium.Features.Priority'),
          t('Pricing.FutureFeatureNote') + ' ' + t('Pricing.Plans.Premium.Features.Advanced'),
          t('Pricing.FutureFeatureNote') + ' ' + t('Pricing.Plans.Premium.Features.Export'),
        ];
      case 'BASIC':
        return [
          t('Pricing.Plans.Basic.Features.Topics'),
          t('Pricing.Plans.Basic.Features.Workouts'),
          t('Pricing.Plans.Basic.Features.Progress'),
          t('Pricing.Plans.Basic.Features.Community'),
          t('Pricing.Plans.Basic.Features.Generations'),
        ];
      default:
        return [
          t('Pricing.Plans.Basic.Features.Topics'),
          t('Pricing.Plans.Basic.Features.Workouts'),
          t('Pricing.Plans.Basic.Features.Progress'),
        ];
    }
  };

  const features = getFeaturesByGrade(grade);

  return (
    <div
      className={cn(
        isDev && '__PricingChooseSuccessContent', // DEBUG
        'mx-auto w-full max-w-4xl px-4 py-8',
      )}
    >
      <div
        className={cn(
          isDev && '__PricingChooseSuccessContent_Header', // DEBUG
          'mb-12 text-center',
        )}
      >
        <div className="mb-6 flex justify-center">
          <div
            className={cn(
              'inline-block rounded-full',
              'p-4',
              'bg-theme-500/10',
              // 'bg-gradient-to-r from-green-500 to-emerald-600 p-4',
            )}
          >
            <Icons.CheckCircle className="size-12 text-white" />
          </div>
        </div>

        <h1 className="mb-4 text-4xl font-bold text-theme">
          {t('PricingChooseSuccess.Congratulations')}
        </h1>

        <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
          {t.rich('PricingChooseSuccess.SubscriptionUpgraded', {
            grade,
            strong: (chunks) => <strong>{chunks}</strong>,
          })}
        </p>
      </div>

      <div
        className={cn(
          isDev && '__PricingChooseSuccessContent_FeaturesWrapper', // DEBUG
          'flex flex-col items-center',
        )}
      >
        <Card
          className={cn(
            isDev && '__PricingChooseSuccessContent_Features', // DEBUG
            'mb-8',
            'w-max-full w-full bg-theme/5 px-6 py-4 md:w-2/3',
          )}
        >
          <CardHeader className="flex flex-col items-center">
            <CardTitle className="flex items-center gap-2 text-theme">
              <Icons.Star className="size-6 text-theme" />
              {t('PricingChooseSuccess.NewFeatures')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Icons.CheckCircle className="mr-3 mt-0.5 size-5 flex-shrink-0 text-theme" />
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col justify-center gap-4 sm:flex-row">
        <Button variant="theme" size="lg">
          <Link
            href={userStartAliasRoute}
            className="flex h-full w-full items-center justify-center gap-2"
          >
            <Icons.ArrowRight className="size-4" />
            <span>{t('PricingChooseSuccess.StartWorking')}</span>
          </Link>
        </Button>
        <Button variant="outline" size="lg">
          <Link
            href={pricingAliasRoute}
            className="flex h-full w-full items-center justify-center gap-2"
          >
            <Icons.ArrowRight className="size-4" />
            <span>{t('PricingChooseSuccess.ViewPlans')}</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
