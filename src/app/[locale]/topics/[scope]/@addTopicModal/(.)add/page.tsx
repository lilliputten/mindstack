'use client';

import { usePathname } from 'next/navigation';

import { AddTopicModal } from '@/components/pages/ManageTopicsPage/AddTopicModal';

export default function AddTopicModalPage() {
  const pathname = usePathname();

  // Close the modal if the user navigates away from the add route
  // The modal should only be visible when on /topics/[scope]/add
  const urlPostfix = '/add';
  // Checks on page enter
  if (!pathname?.endsWith(urlPostfix)) {
    return null;
  }

  // This page is specifically for the add modal parallel route
  // When this page is loaded, it means the add modal should be displayed
  return <AddTopicModal />;
}
