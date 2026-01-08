'use client';

import React from 'react';

import { AddCategoryForm } from './AddCategoryForm';

export interface IAddCategoryModalProps {
  onClose: () => void;
}

export function AddCategoryModal({ onClose }: IAddCategoryModalProps) {
  return (
    <AddCategoryForm
      // onSuccess={() => {}}
      onClose={onClose}
    />
  );
}
