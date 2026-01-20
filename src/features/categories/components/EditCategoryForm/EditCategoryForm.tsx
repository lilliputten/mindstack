'use client';

import React, { useCallback, useState } from 'react';
import Image from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale } from 'next-intl';
import { useForm, UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';

import { getErrorText, nFormatter } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { localeNames, TLocale, useT } from '@/i18n';
import { strictLocalesList } from '@/i18n/types';
import { Button } from '@/components/ui/Button';
import { FormControl, FormField, FormItem, FormMessage, FormProvider } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ScrollArea } from '@/components/ui/ScrollArea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Textarea } from '@/components/ui/Textarea';
import { FormHint } from '@/components/blocks/FormHint';
import { MarkdownHint } from '@/components/blocks/MarkdownHint';
import { SuccessSplash } from '@/components/shared';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';
import { deleteCategoryImage } from '@/features/categories/actions/deleteCategoryImage';
import { uploadCategoryImage } from '@/features/categories/actions/uploadCategoryImage';
import {
  categoryImageAllowedTypes,
  categoryImageAllowedTypesString,
  categoryImageSizeBytesLimit,
  categoryImageSizePixels,
  TCategoryImageAllowedTypes,
} from '@/features/categories/constants';
import {
  defaultCategoryStatus,
  TAvailableCategory,
  TCreateCategoryParams,
} from '@/features/categories/types';

import { convertCategoryToFormData, convertFormDataToCategory } from './helpers';
import { formSchema, TFormData } from './types';

interface TMemo {
  imageFile?: File | null;
  imagePreviewUrl?: string;
}

/** Custom function to translate double-translated edit/editNew modal form
 * texts. We're using the `ManageCategories.Edit` as a default namespace, and
 * the `ManageCategories.EditNew` as another for category creating.
 */

const autoCloseTimeout = 2000;

interface TEditCategoryFormProps {
  initialCategory?: TAvailableCategory;
  handleSaveCategory: (p: TAvailableCategory) => Promise<unknown>;
  handleClose?: () => void;
  className?: string;
  isPending?: boolean;
  /** Is it a suggestion? Then offer a limited editing mode, without a status selector */
  suggestionMode?: boolean;
  setForm?: (form?: UseFormReturn<TFormData>) => void;
  autoClose?: boolean;
}

