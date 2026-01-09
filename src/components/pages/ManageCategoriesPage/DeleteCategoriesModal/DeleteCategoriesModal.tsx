'use client';

import React from 'react';

import { TCategoryId } from '@/features/categories';

import { DeleteCategoriesForm } from './DeleteCategoriesForm';

export interface TDeleteCategoriesModalProps {
  // onClose: () => void;
  categoryId: TCategoryId;
  from?: string;
}

export function DeleteCategoriesModal({ from, categoryId }: TDeleteCategoriesModalProps) {
  return (
    <DeleteCategoriesForm
      // onClose={onClose}
      categoryId={categoryId}
      from={from}
    />
  );
}
