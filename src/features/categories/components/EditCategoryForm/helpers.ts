import { TLocale } from '@/i18n';
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
