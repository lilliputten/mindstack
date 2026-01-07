'use client';

import React from 'react';

import { TShowSignInModalParams, useSignInModal } from './SignInModal';

const SignInModalContext = React.createContext<{
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  showSignInModal: (params?: TShowSignInModalParams) => void;
  isVisible: boolean;
}>({
  setVisible: () => {},
  showSignInModal: () => {},
  isVisible: false,
});

export function SignInModalProvider({ children }: { children: React.ReactNode }) {
  const { isVisible, SignInModal, showSignInModal, setVisible } = useSignInModal();

  return (
    <SignInModalContext.Provider
      value={{
        isVisible,
        showSignInModal,
        setVisible,
      }}
    >
      <SignInModal />
      {children}
    </SignInModalContext.Provider>
  );
}

export function useSignInModalContext() {
  return React.useContext(SignInModalContext);
}
