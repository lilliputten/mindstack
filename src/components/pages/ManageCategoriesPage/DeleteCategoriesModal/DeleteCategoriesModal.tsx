'use client';

import React from 'react';

import { DeleteCategoriesForm } from './DeleteCategoriesForm';

export interface IDeleteCategoriesModalProps {
  onClose: () => void;
}

export function DeleteCategoriesModal({ onClose }: IDeleteCategoriesModalProps) {
  return <DeleteCategoriesForm onClose={onClose} />;
}
