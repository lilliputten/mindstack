'use client';

import React, { useCallback, useState } from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Icons } from '@/components/shared';
import { isDev } from '@/config';
import { categoryImageAllowedTypes } from '@/features/categories/constants';

interface TProps {
  className?: string;
  handleFileSelection: (file: File) => void;
  handleRemoveImage: () => void;
  imagePreviewUrl?: string;
}

export function ImageUpload(props: TProps) {
  const { className, handleFileSelection, handleRemoveImage, imagePreviewUrl } = props;

  const t = useT();

  // Drag and drop state
  const [isDragOver, setIsDragOver] = useState(false);
  // const isDragOver = true;

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelection(files[0]);
      }
    },
    [handleFileSelection],
  );

  const handleImageChange = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      const file = ev.target.files?.[0];
      if (file) {
        handleFileSelection(file);
      }
    },
    [handleFileSelection],
  );

  return (
    <Label
      className={cn(
        isDev && '__ImageUpload_ImagePreview', // DEBUG
        'relative flex size-32 cursor-pointer items-center justify-center overflow-hidden rounded-lg border',
        'transition',
        'bg-theme/10 hover:border-theme hover:bg-theme/30',
        'font-normal',
        isDragOver && 'border-theme bg-theme/30',
        className,
      )}
      title={t('ImageUpload.SelectImage')}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="pointer-events-none hidden"
        accept={categoryImageAllowedTypes.join(',')}
        onChange={handleImageChange}
      />
      {imagePreviewUrl ? (
        <>
          <Image
            src={imagePreviewUrl}
            alt={t('ImageUpload.ImagePreview')}
            fill
            className="pointer-events-none object-cover"
          />
          {!isDragOver && (
            <Button
              type="button"
              onClick={(ev) => {
                ev.preventDefault();
                handleRemoveImage();
              }}
              size="iconSm"
              className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
              title={t('ImageUpload.RemoveImage')}
            >
              <Icons.X className="h-3 w-3" />
            </Button>
          )}
        </>
      ) : !isDragOver ? (
        <Icons.ImageIcon className="m-auto size-8 text-muted-foreground" />
      ) : null}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 flex items-center justify-center bg-theme/40',
          'transition',
          !isDragOver && 'opacity-0',
        )}
      >
        <Icons.Upload className="size-8 text-white" />
      </div>
    </Label>
  );
}
