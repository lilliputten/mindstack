'use client';

import React from 'react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Control } from 'react-hook-form';

import { cn } from '@/lib/utils';
import { TLocale, useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/Command';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { FormHint } from '@/components/blocks/FormHint';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';
import { getCategoryName, TAvailableCategory } from '@/features/categories';
import { useAllPublicCategories } from '@/features/topics/hooks';

interface CategorySelectProps {
  selectedCategoryIds: string[];
  onSelectedCategoryIdsChange: (ids: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function CategorySelect({
  selectedCategoryIds,
  onSelectedCategoryIdsChange,
  placeholder,
  className,
}: CategorySelectProps) {
  const t = useT();
  const locale = useLocale() as TLocale;
  const [open, setOpen] = React.useState(true);

  const { publicCategories, isLoading: isCategoriesLoading } = useAllPublicCategories();

  const handleCategoryToggle = (categoryId: string) => {
    console.log('[CategorySelect:handleCategoryToggle]', {
      categoryId,
    });
    const newSelectedIds = selectedCategoryIds.includes(categoryId)
      ? selectedCategoryIds.filter((id) => id !== categoryId)
      : [...selectedCategoryIds, categoryId];
    onSelectedCategoryIdsChange(newSelectedIds);
  };

  const selectedCategories = publicCategories.filter((cat) => selectedCategoryIds.includes(cat.id));
  const selectedNames = selectedCategories.map((cat) => getCategoryName(cat, locale, t));

  return (
    <div
      className={cn(
        isDev && '__CategorySelect', // DEBUG
        className,
      )}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            // disabled={disabled}
          >
            <span className="truncate">
              {selectedNames.length
                ? selectedNames.join(', ')
                : placeholder || 'Select categories...'}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search categories..." />
            <CommandList>
              <CommandEmpty>
                {isCategoriesLoading ? (
                  <Icons.Spinner className="mx-auto size-8 animate-spin text-theme" />
                ) : (
                  <>No categories found.</>
                )}
              </CommandEmpty>
              <CommandGroup>
                <ScrollArea
                  className={cn(
                    isDev && '__CategorySelect_Scroll', // DEBUG
                    // 'flex flex-1 flex-col overflow-hidden',
                    'max-h-64',
                    className,
                  )}
                  viewportClassName={cn(
                    isDev && '__CategorySelect_ScrollViewport', // DEBUG
                    'flex flex-1 flex-col',
                    '[&>div]:!flex [&>div]:flex-col [&>div]:flex-1',
                  )}
                >
                  {publicCategories.map((category) => {
                    const isSelected = selectedCategoryIds.includes(category.id);
                    const categoryName = getCategoryName(category, undefined, t);
                    console.log('[CategorySelect:item]', {
                      isSelected,
                      categoryName,
                    });
                    return (
                      <CommandItem
                        key={category.id}
                        value={category.id}
                        onSelect={() => handleCategoryToggle(category.id)}
                        className={cn(
                          isDev && '__CategorySelect_Item', // DEBUG
                          'flex items-center gap-2',
                          'text-truncate w-full',
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border opacity-50',
                        )}
                      >
                        <div
                          className={cn(
                            isDev && '__CategorySelect_ImageWrapper', // DEBUG
                            'relative size-8 overflow-hidden rounded-lg border',
                            'flex items-center justify-center',
                          )}
                        >
                          {category.imageUrl ? (
                            <Image
                              src={category.imageUrl}
                              className="rounded object-cover"
                              alt={categoryName}
                              fill
                            />
                          ) : (
                            <Icons.Categories className="size-5" />
                          )}
                        </div>
                        <span className={cn(!isSelected && 'truncate opacity-60')}>
                          {categoryName}
                        </span>
                      </CommandItem>
                    );
                  })}
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface CategorySelectFieldProps {
  control: Control<{ categoryIds?: string[] }>;
  name: 'categoryIds';
  label: string;
  hint?: string;
  placeholder?: string;
}

export function CategorySelectField({
  control,
  name,
  label,
  hint,
  placeholder,
}: CategorySelectFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex w-full flex-col gap-4">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <CategorySelect
              selectedCategoryIds={Array.isArray(field.value) ? field.value : []}
              onSelectedCategoryIdsChange={field.onChange}
              placeholder={placeholder}
            />
          </FormControl>
          {hint && <FormHint>{hint}</FormHint>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
