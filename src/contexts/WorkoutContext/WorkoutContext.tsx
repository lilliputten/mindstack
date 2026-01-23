'use client';

import React from 'react';

import { useWorkoutQuery } from '@/hooks/react-query/useWorkoutQuery';
import { TTopicId } from '@/features/topics/types';
import { TUserId } from '@/features/users/types/TUser';

type TUseWorkout = ReturnType<typeof useWorkoutQuery>;

const WorkoutContext = React.createContext<TUseWorkout | undefined>(undefined);

interface WorkoutContextProviderProps {
  userId?: TUserId;
  topicId: TTopicId;
  children: React.ReactNode;
}

export function WorkoutContextProvider({ topicId, children }: WorkoutContextProviderProps) {
  const workoutData = useWorkoutQuery({
    topicId,
  });

  return <WorkoutContext.Provider value={workoutData}>{children}</WorkoutContext.Provider>;
}

export function useWorkoutContext() {
  const context = React.useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkoutContext must be used within WorkoutContextProvider');
  }
  return context;
}
