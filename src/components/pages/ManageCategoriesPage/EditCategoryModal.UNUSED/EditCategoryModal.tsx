'use client';

import React from 'react';

import { EditCategoryForm } from './EditCategoryForm';

export interface IEditCategoryModalProps {
  categoryId: string;
  onClose: () => void;
}

export function EditCategoryModal({ categoryId, onClose }: IEditCategoryModalProps) {
  return (
    <EditCategoryForm
      categoryId={categoryId}
      // onSuccess={() => {}}
      onClose={onClose}
    />
  );
}
