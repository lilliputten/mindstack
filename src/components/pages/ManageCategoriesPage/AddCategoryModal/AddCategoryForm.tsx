'use client';

import React, { useCallback, useState } from 'react';
import Image from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { CategoryStatusSchema, CategoryStatusType } from '@/generated/prisma';

import { getErrorText, nFormatter } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { localeNames, TLocale, useT } from '@/i18n';
import { strictLocalesList } from '@/i18n/types';
import { Button } from '@/components/ui/Button';
import { FormControl, FormField, FormItem, FormMessage, FormProvider } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
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
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';
import { deleteCategoryImage } from '@/features/categories/actions/deleteCategoryImage';
import { uploadCategoryImage } from '@/features/categories/actions/uploadCategoryImage';
import {
  categoryImageAllowedTypes,
  categoryImageAllowedTypesString,
  categoryImageConfig,
  categoryImageSizeLimit,
  TCategoryImageAllowedTypes,
} from '@/features/categories/constants';
import { defaultCategoryStatus, TCreateCategoryParams } from '@/features/categories/types';

const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_KEYWORDS_LENGTH = 200;

type TAddCategoryParams = TCreateCategoryParams;

interface TFormData {
  status: CategoryStatusType;
  imageUrl?: string;
  // NOTE: Use translated values, according to `strictLocalesList`
  translations: {
    [K in TLocale]?: {
      name: string;
      description: string;
      keywords: string;
    };
  };
}

export interface TAddCategoryFormProps {
  initialCategory?: TCreateCategoryParams;
  handleAddCategory: (p: TAddCategoryParams) => Promise<unknown>;
  handleClose?: () => void;
  className?: string;
  isPending?: boolean;
  /** Is the dialog in edit or add mode? */
  editMode?: boolean;
  /** Is it a suggestion? Then offer a limited editing mode, without a status selector */
  suggestionMode?: boolean;
}

interface TConvertFormDataOptions {
  locale: TLocale;
  suggestionMode?: boolean;
}

function convertFormDataToCategory(formData: TFormData, _opts: TConvertFormDataOptions) {
  /* // UNUSE: Options
   * const {
   *   locale,
   *   suggestionMode,
   * } = opts;
   */
  const { status, imageUrl, translations } = formData;

  // Convert the translations object to an array of CategoryTranslation objects
  const translationArray = Object.entries(translations).map(([localeKey, translationData]) => ({
    locale: localeKey,
    name: translationData.name || '',
    description: translationData.description,
    keywords: translationData.keywords,
  }));

  const category: TCreateCategoryParams = {
    status,
    imageUrl,
    translations: translationArray,
  };
  return category;
}

function convertCategoryToFormData(
  category: TCreateCategoryParams | undefined,
  opts: TConvertFormDataOptions,
) {
  if (!category) {
    return undefined;
  }
  const {
    // locale,
    suggestionMode,
  } = opts;

  // Convert the translations array to an object keyed by locale
  const translations: TFormData['translations'] = {};
  if (category.translations) {
    category.translations.forEach((translation) => {
      translations[translation.locale as TLocale] = {
        name: translation.name,
        description: translation.description || '',
        keywords: translation.keywords || '',
      };
    });
  }

  const formData: TFormData = {
    status: category.status || (suggestionMode ? 'SUGGESTED' : defaultCategoryStatus),
    imageUrl: category.imageUrl || undefined,
    translations,
  };
  return formData;
}

interface TMemo {
  imageFile?: File | null;
  imagePreviewUrl?: string;
}

/** Custom function to translate double-translated edit/editNew modal form
 * texts. We're using the `ManageCategories.Edit` as a default namespace, and
 * the `ManageCategories.EditNew` as another for category creating.
 */
export function useTranslations(defaultNamespace: 'ManageCategories.Edit', editMode?: boolean) {
  const namespace = editMode ? defaultNamespace : defaultNamespace + 'New';
  return useT(namespace);
}

