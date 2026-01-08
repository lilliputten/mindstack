'use client';

import React from 'react';

interface IManageCategoriesListCardProps {
  children: React.ReactNode;
}

/** Main card wrapper for manage categories page content */
export function ManageCategoriesListCard({ children }: IManageCategoriesListCardProps) {
  return (
    <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">{children}</div>
  );
}
