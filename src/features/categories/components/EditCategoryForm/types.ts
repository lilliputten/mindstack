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

export interface TFormData {
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

export interface TEditCategoryFormProps {
  initialCategory?: TAvailableCategory;
  handleSaveCategory: (p: TAvailableCategory) => Promise<unknown>;
  handleClose?: () => void;
  className?: string;
  isPending?: boolean;
  /** Is the dialog in edit or add mode? */
  newMode?: boolean;
  /** Is it a suggestion? Then offer a limited editing mode, without a status selector */
  suggestionMode?: boolean;
  setForm?: (form?: UseFormReturn<TFormData>) => void;
  setHandleSubmit?: (handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>) => void;
  setHandleSubmitForm?: (handleSubmitForm: (formData: TFormData) => Promise<unknown>) => void;
}

const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_KEYWORDS_LENGTH = 200;

export const formSchema = z.object({
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
});
