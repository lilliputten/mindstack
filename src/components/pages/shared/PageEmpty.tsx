import { TPropsWithClassName, TReactNode } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { EmptyPlaceholder } from '@/components/shared/EmptyPlaceholder';
import * as Icons from '@/components/shared/Icons';
import { TGenericIcon } from '@/components/shared/IconTypes';
import { isDev } from '@/config';
import { AIGenerationsStatusInfo } from '@/features/ai-generations/components';

interface TPageEmptyProps extends TPropsWithClassName {
  title: string;
  description: string;
  explanation?: TReactNode;
  explanationClassName?: string;
  extraActions?: TReactNode;
  ExtraActions?: React.FunctionComponent;
  onButtonClick?: () => void; // React.Dispatch<React.SetStateAction<void>>;
  buttonTitle?: TReactNode;
  icon?: TGenericIcon;
  iconClassName?: string;
  buttons?: TReactNode;
  buttonsClassName?: string;
  framed?: boolean;
  showAIInfo?: boolean;
  padded?: boolean;
  border?: boolean;
}

const defaultIcon = Icons.Warning;

export function PageEmpty(props: TPageEmptyProps) {
  const {
    className,
    title,
    description,
    explanation,
    explanationClassName,
    extraActions,
    ExtraActions,
    buttonTitle,
    onButtonClick,
    buttons,
    buttonsClassName,
    icon = defaultIcon,
    iconClassName,
    framed,
    showAIInfo,
    padded = true,
    border = true,
  } = props;
  const hasCustomButton = !!(onButtonClick && buttonTitle);
  const hasAnyButtons = !!(buttons || hasCustomButton || extraActions || ExtraActions);

  // Helper function to safely access icon by string name
  const getIconByName = (name: string): TGenericIcon | undefined => {
    return (Icons as { [key: string]: TGenericIcon })[name];
  };

  return (
    <EmptyPlaceholder
      className={cn(
        isDev && '__PageEmpty', // DEBUG
        'overflow-auto',
        padded && 'p-6',
        !border && 'border-none',
        className,
      )}
      containerClassName="overflow-hidden"
      framed={framed}
    >
      <EmptyPlaceholder.Icon
        className={cn(
          isDev && '__PageEmpty_Icon', // DEBUG
          // 'mb-4',
          iconClassName,
        )}
        icon={typeof icon === 'string' ? getIconByName(icon) || defaultIcon : icon}
      />
      <EmptyPlaceholder.Title className="text-truncate">{title}</EmptyPlaceholder.Title>
      <EmptyPlaceholder.Description className="text-truncate">
        {description}
      </EmptyPlaceholder.Description>
      {explanation && (
        <div
          className={cn(
            isDev && '__PageError_Explanation', // DEBUG
            'text-content text-truncate text-center text-sm font-normal leading-6',
            explanationClassName,
          )}
        >
          {explanation}
        </div>
      )}
      {hasAnyButtons && (
        <div
          className={cn(
            isDev && '__PageEmpty_Buttons', // DEBUG
            'flex w-full flex-wrap justify-center gap-4',
            buttonsClassName,
          )}
        >
          {hasCustomButton && (
            <Button onClick={onButtonClick} className="flex gap-2">
              <Icons.Add className="hidden size-4 opacity-50 sm:flex" />
              <span>{buttonTitle}</span>
            </Button>
          )}
          {buttons}
          {extraActions}
          {ExtraActions && <ExtraActions />}
        </div>
      )}
      {showAIInfo && <AIGenerationsStatusInfo noFrame className="m-auto mt-8 px-6" />}
    </EmptyPlaceholder>
  );
}
