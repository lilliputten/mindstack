'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';

import { getErrorText } from '@/lib/helpers';
import { removeNullUndefinedValues } from '@/lib/helpers/objects';
import { cn } from '@/lib/utils';
import { FormProvider } from '@/components/ui/Form';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { SelectTopicLanguageModal } from '@/components/modals/SelectTopicLanguageModal';
import { isDev } from '@/constants';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { settingsSchema, TSettings } from '@/features/settings/types';
import { TSelectTopicLanguageData } from '@/features/topics/types';
import { TUserId } from '@/features/users/types/TUser';

import { SettingsFormFields } from './SettingsFormFields';
import { TSettingsFormData } from './types';

interface TSettingsFormProps {
  settings: TSettings;
  form: UseFormReturn<TSettingsFormData>;
  className?: string;
  userId?: TUserId;
}

export function SettingsForm(props: TSettingsFormProps) {
  const { form, settings, className, userId } = props;
  const { updateAndSaveSettings, inited, userInited } = useSettingsContext();
  const [isPending, startTransition] = React.useTransition();

  // @see https://react-hook-form.com/docs/useform/formstate
  const { isDirty, isValid } = form.formState;

  const [isSelectLanguageVisible, setShowSelectLanguage] = React.useState<boolean | undefined>();
  const [langCode, langName, langCustom] = form.watch(['langCode', 'langName', 'langCustom']);

  const handleSelectedLanguage = React.useCallback(
    ({ langCode, langName, langCustom }: TSelectTopicLanguageData) => {
      // Update the form fields
      const opts = {
        shouldDirty: true,
        shouldValidate: true,
        shouldTouch: true,
      };
      form.setValue('langCode', langCode, opts);
      form.setValue('langName', langName, opts);
      form.setValue('langCustom', langCustom, opts);
    },
    [form],
  );
  const setAnyLanguage = React.useCallback(() => {
    setShowSelectLanguage(false);
    handleSelectedLanguage({ langCode: '-', langName: undefined, langCustom: undefined });
  }, [handleSelectedLanguage]);
  const resetLanguage = React.useCallback(() => {
    setShowSelectLanguage(false);
    handleSelectedLanguage({ langCode: undefined, langName: undefined, langCustom: undefined });
  }, [handleSelectedLanguage]);

  const isReady = userId ? userInited : inited;
  const isSubmitEnabled = isReady && !isPending && isDirty && isValid;
  const isWaiting = isPending || !isReady;

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
            console.error('[SettingsForm:handleFormSubmit]', message, {
              error,
            });
          });
      });
    },
    [form, updateAndSaveSettings, settings],
  );

  const handleCancel = undefined;

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className={cn(
          isDev && '__SettingsForm', // DEBUG
          'flex w-full flex-col gap-4 overflow-hidden',
          isWaiting && 'pointer-events-none opacity-50',
          className,
        )}
      >
        <ScrollArea>
          <SettingsFormFields
            settings={settings}
            form={form}
            isSubmitEnabled={isSubmitEnabled}
            isPending={isWaiting}
            onCancel={handleCancel}
            selectLanguage={() => setShowSelectLanguage(true)}
            resetLanguage={resetLanguage}
          />
        </ScrollArea>
      </form>
      <SelectTopicLanguageModal
        isVisible={isSelectLanguageVisible}
        langCode={langCode}
        langName={langName}
        langCustom={langCustom}
        handleHide={() => setShowSelectLanguage(false)}
        handleSelect={handleSelectedLanguage}
        setAnyLanguage={setAnyLanguage}
        resetLanguage={resetLanguage}
      />
    </FormProvider>
  );
}
