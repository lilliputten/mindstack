'use client';

import React from 'react';

import { useSignInModal } from './SignInModal';

const SignInModalContext = React.createContext<{
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  isVisible: boolean;
}>({
  setVisible: () => {},
  isVisible: false,
});

export function SignInModalProvider({ children }: { children: React.ReactNode }) {
  const { isVisible, SignInModal, setVisible } = useSignInModal();

  return (
    <SignInModalContext.Provider
      value={{
        isVisible,
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
