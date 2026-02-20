'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { DialogDescription, DialogTitle } from '@/components/ui/Dialog';
import { Modal } from '@/components/ui/Modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { isDev } from '@/constants';
import {
  selectTopicEventName,
  TSelectTopicLanguageData,
  TTopicId,
  TTopicLanguageData,
} from '@/features/topics/types';
import { useMediaQuery } from '@/hooks';

import { SelectLanguageCustomForm } from './SelectLanguageCustomForm';
import { SelectLanguagePredefinedForm } from './SelectLanguagePredefinedForm';

interface TSelectTopicLanguageModalProps extends TTopicLanguageData {
  topicId?: TTopicId;
  isVisible?: boolean;
  // Handlers...
  handleSelect?: (data: TSelectTopicLanguageData) => void;
  handleHide?: () => void;
  setAnyLanguage?: () => void;
  resetLanguage?: () => void;
}

export function SelectTopicLanguageModal(props: TSelectTopicLanguageModalProps) {
  const {
    langCode,
    langName,
    langCustom,
    topicId,
    isVisible: defaultVisible = false,
    // Handlers...
    handleSelect,
    handleHide,
    setAnyLanguage,
    resetLanguage,
  } = props;

  const [isVisible, setVisible] = React.useState<boolean | undefined>(defaultVisible);

  React.useEffect(() => {
    setVisible(defaultVisible);
  }, [defaultVisible]);

  const router = useRouter();

  const hideModal = React.useCallback(() => {
    setVisible(false);
    if (handleHide) {
      handleHide();
    } else {
      router.back();
    }
  }, [handleHide, router]);

  const { isMobile } = useMediaQuery();

  const t = useT();

  // Change a browser title
  React.useEffect(() => {
    const originalTitle = document.title;
    document.title = t('SelectTopicLanguageModal.SelectLanguage');
    return () => {
      document.title = originalTitle;
    };
  }, [t]);

  const selectLanguage = React.useCallback(
    (selectedLanguage: TTopicLanguageData) => {
      // Dispatch a custom event with the selected language data
      const data: TSelectTopicLanguageData = { topicId, ...selectedLanguage };
      if (handleSelect) {
        handleSelect(data);
      } else {
        const event = new CustomEvent<TSelectTopicLanguageData>(selectTopicEventName, {
          detail: data,
          bubbles: true,
        });
        window.dispatchEvent(event);
      }
      // Close the modal
      hideModal();
    },
    [handleSelect, hideModal, topicId],
  );

  if (isVisible == undefined) {
    return null;
  }

  return (
    <Modal
      isVisible={isVisible}
      hideModal={hideModal}
      className={cn(
        isDev && '__SelectTopicLanguageModal', // DEBUG
        'gap-0 text-white',
        'flex flex-col',
      )}
    >
      <div
        className={cn(
          isDev && '__SelectTopicLanguageModal_Header', // DEBUG
          !isMobile && 'max-h-[90vh]',
          'flex flex-col border-b bg-theme px-8 py-4 text-theme-foreground',
          'w-full overflow-hidden',
        )}
      >
        <DialogTitle className="DialogTitle">
          {t('SelectTopicLanguageModal.SelectLanguage')}
        </DialogTitle>
        <DialogDescription className="sr-only text-sm opacity-70">
          {t('SelectTopicLanguageModal.SelectLanguageText')}
        </DialogDescription>
      </div>
      <div className="flex flex-col px-8 py-4 text-foreground">
        <Tabs
          className={cn(
            isDev && '__SelectTopicLanguageModal_Tabs', // DEBUG
            'mt-4',
          )}
          defaultValue={langCustom ? 'Custom' : 'Predefined'}
        >
          <TabsList className={cn('__SelectTopicLanguageModal_TabsList')}>
            <TabsTrigger className="TabsTrigger" value="Predefined">
              {t('SelectTopicLanguageModal.Predefined')}
            </TabsTrigger>
            <TabsTrigger className="TabsTrigger" value="Custom">
              {t('SelectTopicLanguageModal.Custom')}
            </TabsTrigger>
          </TabsList>
          <TabsContent className="TabsContent" value="Predefined">
            <SelectLanguagePredefinedForm
              langCode={langCode}
              langName={langName}
              selectLanguage={selectLanguage}
              hideModal={hideModal}
              setAnyLanguage={setAnyLanguage}
              resetLanguage={resetLanguage}
            />
          </TabsContent>
          <TabsContent className="TabsContent" value="Custom">
            <SelectLanguageCustomForm
              langCode={langCode}
              langName={langName}
              selectLanguage={selectLanguage}
              hideModal={hideModal}
              setAnyLanguage={setAnyLanguage}
              resetLanguage={resetLanguage}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Modal>
  );
}
