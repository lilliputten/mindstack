import { SidebarNavItem } from '@/lib/types/site/NavItem';
import * as Icons from '@/components/shared/Icons';

import {
  adminAiTestTextQueryRoute,
  adminBotControlRoute,
  allTopicsRoute,
  availableTopicsRoute,
  myTopicsRoute,
  publicAboutRoute,
  publicDocsRoute,
  publicPricingRoute,
  publicRootRoute,
  publicWelcomeRoute,
  settingsRoute,
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
      { href: publicAboutRoute, icon: Icons.Info, titleId: 'AboutProject' },
      { href: publicWelcomeRoute, icon: Icons.Lightbulb, titleId: 'WelcomePage' },
      { href: publicDocsRoute, icon: Icons.BookMarked, titleId: 'Documentation' },
      { href: publicPricingRoute, icon: Icons.BookMarked, titleId: 'Pricing' },
    ],
  },
  {
    titleId: 'Options',
    items: [
      { href: settingsRoute, icon: Icons.Settings, titleId: 'Settings' },
      { href: publicRootRoute, icon: Icons.Messages, titleId: 'Support', disabled: true },
    ],
  },
];
