'use client';

import React, { useCallback, useState } from 'react';
import Image from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale } from 'next-intl';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { CategorySchema, CategoryStatusType } from '@/generated/prisma';

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
import { uploadCategoryImage } from '@/features/categories/actions/uploadCategoryImage';
import {
  categoryImageAllowedTypes,
  categoryImageConfig,
  categoryImageSizeLimit,
} from '@/features/categories/constants';
import { defaultCategoryStatus, TCreateCategoryParams } from '@/features/categories/types';

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_KEYWORDS_LENGTH = 200;

// // TODO: Derive from `CreateCategoryParamsSchema` and `CreateCategoryTranslationSchema`
// type TAddCategoryParams = {
//   name: string;
//   description?: string;
//   keywords?: string;
//   status: CategoryStatusType;
//   imageUrl?: string;
// };
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
  /*
  onSuccess?: () => void;
  onClose?: () => void;
  className?: string;
  */
  handleAddCategory: (p: TAddCategoryParams) => Promise<unknown>;
  handleClose?: () => void;
  className?: string;
  isPending?: boolean;
}

export function AddCategoryForm(props: TAddCategoryFormProps) {
  const {
    /*
    onSuccess,
    onClose,
    className,
    */
    className,
    handleAddCategory,
    handleClose,
    isPending,
  } = props;
  const locale = useLocale();
  // const [isPending, setIsPending] = useState(false);

  const formSchema = React.useMemo(
    () =>
      z.object({
        name: z.string().min(MIN_NAME_LENGTH).max(MAX_NAME_LENGTH),
        description: z.string().max(MAX_DESCRIPTION_LENGTH).optional(),
        keywords: z.string().max(MAX_KEYWORDS_LENGTH).optional(),
        status: CategorySchema,
      }),
    [],
  );

  const defaultValues: TFormData = React.useMemo(
    () => ({
      name: '',
      description: '',
      keywords: '',
      status: defaultCategoryStatus,
    }),
    [],
  );

  const form = useForm<TFormData>({
    mode: 'onChange',
    criteriaMode: 'all',
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const {
    formState: { isDirty, isValid },
    handleSubmit,
    setValue,
    watch,
    setFocus,
  } = form;

  React.useEffect(() => {
    setFocus('name');
  }, [setFocus]);

  // Image handling. TODO: Refactor to process the image right before the form data submiting
  const watchedImageUrl = watch('imageUrl');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const handleImageUpload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setUploadError(null);
      try {
        const formData = new FormData();
        formData.append('image', file);
        const result = await uploadCategoryImage(formData);
        if (result.success && result.data?.url) {
          setValue('imageUrl', result.data.url);
        } else {
          setUploadError('Failed to upload image');
        }
      } catch (error) {
        setUploadError(getErrorText(error) || 'Failed to upload image');
        // eslint-disable-next-line no-console
        console.error('[AddCategoryForm] Image upload error:', error);
      } finally {
        setIsUploading(false);
      }
    },
    [setValue],
  );
  const handleImageChange = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      const file = ev.target.files?.[0];
      if (!file) return;
      // Validate file size
      if (file.size > categoryImageSizeLimit) {
        const formattedSizeLimit = nFormatter(categoryImageSizeLimit);
        setUploadError(`Image size must be less than ${formattedSizeLimit}B`);
        return;
      }
      // Validate file type
      if (
        !categoryImageAllowedTypes.includes(file.type as (typeof categoryImageAllowedTypes)[number])
      ) {
        setUploadError('Invalid image type. Allowed types: JPEG, PNG, WebP, GIF');
        return;
      }
      handleImageUpload(file);
    },
    [handleImageUpload],
  );
  const handleRemoveImage = useCallback(() => {
    setValue('imageUrl', undefined);
  }, [setValue]);

  /*
  const onSubmit = handleSubmit(async (formData) => {
    setIsPending(true);
    try {
      const { createCategories } = await import('@/features/categories/actions/createCategories');
      const result = await createCategories({
        categories: [
          {
            status: formData.status,
            imageUrl: formData.imageUrl,
            translations: [
              {
                locale,
                name: formData.name,
                description: formData.description || null,
                keywords: formData.keywords || null,
              },
            ],
          },
        ],
      });
      if (result && result.length > 0) {
        if (onSuccess) {
          onSuccess();
        }
        if (handleClose) {
          handleClose();
        }
      } else {
        throw new Error('Failed to create category');
      }
    } catch (error) {
      const message = getErrorText(error) || 'An unknown error has occurred.';
      // eslint-disable-next-line no-console
      console.error('[AddCategoryForm:onSubmit]', message, { error });
      setUploadError(message);
    } finally {
      setIsPending(false);
    }
  });
  */

  const onSubmit = handleSubmit((formData) => {
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
    console.log('[AddCategoryForm:onSubmit] before', {
      newCategory,
      formData,
    });
    debugger;
    return handleAddCategory(newCategory)
      .then((result) => {
        console.log('[AddCategoryForm:onSubmit] done', {
          result,
          newCategory,
          formData,
        });
        debugger;
        // reset();
        // if (handleClose) {
        //   handleClose();
        // }
      })
      .catch((error) => {
        const message = getErrorText(error) || 'An unknown error has occurred.';
        // eslint-disable-next-line no-console
        console.error('[AddCategoryForm:onSubmit]', message, {
          error,
        });
        debugger; // eslint-disable-line no-debugger
      });
  });

  const onCloseForm = (ev: React.MouseEvent) => {
    if (handleClose) {
      handleClose();
    }
    ev.preventDefault();
  };

  const isSubmitEnabled = !isPending && !isUploading && isDirty && isValid;

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className={cn('flex w-full flex-col gap-4', className)}>
        {/* Image Upload */}
        <FormField
          name="imageUrl"
          control={form.control}
          render={() => (
            <FormItem className="flex w-full flex-col gap-4">
              <Label>Image</Label>
              <FormControl>
                <div className="flex items-center gap-4">
                  {watchedImageUrl ? (
                    <div className="relative h-24 w-24 overflow-hidden rounded-lg border">
                      <Image
                        src={watchedImageUrl}
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
                    <label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:bg-muted">
                      <input
                        type="file"
                        accept={categoryImageAllowedTypes.join(',')}
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={isUploading}
                      />
                      {isUploading ? (
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      ) : (
                        <Icons.ImageIcon className="h-8 w-8 text-muted-foreground" />
                      )}
                    </label>
                  )}
                  <div className="flex-1">
                    <FormHint>
                      Maximum size: {categoryImageConfig.size}x{categoryImageConfig.size}px
                    </FormHint>
                  </div>
                </div>
              </FormControl>
              {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
            </FormItem>
          )}
        />

        {/* Name */}
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-4">
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
            <FormItem className="flex w-full flex-col gap-4">
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
            <FormItem className="flex w-full flex-col gap-4">
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
        <FormField
          name="status"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-4">
              <Label htmlFor="category-status">Status</Label>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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

        {/* Actions */}
        <div className="mt-4 flex w-full gap-4">
          <Button
            type="submit"
            variant={isSubmitEnabled ? 'success' : 'disabled'}
            disabled={!isSubmitEnabled}
            className="gap-2"
          >
            {isPending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <Icons.Save className="h-4 w-4" />
                <span>Add</span>
              </>
            )}
          </Button>
          <Button variant="ghost" onClick={onCloseForm} className="gap-2">
            <span>Cancel</span>
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
