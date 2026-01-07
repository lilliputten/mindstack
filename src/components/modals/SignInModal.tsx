import React, { Dispatch, SetStateAction } from 'react';

import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { SignInForm, SignInFormHeader, TSignInProvider } from '@/components/forms/SignInForm';
import { isDev } from '@/constants';

interface TSignInModalProps {
  isVisible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  redirectUrl?: string;
  introText?: string;
}

function SignInModal(props: TSignInModalProps) {
  const { isVisible, setVisible, redirectUrl, introText } = props;

  const handleSignInDone = React.useCallback(
    (_provider: TSignInProvider) => {
      setTimeout(() => {
        setVisible(false);
      }, 400);
    },
    [setVisible],
  );

  return (
    <Modal
      isVisible={isVisible}
      toggleModal={setVisible}
      className={cn(
        isDev && '__SignInModal', // DEBUG
        'text-center',
        'text-theme-foreground',
        'flex flex-1 flex-col justify-around',
        'overflow-hidden sm:max-h-[90%]',
      )}
    >
      <div
        className={cn(
          isDev && '__SignInModal_Inner', // DEBUG
          'flex w-full flex-1 flex-col justify-center',
          'overflow-hidden',
        )}
      >
        <div
          className={cn(
            isDev && '__SignInModal_InnerHeader', // DEBUG
            'flex flex-col items-center justify-center',
            'space-y-3 border-b px-4 py-4 md:px-16',
            'border-theme-600 bg-theme',
          )}
        >
          <SignInFormHeader introText={introText} />
        </div>
        <ScrollArea
          className={cn(
            isDev && '__SignInModal_Scroll', // DEBUG
            'flex-1 items-center justify-center',
          )}
          viewportClassName={cn(
            isDev && '__SignInModal_ScrollViewport', // DEBUG
            'px-4 py-8 md:px-16 flex flex-col bg-theme-700',
            '[&>div]:!flex',
            '[&>div]:justify-center',
            '[&>div]:flex-col',
            '[&>div]:gap-4',
            '[&>div]:flex-1',
            '[&_.text-content_a]:text-theme-300',
          )}
        >
          <SignInForm onSignInDone={handleSignInDone} redirectUrl={redirectUrl} />
        </ScrollArea>
      </div>
    </Modal>
  );
}
export interface TShowSignInModalParams {
  redirectUrl?: string;
  introText?: string;
}

export function useSignInModal() {
  const [isVisible, setVisible] = React.useState(false);
  const [redirectUrl, setRedirectUrl] = React.useState<string | undefined>();
  const [introText, setIntroText] = React.useState<string | undefined>();

  const showSignInModal = React.useCallback(
    ({ redirectUrl, introText }: TShowSignInModalParams = {}) => {
      setRedirectUrl(redirectUrl);
      setIntroText(introText);
      setVisible(true);
    },
    [],
  );

  const SignInModalComponent = React.useCallback(() => {
    return (
      <SignInModal
        isVisible={isVisible}
        setVisible={setVisible}
        redirectUrl={redirectUrl}
        introText={introText}
      />
    );
  }, [isVisible, setVisible, redirectUrl, introText]);

  return React.useMemo(
    () => ({
      isVisible,
      showSignInModal,
      setVisible,
      SignInModal: SignInModalComponent,
    }),
    [isVisible, showSignInModal, setVisible, SignInModalComponent],
  );
}