export function EditCategoryForm(props: TEditCategoryFormProps) {
  const {
    initialCategory,
    className,
    handleSaveCategory,
    handleClose,
    isPending,
    /** Is it a suggestion? Then offer a limited editing mode */
    suggestionMode,
    setForm,
    autoClose = true,
  } = props;
  const locale = useLocale() as TLocale;

  const t = useT();

  const memo = React.useMemo<TMemo>(() => ({}), []);

  const defaultValues: TFormData = React.useMemo(
    () => ({
      status: suggestionMode ? 'SUGGESTED' : defaultCategoryStatus,
      translations: {},
    }),
    [suggestionMode],
  );

  const initialValues = React.useMemo(
    () => convertCategoryToFormData(initialCategory, { locale, suggestionMode }),
    [initialCategory, locale, suggestionMode],
  );

  const form = useForm<TFormData>({
    mode: 'onChange',
    criteriaMode: 'all',
    resolver: zodResolver(formSchema),
    defaultValues: initialValues || defaultValues,
  });

  // Form setter
  React.useEffect(() => {
    if (setForm) {
      setForm(form);
    }
  }, [form, setForm]);

  const {
    isDirty, // boolean;
    isLoading, // boolean;
    isValid, // boolean;
    isSubmitSuccessful, // boolean;
    isSubmitting, // boolean;
    // isSubmitted, // boolean;
    // isValidating, // boolean;
    // disabled, // boolean;
    // submitCount, // number;
    // dirtyFields, // Partial<Readonly<FieldNamesMarkedBoolean<TFieldValues>>>;
    // touchedFields, // Partial<Readonly<FieldNamesMarkedBoolean<TFieldValues>>>;
    // validatingFields, // Partial<Readonly<FieldNamesMarkedBoolean<TFieldValues>>>;
    // errors, // FieldErrors<TFieldValues>;
    // isReady, // boolean;
  } = form.formState;

  React.useEffect(() => {
    form.setFocus(`translations.${locale}.name`);
  }, [form, locale]);

  const [allNamesEmpty, setAllNamesEmpty] = useState(false);

  // Validate that at least one name field is filled across all translations
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // Run validation when any translation field changes
      if (!name || name.startsWith('translations')) {
        const translations = value.translations;
        if (translations) {
          const hasValidName = Object.values(translations).some(
            (translation) => translation?.name && translation.name.trim() !== '',
          );
          // Update the allNamesEmpty state
          setAllNamesEmpty(!hasValidName);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Image handling. TODO: Refactor to process the image right before the form data submiting
  const imagePreviewUrl = form.watch('imageUrl');
  memo.imagePreviewUrl = imagePreviewUrl;

  const handleImageChange = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      const file = ev.target.files?.[0];
      if (!file) {
        return;
      }
      const errors = [];
      // Validate file size
      if (file.size > categoryImageSizeBytesLimit) {
        const formattedSizeLimit = nFormatter(categoryImageSizeBytesLimit, true);
        errors.push(t('EditCategoryForm.ImageSizeError', { size: formattedSizeLimit }));
      }
      // Validate file type
      if (!categoryImageAllowedTypes.includes(file.type as TCategoryImageAllowedTypes)) {
        errors.push(
          t('EditCategoryForm.InvalidImageTypeError', {
            allowedTypes: categoryImageAllowedTypesString,
          }),
        );
      }
      if (errors.length) {
        const message = errors.join(' ');
        form.setError('imageUrl', { type: 'manual', message });
        return;
      }
      form.clearErrors('imageUrl');
      const url = URL.createObjectURL(file);
      if (memo.imagePreviewUrl) {
        URL.revokeObjectURL(memo.imagePreviewUrl);
      }
      memo.imageFile = file;
      memo.imagePreviewUrl = url;
      form.setValue('imageUrl', url, { shouldDirty: true });
    },
    [memo, form, t],
  );
  const handleRemoveImage = useCallback(() => {
    form.clearErrors('imageUrl');
    if (memo.imagePreviewUrl) {
      URL.revokeObjectURL(memo.imagePreviewUrl);
    }
    memo.imageFile = null;
    memo.imagePreviewUrl = undefined;
    form.setValue('imageUrl', undefined, { shouldDirty: true });
  }, [memo, form]);

  const uploadImageFileToVercel = useCallback(
    async (file: File) => {
      try {
        const formData = new FormData();
        formData.append('image', file);
        const result = await uploadCategoryImage(formData);
        if (!result.success || !result.data?.url) {
          const message = t('EditCategoryForm.UploadImageError');
          const error = new Error(message);
          // eslint-disable-next-line no-console
          console.error('[EditCategoryForm:uploadImageFileToVercel] Invalid result', message, {
            result,
            error,
            formData,
          });
          debugger; // eslint-disable-line no-debugger
          throw error;
        }
        const url = result?.data?.url;
        return url;
      } catch (error) {
        const message = t('EditCategoryForm.UploadImageError');
        const details = getErrorText(error);
        const comboMsg = [message, details].filter(Boolean).join(': ');
        // eslint-disable-next-line no-console
        console.error('[EditCategoryForm:uploadImageFileToVercel]', comboMsg, {
          error,
          file,
        });
        debugger; // eslint-disable-line no-debugger
        form.setError('imageUrl', { type: 'manual', message: comboMsg });
        throw new Error(comboMsg);
      }
    },
    [form, t],
  );

  const handleSubmitForm = React.useCallback(
    async (formData: TFormData) => {
      // NOTE: If `memo.imageFile` is defined then there is an image to upload
      const imageCleared = memo.imageFile === null;
      if (isDev) {
        await new Promise((r) => setTimeout(r, 2000)); // DEBUG
      }
      let newImageUrl: string | undefined;
      const convertedCategory = convertFormDataToCategory(formData, { locale, suggestionMode });
      // Compose the full data
      const updatedCategory: TAvailableCategory | TCreateCategoryParams = {
        ...initialCategory,
        ...convertedCategory,
        // Set an original image, if it wasn't removed by the user
        imageUrl: !imageCleared ? initialCategory?.imageUrl : undefined,
      };
      if (memo.imageFile) {
        newImageUrl = await uploadImageFileToVercel(memo.imageFile);
        if (newImageUrl) {
          updatedCategory.imageUrl = newImageUrl;
        }
      }
      try {
        if (isDev) {
          await new Promise((r) => setTimeout(r, 2000)); // DEBUG
        }
        const result = await handleSaveCategory(updatedCategory as TAvailableCategory);
        if (autoClose && handleClose) {
          setTimeout(() => {
            // Hide modal (go back)
            handleClose();
          }, autoCloseTimeout);
        }
        return result;
      } catch (error) {
        const message = t('EditCategoryForm.SubmitFormError');
        const details = getErrorText(error);
        const comboMsg = [message, details].filter(Boolean).join(': ');
        // eslint-disable-next-line no-console
        console.error('[EditCategoryModal:handleSubmitForm]', comboMsg, {
          error,
          details,
          updatedCategory,
          convertedCategory,
          initialCategory,
          newImageUrl,
          formData,
        });
        debugger; // eslint-disable-line no-debugger
        toast.error(comboMsg);
        // If new image has been uploaded, try to remove it
        if (newImageUrl) {
          // NOTE: Don't wait for the promise
          deleteCategoryImage(newImageUrl);
        }
      }
    },
    [
      memo.imageFile,
      locale,
      suggestionMode,
      initialCategory,
      uploadImageFileToVercel,
      handleSaveCategory,
      autoClose,
      handleClose,
      t,
    ],
  );

  const handleSubmit = React.useMemo(
    () => form.handleSubmit(handleSubmitForm),
    [form, handleSubmitForm],
  );

  const handleCloseForm = (ev: React.MouseEvent) => {
    if (handleClose) {
      handleClose();
    }
    ev.preventDefault();
  };

  const isBusy = isSubmitting || isLoading || isPending; /* || isUploading */
  const isSubmitEnabled = !isBusy && isDirty && isValid;

  const SaveIcon = !isLoading ? Icons.Save : Icons.Spinner;

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit}
        className={cn(
          isDev && '__EditCategoryForm_Form', // DEBUG
          'flex w-full flex-col gap-6 overflow-hidden py-6',
          'relative transition',
          isBusy && 'opacity-50',
        )}
      >
        {isSubmitSuccessful ? (
          <SuccessSplash title={t('EditCategoryForm.SuccessfullySavedTitle')} className="px-6">
            {t('EditCategoryForm.SuccessfullySavedMessage')}
            {/* The dialog will be closed automatically. */}
          </SuccessSplash>
        ) : (
          <ScrollArea
            className={cn(
              isDev && '__EditCategoryForm_RootScroll', // DEBUG
              'flex flex-1 flex-col',
              className,
            )}
            viewportClassName={cn(
              isDev && '__EditCategoryForm_ScrollViewport',
              'flex flex-1 flex-col',
              '[&>div]:flex-col [&>div]:flex-1 [&>div]:justify-center [&>div]:items-center',
            )}
          >
            <div
              className={cn(
                isDev && '__EditCategoryForm_Fields', // DEBUG
                'relative flex w-full flex-col gap-4 px-6',
              )}
            >
              {/* Image Upload */}
              <FormField
                name="imageUrl"
                control={form.control}
                render={() => (
                  <FormItem
                    className={cn(
                      isDev && '__EditCategoryForm_Image', // DEBUG
                      'flex w-full flex-col gap-4',
                    )}
                  >
                    <Label>{t('EditCategoryForm.ImageLabel')}</Label>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        <Label
                          className={cn(
                            isDev && '__EditCategoryForm_ImagePreview', // DEBUG
                            'relative flex size-32 cursor-pointer items-center justify-center overflow-hidden rounded-lg border',
                          )}
                          title={t('EditCategoryForm.SelectImage')}
                        >
                          <input
                            type="file"
                            accept={categoryImageAllowedTypes.join(',')}
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          {imagePreviewUrl ? (
                            <>
                              <Image
                                src={imagePreviewUrl}
                                alt="Category image"
                                fill
                                className="object-cover"
                              />
                              <Button
                                type="button"
                                onClick={(ev) => {
                                  ev.preventDefault();
                                  handleRemoveImage();
                                }}
                                size="iconSm"
                                className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                                title={t('EditCategoryForm.RemoveImage')}
                              >
                                <Icons.X className="h-3 w-3" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Icons.ImageIcon className="m-auto size-8 text-muted-foreground" />
                            </>
                          )}
                        </Label>
                        <div className="flex flex-1 flex-col gap-2">
                          <FormHint>
                            {t('EditCategoryForm.ImageHintText', {
                              sizePixels: categoryImageSizePixels,
                              sizeBytesLimit: nFormatter(categoryImageSizeBytesLimit, true),
                            })}
                          </FormHint>
                          <FormMessage />
                        </div>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* General error message when all names are empty */}
              {allNamesEmpty && (
                <div
                  className={cn(
                    isDev && '__EditCategoryForm_Error', // DEBUG
                    'flex items-center gap-2 rounded-md border border-red-500/30 p-2',
                  )}
                >
                  <Icons.CircleAlert className="size-6 flex-shrink-0 text-red-500" />
                  <p className="flex-1 text-sm text-red-500">
                    {t('EditCategoryForm.AllNamesEmptyError')}
                  </p>
                </div>
              )}

              {/* Status */}
              {!suggestionMode && (
                <FormField
                  name="status"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem
                      className={cn(
                        isDev && '__EditCategoryForm_status', // DEBUG
                        'flex w-full flex-col gap-4',
                      )}
                    >
                      <Label htmlFor="category-status">{t('EditCategoryForm.StatusLabel')}</Label>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger id="category-status">
                            <SelectValue
                              placeholder={t('EditCategoryForm.SelectStatusPlaceholder')}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PUBLIC">
                            {t('EditCategoryForm.PublicOption')}
                          </SelectItem>
                          <SelectItem value="SUGGESTED">
                            {t('EditCategoryForm.SuggestedOption')}
                          </SelectItem>
                          <SelectItem value="HIDDEN">
                            {t('EditCategoryForm.HiddenOption')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Instruction for users */}
              <div
                className={cn(
                  isDev && '__EditCategoryForm_Info', // DEBUG
                  'flex items-center gap-2 rounded-md border border-theme/20 p-2',
                )}
              >
                <Icons.Info className="size-6 flex-shrink-0 text-theme" />
                <p className="flex-1 text-sm opacity-50">
                  {t('EditCategoryForm.CategoryPropertiesInstruction')}
                </p>
              </div>

              {/* Translations Tabs */}
              <Tabs
                className={cn(
                  isDev && '__EditCategoryForm_Translations_Tabs', // DEBUG
                  'flex flex-col items-stretch gap-2',
                )}
                defaultValue={locale}
              >
                <TabsList
                  className={cn(
                    isDev && '__EditCategoryForm_TabsList', // DEBUG
                    'flex justify-start gap-1',
                  )}
                >
                  {strictLocalesList.map((locale) => (
                    <TabsTrigger
                      key={locale}
                      className={cn(
                        isDev && '__EditCategoryForm_TabsTrigger', // DEBUG
                        'block flex-1 truncate',
                      )}
                      value={locale}
                    >
                      {localeNames[locale]} ({locale})
                    </TabsTrigger>
                  ))}
                </TabsList>

                {strictLocalesList.map((locale) => (
                  <TabsContent
                    key={locale}
                    className={cn(
                      isDev && '__EditCategoryForm_TabsContent', // DEBUG
                      'flex-col items-start gap-4',
                      'data-[state=active]:flex',
                    )}
                    value={locale}
                  >
                    {/* Name for {locale} */}
                    <FormField
                      name={`translations.${locale}.name`}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem
                          className={cn(
                            isDev && `__EditCategoryForm_name_${locale}`, // DEBUG
                            'flex w-full flex-col gap-4',
                          )}
                        >
                          <Label htmlFor={`category-name-${locale}`}>
                            {t('EditCategoryForm.NameWithLocale', { locale })}
                          </Label>
                          <FormControl>
                            <Input
                              id={`category-name-${locale}`}
                              type="text"
                              placeholder={t('EditCategoryForm.EnterCategoryNamePlaceholder', {
                                locale,
                              })}
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormHint>{t('EditCategoryForm.CategoryNameHint')}</FormHint>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Description for {locale} */}
                    <FormField
                      name={`translations.${locale}.description`}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem
                          className={cn(
                            isDev && `__EditCategoryForm_description_${locale}`, // DEBUG
                            'flex w-full flex-col gap-4',
                          )}
                        >
                          <Label htmlFor={`category-description-${locale}`}>
                            {t('EditCategoryForm.DescriptionWithLocale', { locale })}
                          </Label>
                          <FormControl>
                            <Textarea
                              id={`category-description-${locale}`}
                              placeholder={t(
                                'EditCategoryForm.EnterCategoryDescriptionPlaceholder',
                                { locale },
                              )}
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormHint>
                            {t('EditCategoryForm.CategoryDescriptionHint')} <MarkdownHint />
                          </FormHint>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Keywords for {locale} */}
                    <FormField
                      name={`translations.${locale}.keywords`}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem
                          className={cn(
                            isDev && `__EditCategoryForm_keywords_${locale}`, // DEBUG
                            'flex w-full flex-col gap-4',
                          )}
                        >
                          <Label htmlFor={`category-keywords-${locale}`}>
                            {t('EditCategoryForm.KeywordsWithLocale', { locale })}
                          </Label>
                          <FormControl>
                            <Input
                              id={`category-keywords-${locale}`}
                              type="text"
                              placeholder={t('EditCategoryForm.EnterKeywordsPlaceholder', {
                                locale,
                              })}
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormHint>{t('EditCategoryForm.KeywordsHintText')}</FormHint>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </ScrollArea>
        )}

        {/* Actions */}
        <div
          className={cn(
            isDev && '__EditCategoryForm_Actions', // DEBUG
            'flex w-full gap-4 px-6',
            isSubmitSuccessful && 'justify-center',
          )}
        >
          <Button
            type="submit"
            variant={isSubmitEnabled ? 'success' : 'disabled'}
            disabled={!isSubmitEnabled}
            className={cn(
              isDev && '__EditCategoryForm_SaveButton', // DEBUG
              'gap-2',
              isSubmitSuccessful && 'hidden',
            )}
          >
            {isBusy ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-theme border-t-transparent" />
                <span>{t('EditCategoryForm.SavingText')}</span>
              </>
            ) : (
              <>
                <SaveIcon className={cn('h-4 w-4', isBusy && 'animate-spin')} />
                <span>{t('EditCategoryForm.SaveText')}</span>
              </>
            )}
          </Button>
          <Button
            variant={isSubmitSuccessful ? 'theme' : 'ghost'}
            onClick={handleCloseForm}
            className="gap-2"
          >
            <span>
              {isSubmitSuccessful
                ? t('EditCategoryForm.CloseText')
                : t('EditCategoryForm.CancelText')}
            </span>
          </Button>
        </div>

        {/* LoadingSplash */}
        <div
          className={cn(
            isDev && '__EditCategoryForm_LoadingSplash', // DEBUG
            'absolute',
            'inset-0 flex flex-col items-center justify-center gap-4 transition',
            'my-2 bg-background',
            'opacity-50',
            !isBusy && 'pointer-events-none opacity-0',
          )}
        >
          <Icons.Spinner className="size-16 animate-spin text-theme" />
        </div>
      </form>
    </FormProvider>
  );
}
