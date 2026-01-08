'use client';

import React, { useCallback, useState } from 'react';
import Image from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale } from 'next-intl';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { CategorySchema, CategoryStatusType } from '@/generated/prisma';

import { getErrorText } from '@/lib/helpers';
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
import { useAvailableCategories } from '@/features/categories/query-hooks/useAvailableCategories';
import { defaultCategoryStatus, TAvailableCategory } from '@/features/categories/types';
import { useT } from '@/i18n';
import { nFormatter } from '@/lib/helpers/strings';

const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_KEYWORDS_LENGTH = 200;

export interface IEditCategoryFormProps {
  categoryId: string;
  onSuccess?: () => void;
  onClose?: () => void;
  className?: string;
}

interface IFormData {
  name: string;
  description: string;
  keywords: string;
  status: CategoryStatusType;
  imageUrl?: string;
}

export function EditCategoryForm({
  categoryId,
  onSuccess,
  onClose,
  className,
}: IEditCategoryFormProps) {
  const t = useT();
  const locale = useLocale();
  const [isPending, setIsPending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { allCategories, updateCategory } = useAvailableCategories({
    // adminMode: true,
  });

  const category = React.useMemo<TAvailableCategory | undefined>(
    () => allCategories.find((c) => c.id === categoryId),
    [allCategories, categoryId],
  );

  // Get the translation for the current locale
  const translation = React.useMemo(
    () => category?.translations?.find((t) => t.locale === locale),
    [category, locale],
  );

  const formSchema = React.useMemo(
    () =>
      z.object({
        name: z.string().min(2).max(MAX_NAME_LENGTH),
        description: z.string().max(MAX_DESCRIPTION_LENGTH).optional(),
        keywords: z.string().max(MAX_KEYWORDS_LENGTH).optional(),
        status: CategorySchema,
      }),
    [],
  );

  // Initialize with existing category data
  const defaultValues: IFormData = React.useMemo(() => {
    if (!category) {
      return {
        name: '',
        description: '',
        keywords: '',
        status: defaultCategoryStatus,
        imageUrl: undefined,
      };
    }
    return {
      name: translation?.name || category.name || '',
      description: translation?.description || category.description || '',
      keywords: translation?.keywords || category.keywords || '',
      status: category.status as CategoryStatusType,
      imageUrl: category.imageUrl || undefined,
    };
  }, [category, translation]);

  const form = useForm<IFormData>({
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

  const watchedImageUrl = watch('imageUrl');

  React.useEffect(() => {
    setFocus('name');
  }, [setFocus]);

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
        console.error('[EditCategoryForm] Image upload error:', error);
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
        setUploadError(t('CategoriesPage.EditCategoryForm.ImageSizeError', { size: formattedSizeLimit }));
        return;
      }

      // Validate file type
      if (
        !categoryImageAllowedTypes.includes(file.type as (typeof categoryImageAllowedTypes)[number])
      ) {
        setUploadError(t('CategoriesPage.EditCategoryForm.ImageTypeError'));
        return;
      }

      handleImageUpload(file);
    },
    [handleImageUpload, t],
  );

  const handleRemoveImage = useCallback(() => {
    setValue('imageUrl', undefined);
  }, [setValue]);

  const onSubmit = handleSubmit(async (formData) => {
    setIsPending(true);
    try {
      const { updateCategories } = await import('@/features/categories/actions/updateCategories');
      const result = await updateCategories({
        updates: [
          {
            id: categoryId,
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
        updateCategory(result[0]);
        if (onSuccess) {
          onSuccess();
        }
        if (onClose) {
          onClose();
        }
      } else {
        throw new Error('Failed to update category');
      }
    } catch (error) {
      const message = getErrorText(error) || 'An unknown error has occurred.';
      // eslint-disable-next-line no-console
      console.error('[EditCategoryForm:onSubmit]', message, { error });
      setUploadError(message);
    } finally {
      setIsPending(false);
    }
  });

  const onCloseForm = (ev: React.MouseEvent) => {
    if (onClose) {
      onClose();
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
              <Label>{t('CategoriesPage.EditCategoryForm.ImageLabel')}</Label>
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
                      {t('CategoriesPage.EditCategoryForm.ImageHint', {
                        width: categoryImageConfig.maxWidth,
                        height: categoryImageConfig.maxHeight,
                      })}
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
              <Label htmlFor="category-name">
                {t('CategoriesPage.EditCategoryForm.NameLabel')}
              </Label>
              <FormControl>
                <Input
                  id="category-name"
                  type="text"
                  placeholder={t('CategoriesPage.EditCategoryForm.NamePlaceholder')}
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
              <Label htmlFor="category-description">
                {t('CategoriesPage.EditCategoryForm.DescriptionLabel')}
              </Label>
              <FormControl>
                <Textarea
                  id="category-description"
                  placeholder={t('CategoriesPage.EditCategoryForm.DescriptionPlaceholder')}
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
              <Label htmlFor="category-keywords">{t('EditCategoryForm.KeywordsLabel')}</Label>
              <FormControl>
                <Input
                  id="category-keywords"
                  type="text"
                  placeholder={t('EditCategoryForm.KeywordsPlaceholder')}
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormHint>{t('EditCategoryForm.KeywordsHint')}</FormHint>
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
              <Label htmlFor="category-status">{t('EditCategoryForm.StatusLabel')}</Label>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger id="category-status">
                    <SelectValue placeholder={t('EditCategoryForm.StatusPlaceholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PUBLIC">{t('statuses.public')}</SelectItem>
                  <SelectItem value="SUGGESTED">{t('statuses.suggested')}</SelectItem>
                  <SelectItem value="HIDDEN">{t('statuses.hidden')}</SelectItem>
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
                <span>{t('EditCategoryForm.SavingButtonText')}</span>
              </>
            ) : (
              <>
                <span>{t('EditCategoryForm.SaveButtonText')}</span>
              </>
            )}
          </Button>
          <Button variant="ghost" onClick={onCloseForm} className="gap-2">
            <span>{t('Cancel')}</span>
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
