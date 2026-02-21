'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { getErrorText, getRandomHashString, removeNullUndefinedValues } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { TActionMenuItem } from '@/components/dashboard/DashboardActions';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { SettingsForm } from '@/components/pages/SettingsPage/SettingsForm';
import { TSettingsFormData } from '@/components/pages/SettingsPage/SettingsForm/types';
import * as Icons from '@/components/shared/Icons';
import { rootAliasRoute } from '@/config';
import { isDev } from '@/constants';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { settingsSchema, TSettings } from '@/features/settings/types';
import { TUserId } from '@/features/users/types/TUser';
import { useGoBack } from '@/hooks';

import { CardContentSkeleton } from './skeletons';

const saveScrollHash = getRandomHashString();

type TSettingsPageProps = {
  userId?: TUserId;
};

export function SettingsPage(props: TSettingsPageProps) {
  const { userId } = props;
  const settingsContext = useSettingsContext();
  const {
    settings,
    ready: isDataReady,
    updateAndSaveSettings,
    inited,
    userInited,
    loadSettings,
  } = settingsContext;
  const [isPending, startTransition] = React.useTransition();
  const [isReLoading, startReLoading] = React.useTransition();
  const [isReloadConfirmModalVisible, setReloadConfirmModalVisible] = React.useState(false);
  const t = useT();
  const [isUserReady, setIsUserReady] = React.useState<boolean>(false);

  const goBack = useGoBack(rootAliasRoute);

  // @see https://react-hook-form.com/docs/useform
  const form = useForm<TSettingsFormData>({
    mode: 'onChange', // 'all', // Validation strategy before submitting behaviour.
    criteriaMode: 'all', // Display all validation errors or one at a time.
    resolver: zodResolver(settingsSchema),
    values: settings,
  });

  const doReload = React.useCallback(() => {
    startReLoading(async () => {
      const settings = await loadSettings();
      form.reset(settings);
      setReloadConfirmModalVisible(false);
    });
  }, [form, loadSettings]);

  React.useEffect(() => {
    setIsUserReady((oldIsUserReady) => {
      const isUserReady = userId ? userInited : inited;
      if (oldIsUserReady !== isUserReady && isUserReady) {
        form.reset(settings);
        return isUserReady;
      }
      return oldIsUserReady;
    });
  }, [form, settings, userId, userInited, inited]);

  const { isDirty, isValid } = form.formState;
  const isReady = isDataReady && isUserReady;
  const isSubmitEnabled = isReady && !isPending && isDirty && isValid;

  const handleFormSubmit = React.useCallback(
    (formData: TSettingsFormData) => {
      const editedSettings: TSettings = {
        ...settings,
        ...formData,
      };
      startTransition(() => {
        const savePromise = updateAndSaveSettings(editedSettings);
        return savePromise
          .then((result) => {
            const updatedSettings = result.ok && result.data ? result.data : editedSettings;
            const settings: TSettings = settingsSchema.parse(
              removeNullUndefinedValues(updatedSettings),
            );
            form.reset(settings);
          })
          .catch((error) => {
            const message = getErrorText(error);
            // eslint-disable-next-line no-console
            console.error('[SettingsPage:handleFormSubmit]', message, {
              error,
            });
          });
      });
    },
    [form, updateAndSaveSettings, settings],
  );

  const actions: TActionMenuItem[] = React.useMemo(
    () => [
      {
        id: 'Back',
        content: t('Back'),
        icon: Icons.ArrowLeft,
        visibleFor: 'sm',
        onClick: goBack,
      },
      {
        id: 'save',
        content: t('Save'),
        variant: 'theme',
        icon: Icons.Save,
        visibleFor: 'sm',
        disabled: !isSubmitEnabled,
        onClick: form.handleSubmit(handleFormSubmit),
      },
      {
        id: 'reset',
        content: t('Reset'),
        icon: Icons.Close,
        visibleFor: 'md',
        disabled: !isDirty,
        onClick: () => form.reset(),
      },
      {
        id: 'refresh',
        content: t('Refresh'),
        title: t('SettingsPage.UpdateSettingsHint'),
        pending: isReLoading,
        // size: 'icon',
        icon: Icons.Refresh,
        visibleFor: 'md',
        disabled: !isReady,
        onClick: () => (isDirty ? setReloadConfirmModalVisible(true) : doReload()),
      },
    ],
    [t, doReload, form, handleFormSubmit, isDirty, isReLoading, isReady, isSubmitEnabled, goBack],
  );

  return (
    <>
      <DashboardHeader
        heading={t('Pages.SettingsTitle')}
        text={t('Pages.SettingsDescription')}
        className={cn(
          isDev && '__SettingsPage_DashboardHeader', // DEBUG
          'mx-6',
        )}
        actions={actions}
      />
      {/*
      <Card
        className={cn(
          isDev && '__SettingsPage_Card', // DEBUG
          'relative flex flex-1 flex-col overflow-hidden',
          'bg-gr2',
          'mx-6 py-6',
          className,
        )}
      >
      </Card>
      */}
      {!isReady ? (
        <CardContentSkeleton />
      ) : (
        <ScrollArea saveScrollKey="SettingsPage" saveScrollHash={saveScrollHash}>
          <SettingsForm form={form} settings={settings} userId={userId} />
        </ScrollArea>
      )}
      <ConfirmModal
        dialogTitle="Confirm data loss"
        confirmButtonVariant="theme"
        confirmButtonText="Yes"
        confirmButtonBusyText="Reloading"
        cancelButtonText="No"
        handleClose={() => setReloadConfirmModalVisible(false)}
        handleConfirm={doReload}
        isVisible={isReloadConfirmModalVisible}
        isPending={isReLoading}
      >
        Are you confirming the overwriting of the changed data?
      </ConfirmModal>
    </>
  );
}
