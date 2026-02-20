import { MainNavItem } from '@/lib/types/site/NavItem';
import { Icons } from '@/components/shared';

import {
  availableTopicsRoute,
  myTopicsRoute,
  recentTrainingsRoute,
  rootCategoriesRoute,
  settingsRoute,
} from './routesConfig';

export type SiteMenu = {
  mainNav: MainNavItem[];
};

export const siteMenu: SiteMenu = {
  // TODO: See `src/config/dashboard.ts`
  mainNav: [
    {
      titleId: 'MyTopics',
      icon: Icons.Topics,
      href: myTopicsRoute,
      userRequiredOnly: true,
    },
    {
      titleId: 'Categories',
      icon: Icons.Categories,
      href: rootCategoriesRoute,
    },
    {
      titleId: 'AvailableTopics',
      icon: Icons.BookOpenCheck,
      href: availableTopicsRoute,
    },
    {
      titleId: 'Trainings',
      icon: Icons.Rocket,
      href: recentTrainingsRoute,
    },
    {
      titleId: 'Settings',
      icon: Icons.Settings,
      href: settingsRoute,
    },
    /* // UNUSED
    {
      titleId: 'Welcome',
      icon: Icons.MonitorPlay,
      href: welcomeAliasRoute,
    },
    */
  ],
};
