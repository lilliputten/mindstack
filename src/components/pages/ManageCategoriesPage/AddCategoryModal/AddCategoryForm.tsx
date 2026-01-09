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
import { Textarea } from '@/components/ui/Textarea';
import { FormHint } from '@/components/blocks/FormHint';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';
import { uploadCategoryImage } from '@/features/categories/actions/uploadCategoryImage';
import {
  categoryImageAllowedTypes,
  categoryImageAllowedTypesString,
  categoryImageConfig,
  categoryImageSizeLimit,
  TCategoryImageAllowedTypes,
} from '@/features/categories/constants';
import { defaultCategoryStatus, TCreateCategoryParams } from '@/features/categories/types';
import { TLocale, useT } from '@/i18n';

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_KEYWORDS_LENGTH = 200;

type TAddCategoryParams = TCreateCategoryParams;

interface TFormData {
  status: CategoryStatusType;
  imageUrl?: string;
  // NOTE: Use translated values, according to `localesList`
  name: string;
  description: string;
  keywords: string;
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

function convertFormDataToCategory(formData: TFormData, opts: TConvertFormDataOptions) {
  const {
    locale,
    // suggestionMode,
  } = opts;
  const {
    status,
    imageUrl,
    // NOTE,
    name,
    description,
    keywords,
  } = formData;
  const category: TCreateCategoryParams = {
    status,
    imageUrl,
    // NOTE: Use translated values, according to `localesList`
    translations: [
      {
        locale,
        name,
        description,
        keywords,
      },
    ],
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
  const translation = category.translations?.[0];
  const formData: TFormData = {
    status: category.status || suggestionMode ? 'SUGGESTED' : defaultCategoryStatus,
    imageUrl: category.imageUrl || undefined,
    // NOTE,
    name: translation?.name || '',
    description: translation?.description || '',
    keywords: translation?.keywords || '',
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

  const formSchema = React.useMemo(
    () =>
      z.object({
        name: z.string().min(MIN_NAME_LENGTH).max(MAX_NAME_LENGTH),
        description: z.string().max(MAX_DESCRIPTION_LENGTH).optional(),
        keywords: z.string().max(MAX_KEYWORDS_LENGTH).optional(),
        status: CategoryStatusSchema,
      }),
    [],
  );

  const defaultValues: TFormData = React.useMemo(
    () => ({
      name: '',
      description: '',
      keywords: '',
      status: suggestionMode ? 'SUGGESTED' : defaultCategoryStatus,
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
    // isSubmitted, // boolean;
    // isSubmitSuccessful, // boolean;
    // isSubmitting, // boolean;
    // isValidating, // boolean;
    isValid, // boolean;
    // disabled, // boolean;
    // submitCount, // number;
    // dirtyFields, // Partial<Readonly<FieldNamesMarkedBoolean<TFieldValues>>>;
    // touchedFields, // Partial<Readonly<FieldNamesMarkedBoolean<TFieldValues>>>;
    // validatingFields, // Partial<Readonly<FieldNamesMarkedBoolean<TFieldValues>>>;
    // errors, // FieldErrors<TFieldValues>;
    // isReady, // boolean;
  } = form.formState;

  React.useEffect(() => {
    form.setFocus('name');
  }, [form]);

  // Image handling. TODO: Refactor to process the image right before the form data submiting
  const imagePreviewUrl = form.watch('imageUrl');
  memo.imagePreviewUrl = imagePreviewUrl;

  const [isUploading, setIsUploading] = useState(false);
  // const [uploadError, setUploadError] = useState<string | null>(null);

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
      setIsUploading(true);
      if (isDev) {
        await new Promise((r) => setTimeout(r, 2000)); // DEBUG
      }
      let newImageUrl: string | undefined;
      const convertedCategory = convertFormDataToCategory(formData, { locale, suggestionMode });
      const newCategory = {
        ...initialCategory,
        ...convertedCategory,
        // Set an original image, if it wasn't removed by the user
        imageUrl: memo.imageFile !== null ? initialCategory?.imageUrl : undefined,
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
        const {
          status,
          imageUrl,
          // NOTE,
          name,
          description,
          keywords,
        } = formData;
        const newCategory: TCreateCategoryParams = {
          status,
          imageUrl,
          // NOTE: Use translated values, according to `localesList`
          translations: [
            {
              locale,
              name,
              description,
              keywords,
            },
          ],
        };
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
        debugger; // eslint-disable-line no-debugger
      } finally {
        setIsUploading(false);
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

  const isBusy = isLoading || isPending || isUploading;
  const isSubmitEnabled = !isBusy && isDirty && isValid;

  const SaveIcon = !isLoading ? Icons.Save : Icons.Spinner;

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmitForm)}
        className={cn(
          isDev && '__AddCategoryForm', // DEBUG
          'flex w-full flex-col gap-4',
          'transition',
          isBusy && 'opacity-50',
          className,
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
                        disabled={isUploading}
                      />
                      {isUploading ? (
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-theme border-t-transparent" />
                      ) : (
                        <Icons.ImageIcon className="h-8 w-8 text-muted-foreground" />
                      )}
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

        {/* Name */}
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem
              className={cn(
                isDev && '__AddCategoryForm_name', // DEBUG
                'flex w-full flex-col gap-4',
              )}
            >
              <Label htmlFor="category-name">Name</Label>
              <FormControl>
                <Input
                  id="category-name"
                  type="text"
                  placeholder="Enter category name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem
              className={cn(
                isDev && '__AddCategoryForm_description', // DEBUG
                'flex w-full flex-col gap-4',
              )}
            >
              <Label htmlFor="category-description">Description</Label>
              <FormControl>
                <Textarea
                  id="category-description"
                  placeholder="Enter category description"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Keywords */}
        <FormField
          name="keywords"
          control={form.control}
          render={({ field }) => (
            <FormItem
              className={cn(
                isDev && '__AddCategoryForm_keywords', // DEBUG
                'flex w-full flex-col gap-4',
              )}
            >
              <Label htmlFor="category-keywords">Keywords</Label>
              <FormControl>
                <Input
                  id="category-keywords"
                  type="text"
                  placeholder="Enter keywords separated by commas"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormHint>Keywords help with search and categorization</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />

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

        {/* Actions */}
        <div
          className={cn(
            isDev && '__AddCategoryForm_actions', // DEBUG
            'mt-4 flex w-full gap-4',
          )}
        >
          <Button
            type="submit"
            variant={isSubmitEnabled ? 'success' : 'disabled'}
            disabled={!isSubmitEnabled}
            className="gap-2"
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
          <Button variant="ghost" onClick={handleCloseForm} className="gap-2">
            <span>Cancel</span>
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
