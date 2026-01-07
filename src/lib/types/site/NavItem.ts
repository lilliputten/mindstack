import { UserRoleType } from '@/generated/prisma';

import { TRoutePath } from '@/config/routesConfig';
import { TGenericIcon } from '@/components/shared/IconTypes';

export interface NavItemBase {
  titleId: string; // Id for i18n
  authorizedOnly?: UserRoleType | boolean;
  icon?: TGenericIcon;
}
export interface NavItem extends NavItemBase {
  href: TRoutePath;
  badge?: number;
  disabled?: boolean;
  external?: boolean;
  userRequiredOnly?: boolean;
}

export type MainNavItem = NavItem;

export type MarketingConfig = {
  mainNav: MainNavItem[];
};

export interface SidebarNavItem extends NavItemBase {
  items: NavItem[];
}
