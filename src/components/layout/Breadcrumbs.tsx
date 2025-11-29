'use client';

import React from 'react';
import Link from 'next/link';

import { TPropsWithClassName, TReactNode } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { isDev } from '@/constants';

function BreadcrumbsDelim() {
  return <span className="opacity-50">&raquo;</span>;
}

export interface TBreadcrumbsItemProps {
  link?: string;
  content?: TReactNode;
  loading?: boolean;
}

export class BreadcrumbsItem implements TBreadcrumbsItemProps {
  link: TBreadcrumbsItemProps['link'];
  content: TBreadcrumbsItemProps['content'];
  loading: TBreadcrumbsItemProps['loading'];

  constructor(props: TBreadcrumbsItemProps) {
    this.link = props.link;
    this.content = props.content;
    this.loading = props.loading;
  }
}

function RenderBreadcrumbsItem({
  link,
  content,
  loading,
}: TBreadcrumbsItemProps | BreadcrumbsItem) {
  if (loading) {
    return (
      <Skeleton
        className={cn(
          isDev && '__RenderBreadcrumbsItem_Skeleton', // DEBUG
          'h-1 w-5 rounded',
          // 'whitespace-nowrap',
          'truncate',
        )}
      />
    );
  }
  if (!content) {
    return null;
  }
  if (!link) {
    return (
      <span
        className={cn(
          isDev && '__RenderBreadcrumbsItem_Plain', // DEBUG
          'opacity-50',
          // 'whitespace-nowrap',
          'truncate',
        )}
      >
        {content}
      </span>
    );
  }
  return (
    <Link
      href={link}
      className={cn(
        isDev && '__RenderBreadcrumbsItem_Link', // DEBUG
        'hover:underline',
        // 'whitespace-nowrap',
        'truncate',
      )}
    >
      {content}
    </Link>
  );
}

interface TBreadcrumbsProps extends TPropsWithClassName {
  items: (TBreadcrumbsItemProps | undefined)[];
  inactiveLast?: boolean;
}

export function Breadcrumbs(props: TBreadcrumbsProps) {
  const { className, items, inactiveLast } = props;
  const content: React.JSX.Element[] = [];
  const filteredItems = items.filter(Boolean) as TBreadcrumbsItemProps[];
  for (let n = 0; n < filteredItems.length; n++) {
    const isLast = n === filteredItems.length - 1;
    const props = filteredItems[n];
    content.push(
      <RenderBreadcrumbsItem
        key={
          props.link || (typeof props.content === 'string' ? props.content : `BreadcrumbsItem-${n}`)
        }
        {...props}
        link={isLast && inactiveLast ? undefined : props.link}
      />,
    );
    if (n < filteredItems.length - 1) {
      content.push(<BreadcrumbsDelim key={`BreadcrumbsDelim-${n}`} />);
    }
  }
  return (
    <div
      className={cn(
        isDev && '__Breadcrumbs', // DEBUG
        'flex gap-1 gap-x-2 text-sm',
        'overflow-hidden',
        // 'overflow-x-scroll',
        className,
      )}
    >
      {content}
    </div>
  );
}
