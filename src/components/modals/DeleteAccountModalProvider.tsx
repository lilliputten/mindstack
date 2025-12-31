'use client';

import React from 'react';

import { useDeleteAccountModal } from './DeleteAccountModal';

const DeleteAccountModalContext = React.createContext<{
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  showDeleteAccountModal: () => void;
  isVisible: boolean;
}>({
  setVisible: () => {},
  showDeleteAccountModal: () => {},
  isVisible: false,
});

export function DeleteAccountModalProvider({ children }: { children: React.ReactNode }) {
  const {
    // ...
    isVisible,
    DeleteAccountModal,
    setVisible,
    showDeleteAccountModal,
  } = useDeleteAccountModal();

  return (
    <DeleteAccountModalContext.Provider
      value={{
        isVisible,
        setVisible,
        showDeleteAccountModal,
      }}
    >
      <DeleteAccountModal />
      {children}
    </DeleteAccountModalContext.Provider>
  );
}

export function useDeleteAccountModalContext() {
  return React.useContext(DeleteAccountModalContext);
}
