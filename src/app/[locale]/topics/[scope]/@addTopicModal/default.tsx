'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

import { AddTopicModal } from '@/components/pages/ManageTopicsPage/AddTopicModal';
import { topicsRoutes } from '@/contexts/TopicsContext';

// Memoize the AddTopicModal to prevent unnecessary re-renders
const MemoizedAddTopicModal = React.memo(AddTopicModal);

export default function AddTopicModalDefault() {
  const pathname = usePathname();

  // Only render the modal if we're on the /add route
  const urlPostfix = '/add';
  // Checks on leave the page or on intercepting route
  const isAddRoute = pathname?.endsWith(urlPostfix);

  if (isAddRoute) {
    // A path without final '/add'
    const prevChunk = pathname.substring(0, pathname.length - urlPostfix.length);
    const endsWithAPath = Object.values(topicsRoutes).find((path) => prevChunk.endsWith(path));
    if (endsWithAPath) {
      return <MemoizedAddTopicModal />;
    }
  }

  return null;
}
