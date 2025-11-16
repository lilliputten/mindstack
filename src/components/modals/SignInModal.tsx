import React, { Dispatch, SetStateAction } from 'react';

import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { SignInForm, SignInFormHeader, TSignInProvider } from '@/components/forms/SignInForm';
import { isDev } from '@/constants';

interface TSignInModalProps {
  isVisible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}

function SignInModal(props: TSignInModalProps) {
  const { isVisible, setVisible } = props;

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
          <SignInFormHeader />
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
          <SignInForm onSignInDone={handleSignInDone} />
        </ScrollArea>
      </div>
    </Modal>
  );
}

export function useSignInModal() {
  const [isVisible, setVisible] = React.useState(false);

  const SignInModalCallback = React.useCallback(() => {
    return <SignInModal isVisible={isVisible} setVisible={setVisible} />;
  }, [isVisible, setVisible]);

  return React.useMemo(
    () => ({
      isVisible,
      setVisible,
      SignInModal: SignInModalCallback,
    }),
    [isVisible, setVisible, SignInModalCallback],
  );
}
