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
}

export function SelectTopicLanguageModal(props: TSelectTopicLanguageModalProps) {
  const { langCode, langName, langCustom, topicId } = props;
  const router = useRouter();
  const hideModal = React.useCallback(() => router.back(), [router]);
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
      const topicLang: TSelectTopicLanguageData = { topicId, ...selectedLanguage };
      const event = new CustomEvent<TSelectTopicLanguageData>(selectTopicEventName, {
        detail: topicLang,
        bubbles: true,
      });
      window.dispatchEvent(event);
      // Close the modal
      hideModal();
    },
    [hideModal, topicId],
  );

  return (
    <Modal
      isVisible
      hideModal={hideModal}
      className={cn(
        isDev && '__SelectTopicLanguageModal', // DEBUG
        'gap-0 text-white',
        // isPending && '[&>*]:pointer-events-none [&>*]:opacity-50',
      )}
    >
      <div
        className={cn(
          isDev && '__SelectTopicLanguageModal_Header', // DEBUG
          !isMobile && 'max-h-[90vh]',
          'flex flex-col border-b bg-theme px-8 py-4 text-theme-foreground',
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
              selectLanguage={selectLanguage}
              langCode={langCode}
              langName={langName}
            />
          </TabsContent>
          <TabsContent className="TabsContent" value="Custom">
            <SelectLanguageCustomForm
              selectLanguage={selectLanguage}
              langCode={langCode}
              langName={langName}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Modal>
  );
}
