'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';

export interface TDeleteTopicFormProps {
  name: string;
  handleConfirm: () => Promise<unknown>;
  handleClose?: () => void;
  className?: string;
  isPending?: boolean;
}

export function DeleteTopicForm(props: TDeleteTopicFormProps) {
  const { name, className, handleConfirm, handleClose, isPending } = props;

  const onClose = (ev: React.MouseEvent) => {
    if (handleClose) {
      handleClose();
    }
    ev.preventDefault();
  };

  const Icon = isPending ? Icons.Spinner : Icons.Trash;
  const buttonText = isPending ? 'Deleting' : 'Delete';

  return (
    <div
      className={cn(
        isDev && '__DeleteTopicForm', // DEBUG
        'flex w-full flex-col gap-4',
        className,
      )}
    >
      <p className="Text">Delete the topic &quot;{name}&quot;?</p>
      <div className="flex flex-col justify-between"></div>
      {/* Actions */}
      <div className="flex w-full gap-4">
        <Button type="submit" variant="destructive" className="gap-2" onClick={handleConfirm}>
          <Icon className={cn('size-4', isPending && 'animate-spin')} /> <span>{buttonText}</span>
        </Button>
        <Button variant="ghost" onClick={onClose} className="gap-2">
          <Icons.Close className="size-4" />
          <span>Cancel</span>
        </Button>
      </div>
    </div>
  );
}
