'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';

import {
  defaultThemeColor,
  themeColorData,
  themeColorIds,
  TThemeColorId,
} from '@/config/themeColors';
import {
  defaultSystemTheme,
  systemThemeIcons,
  systemThemeIds,
  TSystemThemeId,
} from '@/config/themes';
import { TPropsWithChildren } from '@/lib/types';
import { cn } from '@/lib/utils';
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
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { TSettings } from '@/features/settings/types';
import { localeNames, localesList, useT } from '@/i18n';

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

function FormSection({ children }: TPropsWithChildren) {
  return (
    <div
      className={cn(
        isDev && '__SettingsFormFields_FormSection', // DEBUG
        'flex w-full flex-1 flex-col gap-6 py-2 md:w-[45%]',
      )}
    >
      {children}
    </div>
  );
}

export function SettingsFormFields(props: TSettingsFormFieldsProps) {
  const { className, form, selectLanguage } = props;

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
    () => ({ ...localeNames, auto: 'Auto' }),
    [],
  );

  return (
    <div
      className={cn(
        isDev && '__SettingsFormFields', // DEBUG
        'flex w-full flex-col gap-6 px-8 md:flex-row',
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
              <Label htmlFor={showOnlyMyTopicsKey}>Show only my own topics?</Label>
              <FormControl>
                <Switch
                  id={showOnlyMyTopicsKey}
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormHint>Disable showing all public topics, show only my personal ones.</FormHint>
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
              <Label htmlFor={jumpToNewEntitiesKey}>Jump to newly created entities?</Label>
              <FormControl>
                <Switch
                  id={jumpToNewEntitiesKey}
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormHint>
                Switch to editing forms for newly created objects (like topics, questions, answers)
                after creation.
              </FormHint>
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
                <Label htmlFor={themeKey}>Application theme</Label>
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
                    <SelectValue placeholder="Select theme…" />
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
                <FormHint>Select the application theme.</FormHint>
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
                <Label htmlFor={themeColorKey}>Theme color</Label>
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
                    <SelectValue placeholder="Select theme color…" />
                  </SelectTrigger>
                  <SelectContent>
                    {themeColorIds.map((id) => {
                      const color = themeColorData[id].color;
                      return (
                        <SelectItem
                          key={id}
                          value={id}
                          className={cn(
                            isDev && '__ThemeSelect_SelectItem', // DEBUG
                            '[&>span]:flex [&>span]:items-center [&>span]:gap-2',
                          )}
                        >
                          <span className="size-6 rounded-sm" style={{ backgroundColor: color }} />
                          {tThemes(id)}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormHint>Select the application key theme color.</FormHint>
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
                <Label htmlFor={localeKey}>Application language</Label>
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
                    <SelectValue placeholder="Select language…" />
                  </SelectTrigger>
                  <SelectContent>
                    {extendedLocalesList.map((locale) => (
                      <SelectItem key={locale} value={locale}>
                        {extendedLocaleNames[locale] || locale}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormHint>Select the application language.</FormHint>
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
                <Label htmlFor={langCodeKey}>Topics language</Label>
                <Button
                  id={langCodeKey}
                  variant="ghostForm"
                  onClick={selectLanguage}
                  className="flex w-full justify-stretch gap-4 text-left"
                >
                  <span className="flex-1 truncate">
                    {langName ? (
                      <strong className="truncate">{langName}</strong>
                    ) : (
                      <>Select language</>
                    )}
                  </span>
                  {langCode && <span className="opacity-50">{langCode}</span>}
                  {langCustom && (
                    <span className="opacity-50">
                      <Icons.Edit className="size-3" />
                    </span>
                  )}
                  {langCode && <Icons.Close onClick={resetLang} className="size-4" />}
                </Button>
                <FormHint>
                  Specify a language if you want to see the topics only for this specific language.
                </FormHint>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </FormSection>
    </div>
  );
}
