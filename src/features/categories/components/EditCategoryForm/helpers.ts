import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale } from 'next-intl';
import { useForm, UseFormReturn } from 'react-hook-form';
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
import {
  defaultCategoryStatus,
  TAvailableCategory,
  TCreateCategoryParams,
} from '@/features/categories/types';

import { TFormData } from './types';

interface TConvertFormDataOptions {
  locale: TLocale;
  suggestionMode?: boolean;
}

export function convertFormDataToCategory(formData: TFormData, _opts: TConvertFormDataOptions) {
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

export function convertCategoryToFormData(
  category: TAvailableCategory | undefined,
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
