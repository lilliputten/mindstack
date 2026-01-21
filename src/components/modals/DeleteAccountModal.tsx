import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { signOut, useSession } from 'next-auth/react';
import { toast } from 'sonner';

import { clearLocalStorage, deleteAllCookies, getErrorText } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { isDev } from '@/config';
import { deleteUser } from '@/features/users/actions';

function DeleteAccountModal({
  isVisible,
  setVisible,
}: {
  isVisible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const session = useSession();
  const {
    // status,
    data: sessionData,
  } = session;
  const user = sessionData?.user;

  const t = useT();

  const confirmPattern = t('DeleteAccountModal.confirmPattern');

  const queryClient = useQueryClient();

  const [isDeleting, setDeleting] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const signOutAndClean = React.useCallback(() => {
    // Clear react-query and local caches
    queryClient.clear();
    clearLocalStorage({ except: ['cookies-accepted'] });
    if (typeof document !== 'undefined') {
      deleteAllCookies();
    }
    signOut({
      // callbackUrl: `${window.location.origin}/`,
    });
  }, [queryClient]);

  const doDeleteAccount = React.useCallback(() => {
    startTransition(async () => {
      try {
        if (!user) {
          throw new Error('User is not signed in');
        }
        const promise = deleteUser(user.id);
        toast.promise(promise, {
          loading: t('DeleteAccountModal.DeletingAccount'),
          success: t('DeleteAccountModal.AccountDeletedSuccessfully'),
          error: 'Error deleting account',
        });
        await promise;
        setDeleting(true);
        // Do other stuff...
        setTimeout(signOutAndClean, 500);
      } catch (error) {
        const details = getErrorText(error);
        const message = t('DeleteAccountModal.CannotDeleteAccount');
        // eslint-disable-next-line no-console
        console.error('[DeleteAccountModal:doDeleteAccount]', message, {
          details,
          error,
        });
        debugger; // eslint-disable-line no-debugger
        toast.error(message);
      }
    });
  }, [t, user, signOutAndClean]);

  if (!user) {
    return null;
  }

  const isBusy = isDeleting || isPending;

  return (
    <Modal isVisible={isVisible} toggleModal={setVisible} className="gap-0">
      <div
        data-testid="__DeleteAccountModal"
        className={cn(
          isDev && '__DeleteAccountModal', // DEBUG
          'flex flex-col items-center justify-center space-y-3 border-b p-4 pt-8 sm:px-16',
          isBusy && 'pointer-events-none opacity-50',
        )}
      >
        <UserAvatar user={user} />
        <h3 className="text-lg font-semibold">{t('DeleteAccountModal.DeleteAccount')}</h3>
        <p className="text-center text-sm text-muted-foreground">
          <b>{t('DeleteAccountModal.Warning')}:</b> {t('DeleteAccountModal.WarningText')}
        </p>
        {/* TODO: Use getUserSubscriptionPlan(session.user.id) to display the user's subscription if he have a paid plan */}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          doDeleteAccount();
        }}
        className="flex flex-col space-y-6 bg-accent px-4 py-8 text-left sm:px-16"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="verification" className="block text-sm">
            {t.rich('DeleteAccountModal.TypeToVerifyText', {
              ConfirmPattern: () => (
                <span className="font-semibold text-black dark:text-white">{confirmPattern}</span>
              ),
            })}
          </label>
          <Input
            type="text"
            name="verification"
            id="verification"
            pattern={confirmPattern}
            required
            autoFocus={false}
            autoComplete="off"
            className="mt-1 w-full border bg-background"
          />
        </div>

        <div className="flex gap-2">
          <Button
            className="flex-1"
            variant={isBusy ? 'disabled' : 'destructive'}
            disabled={isBusy}
          >
            {t('DeleteAccountModal.ConfirmDeleteAccount')}
          </Button>
          <Button variant="ghost" onClick={() => setVisible(false)}>
            {t('Cancel')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function useDeleteAccountModal() {
  const [isVisible, setVisible] = React.useState(false);

  const showDeleteAccountModal = React.useCallback(() => {
    setVisible(true);
  }, []);

  const DeleteAccountModalComponent = React.useCallback(() => {
    return <DeleteAccountModal isVisible={isVisible} setVisible={setVisible} />;
  }, [isVisible, setVisible]);

  return React.useMemo(
    () => ({
      isVisible,
      setVisible,
      showDeleteAccountModal,
      DeleteAccountModal: DeleteAccountModalComponent,
    }),
    [
      isVisible,
      setVisible,
      ///
      showDeleteAccountModal,
      DeleteAccountModalComponent,
    ],
  );
}
