import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { toast } from 'sonner';

import { APIError } from '@/lib/types/api';
import { handleApiResponse } from '@/lib/api';
import { useInvalidateReactQueryKeys } from '@/lib/data/invalidateReactQueryKeys';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { useT } from '@/i18n';

function DeleteAccountModal({
  showDeleteAccountModal,
  setShowDeleteAccountModal,
}: {
  showDeleteAccountModal: boolean;
  setShowDeleteAccountModal: Dispatch<SetStateAction<boolean>>;
}) {
  const { data: session } = useSession();
  const user = session?.user;
  const [deleting, setDeleting] = useState(false);
  const invalidateKeys = useInvalidateReactQueryKeys();

  const t = useT();

  async function deleteAccount() {
    setDeleting(true);
    try {
      const result = await handleApiResponse(
        fetch(`/api/user`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }),
        {
          onInvalidateKeys: invalidateKeys,
          debugDetails: {
            initiator: 'DeleteAccountModal',
            action: 'deleteAccount',
          },
        },
      );

      if (result.ok) {
        // delay to allow for the route change to complete
        await new Promise((resolve) =>
          setTimeout(() => {
            signOut({
              callbackUrl: `${window.location.origin}/`,
            });
            resolve(null);
          }, 500),
        );
      } else {
        setDeleting(false);
        throw new Error(result.error?.message || 'Failed to delete account');
      }
    } catch (error) {
      setDeleting(false);
      const details = error instanceof APIError ? error.details : null;
      const message = 'Cannot delete account';
      // eslint-disable-next-line no-console
      console.error('[DeleteAccountModal]', message, {
        details,
        error,
      });
      debugger; // eslint-disable-line no-debugger
      throw error;
    }
  }

  return (
    <Modal
      isVisible={showDeleteAccountModal}
      toggleModal={setShowDeleteAccountModal}
      className="gap-0"
    >
      <div className="flex flex-col items-center justify-center space-y-3 border-b p-4 pt-8 sm:px-16">
        <UserAvatar user={user} />
        <h3 className="text-lg font-semibold">Delete Account</h3>
        <p className="text-center text-sm text-muted-foreground">
          <b>Warning:</b> This will permanently delete your account and your active subscription!
        </p>

        {/* TODO: Use getUserSubscriptionPlan(session.user.id) to display the user's subscription if he have a paid plan */}
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          toast.promise(deleteAccount(), {
            loading: t('DeleteAccountModal.DeletingAccount'),
            success: t('DeleteAccountModal.AccountDeletedSuccessfully'),
            error: (err) => err,
          });
        }}
        className="flex flex-col space-y-6 bg-accent px-4 py-8 text-left sm:px-16"
      >
        <div>
          <label htmlFor="verification" className="block text-sm">
            To verify, type{' '}
            <span className="font-semibold text-black dark:text-white">confirm delete account</span>{' '}
            below
          </label>
          <Input
            type="text"
            name="verification"
            id="verification"
            pattern="confirm delete account"
            required
            autoFocus={false}
            autoComplete="off"
            className="mt-1 w-full border bg-background"
          />
        </div>

        <Button variant={deleting ? 'disabled' : 'destructive'} disabled={deleting}>
          Confirm delete account
        </Button>
      </form>
    </Modal>
  );
}

export function useDeleteAccountModal() {
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  const DeleteAccountModalCallback = useCallback(() => {
    return (
      <DeleteAccountModal
        showDeleteAccountModal={showDeleteAccountModal}
        setShowDeleteAccountModal={setShowDeleteAccountModal}
      />
    );
  }, [showDeleteAccountModal, setShowDeleteAccountModal]);

  return useMemo(
    () => ({
      setShowDeleteAccountModal,
      DeleteAccountModal: DeleteAccountModalCallback,
    }),
    [setShowDeleteAccountModal, DeleteAccountModalCallback],
  );
}
