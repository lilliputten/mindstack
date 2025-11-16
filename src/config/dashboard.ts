import { SidebarNavItem } from '@/lib/types/site/NavItem';
import * as Icons from '@/components/shared/Icons';

import {
  aboutRoute,
  adminAiTestTextQueryRoute,
  adminBotControlRoute,
  allTopicsRoute,
  availableTopicsRoute,
  chartsRoute,
  myTopicsRoute,
  rootRoute,
  settingsRoute,
  welcomeRoute,
} from './routesConfig';

// TODO: Allow to show generative data (like a topics count) in the sideboard titles (as badges?)

// prettier-ignore
export const dashboardLinks: SidebarNavItem[] = [
  {
    titleId: 'Application',
    items: [
      { href: availableTopicsRoute, icon: Icons.BookOpenCheck, titleId: 'Available Topics' },
    ],
  },
  {
    titleId: 'My Data',
    authorizedOnly: true,
    items: [
      { href: myTopicsRoute, icon: Icons.Topics, titleId: 'My Topics' },
      { href: allTopicsRoute, icon: Icons.AllTopics, titleId: 'All Topics', authorizedOnly: 'ADMIN' },
      // Add other data links?
      { href: chartsRoute, icon: Icons.LineChart, titleId: 'Charts', disabled: true, authorizedOnly: true },
    ],
  },
  {
    titleId: 'Administration',
    authorizedOnly: 'ADMIN',
    items: [
      { href: adminBotControlRoute, icon: Icons.Bot, titleId: 'Bot Control' },
      { href: adminAiTestTextQueryRoute, icon: Icons.Bug, titleId: 'Test AI Text Query' },
      // { href: adminRoute, icon: Icons.Laptop, titleId: 'Admin Panel', authorizedOnly: 'ADMIN', disabled: true },
      // { href: dashboardRoute, icon: Icons.Dashboard, titleId: 'Dashboard', disabled: true },
    ],
  },
  {
    titleId: 'Information',
    items: [
      { href: aboutRoute, icon: Icons.Info, titleId: 'About Project' },
      { href: welcomeRoute, icon: Icons.MonitorPlay, titleId: 'Welcome Page' },
    ],
  },
  {
    titleId: 'Options',
    items: [
      { href: settingsRoute, icon: Icons.Settings, titleId: 'Settings' },
      // { href: rootRoute, icon: Icons.Home, titleId: 'Homepage' },
      // { href: rootRoute, icon: Icons.BookOpen, titleId: 'Documentation', disabled: true },
      { href: rootRoute, icon: Icons.Messages, titleId: 'Support', disabled: true },
    ],
  },
];
