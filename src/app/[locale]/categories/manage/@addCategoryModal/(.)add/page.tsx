'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AddCategoryModalPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const isOpen = searchParams.get('add') === 'true';

  useEffect(() => {
    if (!isOpen) {
      router.push('/categories/manage');
    }
  }, [isOpen, router]);

  // If not open, return null to prevent flash
  if (!isOpen) {
    return null;
  }

  return null;
}
