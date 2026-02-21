import * as Icons from '@/components/shared/Icons';
import { TGenericIcon } from '@/components/shared/IconTypes';

export const systemThemeIds = ['light', 'dark', 'system'] as const;
export type TSystemThemeId = (typeof systemThemeIds)[number];
export const defaultSystemTheme: TSystemThemeId = 'system';
export const systemThemeIcons: Record<TSystemThemeId, TGenericIcon> = {
  light: Icons.Sun,
  dark: Icons.Moon,
  system: Icons.Laptop,
};
