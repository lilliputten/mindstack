'use client';

import { createContext, ReactNode, useContext, useRef } from 'react';
import { useStore } from 'zustand';

import {
  createManageTopicsStore,
  defaultManageTopicsState,
  ManageTopicsState,
  ManageTopicsStore,
} from './ManageTopicsStore';

export type ManageTopicsStoreApi = ReturnType<typeof createManageTopicsStore>;

export const ManageTopicsContext = createContext<ManageTopicsStoreApi | undefined>(undefined);

export interface ManageTopicsProviderProps extends Partial<ManageTopicsState> {
  children: ReactNode;
}

export const ManageTopicsStoreProvider = (props: ManageTopicsProviderProps) => {
  const { children, ...initState } = props;
  const storeRef = useRef<ManageTopicsStoreApi | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createManageTopicsStore({ ...defaultManageTopicsState, ...initState });
  }
  return (
    <ManageTopicsContext.Provider value={storeRef.current}>{children}</ManageTopicsContext.Provider>
  );
};

export const useManageTopicsStoreSelector = <T,>(selector: (store: ManageTopicsStore) => T): T => {
  const counterStoreContext = useContext(ManageTopicsContext);
  /* // Old approach: Throw an error for missed context
   * if (!counterStoreContext) {
   *   throw new Error(`useManageTopicsStoreSelector must be used within ManageTopicsStoreProvider`);
   *   // return { manageScope: 'my' };
   * }
   */
  // XXX: Is it safe?
  return useStore(counterStoreContext || createManageTopicsStore(), selector);
};

export const useManageTopicsStore = () => useManageTopicsStoreSelector((state) => state);

export const useManageTopicsStoreManageScope = () =>
  useManageTopicsStoreSelector((state) => state.manageScope);
