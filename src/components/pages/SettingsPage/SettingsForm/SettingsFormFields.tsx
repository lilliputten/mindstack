'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';

import { defaultThemeColor, themeColorIds, TThemeColorId } from '@/config/themeColors';
import {
  defaultSystemTheme,
  systemThemeIcons,
  systemThemeIds,
  TSystemThemeId,
} from '@/config/themes';
import { cn } from '@/lib/utils';
import { localeNames, localesList, useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/Form';
import { Label } from '@/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { FormHint } from '@/components/blocks/FormHint';
import { FormColumns, FormSection, LanguageName } from '@/components/shared';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { TSettings } from '@/features/settings/types';

import { TSettingsFormData } from './types';

const extendedLocalesList = ['auto', ...localesList];

interface TSettingsFormFieldsProps {
  settings: TSettings;
  isSubmitEnabled?: boolean;
  isPending?: boolean;
  onCancel?: (ev: React.MouseEvent) => void;
  form: UseFormReturn<TSettingsFormData>;
  className?: string;
  selectLanguage: (ev: React.MouseEvent) => void;
}

export function SettingsFormFields(props: TSettingsFormFieldsProps) {
  const { className, form, selectLanguage } = props;

  const t = useT();

  // Translations (Issue #39)
  const tNavModeToggle = useT('NavModeToggle');
  const tThemes = useT('Themes');

  // Keys...
  const showOnlyMyTopicsKey = React.useId();
  const jumpToNewEntitiesKey = React.useId();
  const localeKey = React.useId();
  const themeColorKey = React.useId();
  const themeKey = React.useId();
  const langCodeKey = React.useId();

  // Reset language
  const resetLang = (ev: React.MouseEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
    const opts = { shouldDirty: true, shouldValidate: true };
    form.setValue('langCode', undefined, opts);
    form.setValue('langName', undefined, opts);
    form.setValue('langCustom', undefined, opts);
  };

  const extendedLocaleNames = React.useMemo<Record<string, string>>(
    () => ({ ...localeNames, auto: t('SettingsFormFields.AutoOption') }),
    [t],
  );

  return (
    <FormColumns
      className={cn(
        isDev && '__SettingsFormFields', // DEBUG
        'px-6',
        className,
      )}
    >
      <FormSection>
        {/* showOnlyMyTopics */}
        <FormField
          name="showOnlyMyTopics"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-4">
              <Label htmlFor={showOnlyMyTopicsKey}>
                {t('SettingsFormFields.ShowOnlyMyTopicsLabel')}
              </Label>
              <FormControl>
                <Switch
                  id={showOnlyMyTopicsKey}
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormHint>{t('SettingsFormFields.ShowOnlyMyTopicsHint')}</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* jumpToNewEntities */}
        <FormField
          name="jumpToNewEntities"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-4">
              <Label htmlFor={jumpToNewEntitiesKey}>
                {t('SettingsFormFields.JumpToNewEntitiesLabel')}
              </Label>
              <FormControl>
                <Switch
                  id={jumpToNewEntitiesKey}
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormHint>{t('SettingsFormFields.JumpToNewEntitiesHint')}</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* // DEBUG: Sample text fields, see src/features/settings/types/settings.ts
        <FormField
          name="testInput"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-4">
              <Label htmlFor={testInputKey}>Test input</Label>
              <FormControl>
                <Input
                  id={testInputKey}
                  placeholder="Test input"
                  {...field}
                  // onChange={(ev) => field.onChange(Number(ev.target.value) || '')}
                />
              </FormControl>
              <FormHint>Test input</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="testTextarea"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-4">
              <Label htmlFor={testTextareaKey}>Test textarea</Label>
              <FormControl>
                <Textarea
                  id={testTextareaKey}
                  placeholder="Test textarea"
                  rows={5}
                  {...field}
                  // onChange={(ev) => field.onChange(ev)}
                />
              </FormControl>
              <FormHint>Test textarea</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
        */}
      </FormSection>
      <FormSection>
        {/* theme */}
        <FormField
          name="theme"
          control={form.control}
          render={() => {
            const value = (form.watch('theme') || defaultSystemTheme) as TSystemThemeId;
            return (
              <FormItem className="flex w-full flex-col gap-4">
                <Label htmlFor={themeKey}>{t('SettingsFormFields.ThemeLabel')}</Label>
                <Select
                  // open // DEBUG
                  value={value}
                  onValueChange={(value) => {
                    form.setValue('theme', value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                >
                  <SelectTrigger
                    className={cn(
                      isDev && '__ThemeSelect_SelectTrigger', // DEBUG
                      'flex flex-1',
                      '[&>span]:flex [&>span]:items-center [&>span]:gap-2',
                    )}
                    aria-label="Theme"
                  >
                    <SelectValue placeholder={t('SettingsFormFields.ThemePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {systemThemeIds.map((id) => {
                      const ThemeIcon = systemThemeIcons[id];
                      return (
                        <SelectItem
                          key={id}
                          value={id}
                          className={cn(
                            isDev && '__ThemeSelect_SelectItem', // DEBUG
                            '[&>span]:flex [&>span]:items-center [&>span]:gap-2',
                          )}
                        >
                          <ThemeIcon className="opacity-50" />
                          {tNavModeToggle(id)}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormHint>{t('SettingsFormFields.ThemeHint')}</FormHint>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        {/* themeColor */}
        <FormField
          name="themeColor"
          control={form.control}
          render={() => {
            const value = (form.watch('themeColor') || defaultThemeColor) as TThemeColorId;
            // themeColorData
            return (
              <FormItem className="flex w-full flex-col gap-4">
                <Label htmlFor={themeColorKey}>{t('SettingsFormFields.ThemeColorLabel')}</Label>
                <Select
                  // open // DEBUG
                  value={value}
                  onValueChange={(value) => {
                    form.setValue('themeColor', value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                >
                  <SelectTrigger
                    className={cn(
                      isDev && '__ThemeSelect_SelectTrigger', // DEBUG
                      'flex flex-1',
                      '[&>span]:flex [&>span]:items-center [&>span]:gap-2',
                    )}
                    aria-label="Theme"
                  >
                    <SelectValue placeholder={t('SettingsFormFields.ThemeColorPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {themeColorIds.map((id) => {
                      return (
                        <SelectItem
                          key={id}
                          value={id}
                          className={cn(
                            isDev && '__ThemeSelect_SelectItem', // DEBUG
                            '[&>span]:flex [&>span]:items-center [&>span]:gap-2',
                          )}
                        >
                          <span
                            className={cn(
                              isDev && `__ThemeSelect_SelectItem_${id}`, // DEBUG
                              'flex size-6 items-end gap-[2px] overflow-hidden rounded-sm p-1',
                            )}
                            style={{ backgroundColor: `var(--color-${id})` }}
                          >
                            <span
                              className="size-1.5 h-full"
                              style={{ backgroundColor: `var(--color-${id}-triadic1)` }}
                            />
                            <span
                              className="size-1.5 h-full border border-transparent"
                              style={{ backgroundColor: `var(--color-${id}-complementary)` }}
                            />
                            <span
                              className="size-1.5 h-full"
                              style={{ backgroundColor: `var(--color-${id}-triadic2)` }}
                            />
                          </span>
                          {tThemes(id)}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormHint>{t('SettingsFormFields.ThemeColorHint')}</FormHint>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        {/* locale */}
        <FormField
          name="locale"
          control={form.control}
          render={() => {
            const value = form.watch('locale') || 'auto';
            return (
              <FormItem className="flex w-full flex-col gap-4">
                <Label htmlFor={localeKey}>{t('SettingsFormFields.LocaleLabel')}</Label>
                <Select
                  value={value}
                  onValueChange={(value) => {
                    form.setValue('locale', value !== 'auto' ? value : undefined, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                >
                  <SelectTrigger
                    className={cn(
                      isDev && '__SettingsFormFields_SelectTrigger', // DEBUG
                      'flex-1',
                    )}
                    aria-label="Application language"
                  >
                    <SelectValue placeholder={t('SettingsFormFields.LocalePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {extendedLocalesList.map((locale) => (
                      <SelectItem key={locale} value={locale}>
                        {extendedLocaleNames[locale] || locale}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormHint>{t('SettingsFormFields.LocaleHint')}</FormHint>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        {/* langCode */}
        <FormField
          name="langCode"
          control={form.control}
          render={() => {
            const [langCode, langName, langCustom] = form.watch([
              'langCode',
              'langName',
              'langCustom',
            ]);
            return (
              <FormItem className="flex w-full flex-col gap-4">
                <Label htmlFor={langCodeKey}>{t('SettingsFormFields.TopicsLanguageLabel')}</Label>
                <Button
                  id={langCodeKey}
                  variant="ghostForm"
                  onClick={selectLanguage}
                  className="flex w-full justify-stretch gap-4 text-left"
                >
                  <span className="flex-1 truncate">
                    {langCode || langName ? (
                      <LanguageName langCode={langCode} langName={langName} />
                    ) : (
                      <>{t('SettingsFormFields.SelectLanguageButton')}</>
                    )}
                  </span>
                  {langCustom && (
                    <span className="opacity-50">
                      <Icons.Edit className="size-3" />
                    </span>
                  )}
                  {langCode && <Icons.Close onClick={resetLang} className="size-4" />}
                </Button>
                <FormHint>{t('SettingsFormFields.TopicsLanguageHint')}</FormHint>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </FormSection>
    </FormColumns>
  );
}