export function AddCategoryForm(props: TAddCategoryFormProps) {
  const {
    initialCategory,
    className,
    handleAddCategory,
    handleClose,
    isPending,
    /** Is the dialog in edit or add mode? */
    editMode,
    /** Is it a suggestion? Then offer a limited editing mode */
    suggestionMode,
  } = props;
  const locale = useLocale() as TLocale;

  /** We're using the `ManageCategories.Edit` as a default namespace, and the
   * `ManageCategories.EditNew` as another for category creating
   */
  const _t = useTranslations('ManageCategories.Edit', editMode);

  const memo = React.useMemo<TMemo>(() => ({}), []);

  // TODO: Add a service to translate other texts?
  const formSchema = React.useMemo(
    () =>
      z
        .object({
          status: CategoryStatusSchema,
          imageUrl: z.string().optional(),
          translations: z.record(
            z.string(),
            z.object({
              name: z.preprocess(
                (val) => (val === '' ? undefined : val),
                z.string().min(MIN_NAME_LENGTH).max(MAX_NAME_LENGTH).optional(),
              ),
              description: z.string().max(MAX_DESCRIPTION_LENGTH).optional(),
              keywords: z.string().max(MAX_KEYWORDS_LENGTH).optional(),
            }),
          ),
        })
        .refine(
          (data) => {
            // Check if at least one translation has a valid name
            const translations = data.translations;
            if (!translations) return false;
            return Object.values(translations).some(
              (translation) => translation.name !== undefined && translation.name.trim() !== '',
            );
          },
          {
            message: 'At least one name field must be filled across all translations',
            path: ['translations'], // Error will appear at the translations level
          },
        ),
    [],
  );

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
      if (file.size > categoryImageSizeLimit) {
        const formattedSizeLimit = nFormatter(categoryImageSizeLimit);
        errors.push(`Image size must be less than ${formattedSizeLimit}B`);
      }
      // Validate file type
      if (!categoryImageAllowedTypes.includes(file.type as TCategoryImageAllowedTypes)) {
        errors.push(`Invalid image type. Allowed types: ${categoryImageAllowedTypesString}`);
      }
      if (errors.length) {
        const message = errors.join(' ');
        form.setError('imageUrl', { type: 'manual', message });
        return;
      }
      form.clearErrors('imageUrl');
      const url = URL.createObjectURL(file);
      console.log('[AddCategoryForm:handleImageChange] before', {
        url,
        file,
      });
      if (memo.imagePreviewUrl) {
        URL.revokeObjectURL(memo.imagePreviewUrl);
      }
      memo.imageFile = file;
      memo.imagePreviewUrl = url;
      form.setValue('imageUrl', url, { shouldDirty: true });
    },
    [memo, form],
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
        console.log('[AddCategoryForm:uploadImageFileToVercel] before', {
          file,
          formData,
        });
        const result = await uploadCategoryImage(formData);
        if (!result.success || !result.data?.url) {
          const message = 'Failed to upload image';
          const error = new Error(message);
          // eslint-disable-next-line no-console
          console.error('[AddCategoryForm:uploadImageFileToVercel] Invalid result', message, {
            result,
            error,
            formData,
          });
          debugger; // eslint-disable-line no-debugger
          throw error;
        }
        const url = result?.data?.url;
        console.log('[AddCategoryForm:uploadImageFileToVercel] success', {
          url,
        });
        debugger;
        return url;
      } catch (error) {
        const message = 'Failed to upload image';
        const details = getErrorText(error);
        const comboMsg = [message, details].filter(Boolean).join(': ');
        // eslint-disable-next-line no-console
        console.error('[AddCategoryForm:uploadImageFileToVercel]', comboMsg, {
          error,
          file,
        });
        debugger; // eslint-disable-line no-debugger
        form.setError('imageUrl', { type: 'manual', message: comboMsg });
        throw new Error(comboMsg);
      }
    },
    [form],
  );

  const handleSubmitForm = React.useCallback(
    async (formData: TFormData) => {
      // setIsUploading(true);
      // NOTE: If `memo.imageFile` is defined then there is an image to upload
      const imageCleared = memo.imageFile === null;
      if (isDev) {
        await new Promise((r) => setTimeout(r, 2000)); // DEBUG
      }
      let newImageUrl: string | undefined;
      const convertedCategory = convertFormDataToCategory(formData, { locale, suggestionMode });
      // Compose the full data
      const newCategory = {
        ...initialCategory,
        ...convertedCategory,
        // Set an original image, if it wasn't removed by the user
        imageUrl: !imageCleared ? initialCategory?.imageUrl : undefined,
      };
      console.log('[AddCategoryForm:handleSubmitForm] before uploading image', {
        newCategory,
        initialCategory,
        convertedCategory,
        formData,
      });
      debugger;
      if (memo.imageFile) {
        newImageUrl = await uploadImageFileToVercel(memo.imageFile);
        if (newImageUrl) {
          newCategory.imageUrl = newImageUrl;
        }
      }
      try {
        console.log('[AddCategoryForm:handleSubmitForm] before adding', {
          newCategory,
          convertedCategory,
          initialCategory,
          newImageUrl,
          formData,
        });
        debugger;
        if (isDev) {
          await new Promise((r) => setTimeout(r, 2000)); // DEBUG
        }
        return await handleAddCategory(newCategory);
      } catch (error) {
        const message = 'Failed to submit form data';
        const details = getErrorText(error);
        const comboMsg = [message, details].filter(Boolean).join(': ');
        // eslint-disable-next-line no-console
        console.error('[AddCategoryModal:handleSubmitForm]', comboMsg, {
          error,
          details,
          newCategory,
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
      } finally {
        // setIsUploading(false);
      }
    },
    [memo, handleAddCategory, initialCategory, locale, suggestionMode, uploadImageFileToVercel],
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
        onSubmit={form.handleSubmit(handleSubmitForm)}
        className={cn(
          isDev && '__AddCategoryForm', // DEBUG
          'flex w-full flex-col gap-4',
          'relative transition',
          isBusy && 'opacity-50',
          className,
        )}
      >
        {/* Actions */}
        {isSubmitSuccessful ? (
          <div
            className={cn(
              isDev && '__AddCategoryForm_Success', // DEBUG
              // 'absolute',
              'inset-0 flex flex-col items-center justify-center gap-4 transition',
              'my-2 bg-background',
              !isSubmitSuccessful && 'pointer-events-none opacity-0',
            )}
          >
            <Icons.CheckCircle className="mt-2 size-16 text-green-500" />
            <div className="flex flex-col gap-4 text-center">
              <h3 className="text-xl font-semibold text-green-500">Successfully Added!</h3>
              <p className="text-content">
                The category has been successfully added to your list. You can now close this
                dialog.
              </p>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              isDev && '__AddCategoryForm_Fields', // DEBUG
              'relative flex w-full flex-col gap-4',
            )}
          >
            {/* Image Upload */}
            <FormField
              name="imageUrl"
              control={form.control}
              render={() => (
                <FormItem
                  className={cn(
                    isDev && '__AddCategoryForm_imageUrl', // DEBUG
                    'flex w-full flex-col gap-4',
                  )}
                >
                  <Label>Image</Label>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      {imagePreviewUrl ? (
                        <div
                          className={cn(
                            isDev && '__AddCategoryForm_imageUrl_Preview', // DEBUG
                            'relative h-24 w-24 overflow-hidden rounded-lg border',
                          )}
                        >
                          <Image
                            src={imagePreviewUrl}
                            alt="Category image"
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                          >
                            <Icons.X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <label
                          className={cn(
                            isDev && '__AddCategoryForm_imageUrl_Info', // DEBUG
                            'flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:bg-muted',
                          )}
                        >
                          <input
                            type="file"
                            accept={categoryImageAllowedTypes.join(',')}
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          <Icons.ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </label>
                      )}
                      <div className="flex flex-1 flex-col gap-2">
                        <FormHint>
                          Maximum size: {categoryImageConfig.size}x{categoryImageConfig.size}px
                        </FormHint>
                        <FormMessage />
                      </div>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Instruction for users */}
            <div
              className={cn(
                isDev && '__AddCategoryForm_Info', // DEBUG
                'flex items-center gap-2 rounded-md border border-theme/20 p-2',
              )}
            >
              <Icons.Info className="size-6 flex-shrink-0 text-theme" />
              <p className="flex-1 text-sm opacity-50">
                Please enter the properties of the category (name, description, keywords) for all or
                only one of the application languages.
              </p>
            </div>

            {/* General error message when all names are empty */}
            {allNamesEmpty && (
              <div
                className={cn(
                  isDev && '__AddCategoryForm_Error', // DEBUG
                  'flex items-center gap-2 rounded-md border border-red-500/30 p-2',
                )}
              >
                <Icons.CircleAlert className="size-6 flex-shrink-0 text-red-500" />
                <p className="flex-1 text-sm text-red-500">
                  At least one name field must be filled across all translations
                </p>
              </div>
            )}

            {/* Translations Tabs */}
            <Tabs
              className={cn(
                isDev && '__AddCategoryForm_Translations_Tabs', // DEBUG
                'flex flex-col items-stretch gap-2',
              )}
              defaultValue={locale}
            >
              <TabsList
                className={cn(
                  isDev && '__AddCategoryForm_TabsList', // DEBUG
                  'flex justify-start gap-1',
                )}
              >
                {strictLocalesList.map((locale) => (
                  <TabsTrigger
                    key={locale}
                    className={cn(
                      isDev && '__AddCategoryForm_TabsTrigger', // DEBUG
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
                    isDev && '__AddCategoryForm_TabsContent', // DEBUG
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
                          isDev && `__AddCategoryForm_name_${locale}`, // DEBUG
                          'flex w-full flex-col gap-4',
                        )}
                      >
                        <Label htmlFor={`category-name-${locale}`}>Name ({locale})</Label>
                        <FormControl>
                          <Input
                            id={`category-name-${locale}`}
                            type="text"
                            placeholder={`Enter category name in ${locale}`}
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
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
                          isDev && `__AddCategoryForm_description_${locale}`, // DEBUG
                          'flex w-full flex-col gap-4',
                        )}
                      >
                        <Label htmlFor={`category-description-${locale}`}>
                          Description ({locale})
                        </Label>
                        <FormControl>
                          <Textarea
                            id={`category-description-${locale}`}
                            placeholder={`Enter category description in ${locale}`}
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
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
                          isDev && `__AddCategoryForm_keywords_${locale}`, // DEBUG
                          'flex w-full flex-col gap-4',
                        )}
                      >
                        <Label htmlFor={`category-keywords-${locale}`}>Keywords ({locale})</Label>
                        <FormControl>
                          <Input
                            id={`category-keywords-${locale}`}
                            type="text"
                            placeholder={`Enter keywords separated by commas in ${locale}`}
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormHint>Keywords help with search and categorization</FormHint>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              ))}
            </Tabs>

            {/* Status */}
            {!suggestionMode && (
              <FormField
                name="status"
                control={form.control}
                render={({ field }) => (
                  <FormItem
                    className={cn(
                      isDev && '__AddCategoryForm_status', // DEBUG
                      'flex w-full flex-col gap-4',
                    )}
                  >
                    <Label htmlFor="category-status">Status</Label>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger id="category-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PUBLIC">Public</SelectItem>
                        <SelectItem value="SUGGESTED">Suggested</SelectItem>
                        <SelectItem value="HIDDEN">Hidden</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        )}

        {/* Actions */}
        <div
          className={cn(
            isDev && '__AddCategoryForm_Actions', // DEBUG
            'mt-4 flex w-full gap-4',
            isSubmitSuccessful && 'justify-center',
          )}
        >
          <Button
            type="submit"
            variant={isSubmitEnabled ? 'success' : 'disabled'}
            disabled={!isSubmitEnabled}
            className={cn(
              isDev && '__AddCategoryForm_SaveButton', // DEBUG
              'gap-2',
              isSubmitSuccessful && 'hidden',
            )}
          >
            {isBusy ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-theme border-t-transparent" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <SaveIcon className={cn('h-4 w-4', isBusy && 'animate-spin')} />
                <span>Add</span>
              </>
            )}
          </Button>
          <Button
            variant={isSubmitSuccessful ? 'theme' : 'ghost'}
            onClick={handleCloseForm}
            className="gap-2"
          >
            <span>{isSubmitSuccessful ? 'Close' : 'Cancel'}</span>
          </Button>
        </div>

        {/* LoadingSplash */}
        <div
          className={cn(
            isDev && '__AddCategoryForm_LoadingSplash', // DEBUG
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
