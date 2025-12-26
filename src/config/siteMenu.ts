import { MainNavItem } from '@/lib/types/site/NavItem';
import * as Icons from '@/components/shared/Icons';

import { availableTopicsRoute, myTopicsRoute, publicWelcomeRoute } from './routesConfig';

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
      titleId: 'AvailableTopics',
      icon: Icons.BookOpenCheck,
      href: availableTopicsRoute,
      // userRequiredOnly: true,
    },
    {
      titleId: 'Welcome',
      icon: Icons.MonitorPlay,
      href: publicWelcomeRoute,
    },
  ],
};
