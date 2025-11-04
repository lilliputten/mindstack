'use client';

import React from 'react';

import { TReactNode } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Breadcrumbs, TBreadcrumbsItemProps } from '@/components/layout/Breadcrumbs';
import { isDev } from '@/constants';

import { DashboardActions, TActionMenuItem } from './DashboardActions';

interface DashboardHeaderProps {
  className?: string;
  children?: TReactNode;
  heading?: TReactNode;
  title?: string;
  text?: TReactNode;
  actions?: TActionMenuItem[];
  breadcrumbs?: TBreadcrumbsItemProps[];
  inactiveLastBreadcrumb?: boolean;
}

export function DashboardHeader(props: DashboardHeaderProps) {
  const {
    className,
    children,
    heading,
    title,
    text,
    actions,
    breadcrumbs,
    inactiveLastBreadcrumb,
  } = props;
  return (
    <div
      className={cn(
        isDev && '__DashboardHeader', // DEBUG
        'flex flex-col gap-2',
        className,
      )}
      title={title}
    >
      {breadcrumbs && (
        <Breadcrumbs
          className={cn(
            isDev && '__DashboardHeader_Breadcrumbs', // DEBUG
            // 'truncate',
          )}
          items={breadcrumbs}
          inactiveLast={inactiveLastBreadcrumb}
        />
      )}
      <div
        className={cn(
          isDev && '__DashboardHeader_MainWrapper', // DEBUG
          'flex items-start justify-between gap-2',
        )}
      >
        <div
          className={cn(
            isDev && '__DashboardHeader_Content', // DEBUG
            'flex flex-1 flex-col gap-1 truncate',
          )}
        >
          {heading && <h1 className="truncate font-heading text-2xl text-theme">{heading}</h1>}
          {text && <div className="truncate text-base opacity-50">{text}</div>}
          {children}
        </div>
        {actions && <DashboardActions actions={actions} />}
      </div>
    </div>
  );
}
