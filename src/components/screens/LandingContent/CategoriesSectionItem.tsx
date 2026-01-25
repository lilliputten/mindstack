'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { AvailableCategoriesListItem } from '@/app/[locale]/categories/available/AvailableCategoriesListItem';
import { isDev } from '@/config';
import { TCategory } from '@/features/categories/types';

interface TProps {
  category: TCategory;
  className?: string;
}

export function CategoriesSectionItem(props: TProps) {
  const { category, className } = props;
  /* // DEMO: category properties
   * const {
   *   status, // CategoryStatusSchema
   *   id, // z.string().cuid()
   *   createdAt, // z.coerce.date()
   *   updatedAt, // z.coerce.date()
   *   createdBy, // z.string().nullable()
   *   imageUrl, // z.string().nullable()
   *   updatedBy, // z.string().nullable()
   * } = category;
   */
  return (
    <AvailableCategoriesListItem
      category={category}
      className={cn(
        isDev && '__CategoriesSectionItem', // DEBUG
        className,
      )}
    />
  );
}
