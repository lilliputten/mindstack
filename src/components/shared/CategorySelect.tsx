'use client';

import React from 'react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Control } from 'react-hook-form';

import { cn } from '@/lib/utils';
import { TLocale, useT } from '@/i18n';
import { Button, buttonVariants } from '@/components/ui/Button';
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
import { getCategoryName } from '@/features/categories';
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

  const handleCategoryToggle = React.useCallback(
    (categoryId: string) => {
      const newSelectedIds = selectedCategoryIds.includes(categoryId)
        ? selectedCategoryIds.filter((id) => id !== categoryId)
        : [...selectedCategoryIds, categoryId];
      onSelectedCategoryIdsChange(newSelectedIds);
    },
    [onSelectedCategoryIdsChange, selectedCategoryIds],
  );

  const categoryNames = React.useMemo(() => {
    return publicCategories.reduce(
      (names, category) => {
        names[category.id] = getCategoryName(category, locale, t);
        return names;
      },
      {} as Record<string, string>,
    );
  }, [locale, publicCategories, t]);

  const selectedCategories = publicCategories.filter((cat) => selectedCategoryIds.includes(cat.id));

  const hasSelected = !!selectedCategories.length;

  return (
    <div
      className={cn(
        isDev && '__CategorySelect', // DEBUG
        className,
      )}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            className={cn(
              buttonVariants({ variant: 'ghostForm' }),
              'flex cursor-pointer items-center justify-stretch gap-2 truncate',
              hasSelected && 'pl-0',
            )}
          >
            <div className="flex-1 truncate">
              {!hasSelected ? (
                <span className="truncate">{placeholder || 'Select categories'}</span>
              ) : (
                <>
                  <span
                    className={cn(
                      'inline-flex flex-shrink-0 items-center gap-2',
                      'ml-1',
                      'overflow-hidden truncate rounded border',
                      'transition',
                      'truncate',
                    )}
                  />
                  {selectedCategories.map(({ id }) => (
                    <span
                      key={id}
                      className={cn(
                        'inline-flex flex-shrink-0 items-center gap-2',
                        'mr-1 p-1 px-2',
                        'overflow-hidden truncate rounded border',
                        'transition',
                        'truncate',
                        'bg-theme-500/10',
                        'hover:bg-theme-500/30',
                        'after:content-["×"]',
                        'after:inline-block',
                        'after:opacity-50',
                      )}
                      title="Remove category"
                      onClick={(ev) => {
                        ev.preventDefault();
                        handleCategoryToggle(id);
                      }}
                    >
                      {categoryNames[id]}
                    </span>
                  ))}
                </>
              )}
            </div>
            <div className="flex items-center justify-center rounded opacity-50 transition hover:opacity-100">
              <Icons.ChevronDown className="size-4" />
            </div>
          </div>
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
                    'max-h-64',
                    className,
                  )}
                  viewportClassName={cn(
                    isDev && '__CategorySelect_ScrollViewport', // DEBUG
                    'flex flex-1 flex-col',
                    '[&>div]:!flex [&>div]:flex-col [&>div]:flex-1 [&>div]:gap-1',
                  )}
                >
                  {publicCategories.map((category) => {
                    const isSelected = selectedCategoryIds.includes(category.id);
                    const categoryName = categoryNames[category.id];
                    return (
                      <CommandItem
                        key={category.id}
                        value={category.id}
                        onSelect={() => handleCategoryToggle(category.id)}
                        className={cn(
                          isDev && '__CategorySelect_Item', // DEBUG
                          'cursor-pointer',
                          'flex items-center gap-2',
                          'text-truncate w-full',
                          'hover:bg-theme/10',
                          'transitiion truncate',
                          isSelected && 'bg-theme/20 hover:bg-theme/30',
                        )}
                      >
                        <div
                          className={cn(
                            isDev && '__CategorySelect_ImageWrapper', // DEBUG
                            'relative size-8 overflow-hidden rounded-lg border',
                            'flex flex-shrink-0 items-center justify-center truncate',
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
                        <span className={cn('truncate', !isSelected && 'opacity-60')}>
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
          <FormLabel className="truncate">{label}</FormLabel>
          <FormControl>
            <CategorySelect
              selectedCategoryIds={Array.isArray(field.value) ? field.value : []}
              onSelectedCategoryIdsChange={field.onChange}
              placeholder={placeholder}
            />
          </FormControl>
          {hint && <FormHint className="text-truncate">{hint}</FormHint>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
