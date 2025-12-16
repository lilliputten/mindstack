import { SidebarNavItem } from '@/lib/types/site/NavItem';
import * as Icons from '@/components/shared/Icons';

import {
  aboutRoute,
  adminAiTestTextQueryRoute,
  adminBotControlRoute,
  allTopicsRoute,
  availableTopicsRoute,
  chartsRoute,
  docsRoute,
  myTopicsRoute,
  rootRoute,
  settingsRoute,
  welcomeRoute,
} from './routesConfig';

// TODO: Allow to show generative data (like a topics count) in the sideboard titles (as badges?)

// prettier-ignore
export const dashboardLinks: SidebarNavItem[] = [
  // Show translations in the namespace of `NavLinks`
  {
    titleId: 'Application',
    items: [
      { href: availableTopicsRoute, icon: Icons.BookOpenCheck, titleId: 'AvailableTopics' },
    ],
  },
  {
    titleId: 'MyData',
    authorizedOnly: true,
    items: [
      { href: myTopicsRoute, icon: Icons.Topics, titleId: 'MyTopics' },
      { href: allTopicsRoute, icon: Icons.AllTopics, titleId: 'AllTopics', authorizedOnly: 'ADMIN' },
      // Add other data links?
      { href: chartsRoute, icon: Icons.LineChart, titleId: 'Charts', disabled: true, authorizedOnly: true },
    ],
  },
  {
    titleId: 'Administration',
    authorizedOnly: 'ADMIN',
    items: [
      { href: adminBotControlRoute, icon: Icons.Bot, titleId: 'BotControl' },
      { href: adminAiTestTextQueryRoute, icon: Icons.Bug, titleId: 'TestAiTextQuery' },
    ],
  },
  {
    titleId: 'Information',
    items: [
      { href: aboutRoute, icon: Icons.Info, titleId: 'AboutProject' },
      { href: welcomeRoute, icon: Icons.Lightbulb, titleId: 'WelcomePage' },
      { href: docsRoute, icon: Icons.BookMarked, titleId: 'Documentation' },
    ],
  },
  {
    titleId: 'Options',
    items: [
      { href: settingsRoute, icon: Icons.Settings, titleId: 'Settings' },
      { href: rootRoute, icon: Icons.Messages, titleId: 'Support', disabled: true },
    ],
  },
];
