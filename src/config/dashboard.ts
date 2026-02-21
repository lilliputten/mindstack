import { SidebarNavItem } from '@/lib/types/site/NavItem';
import * as Icons from '@/components/shared/Icons';

import {
  aboutAliasRoute,
  adminAiTestTextQueryRoute,
  adminUiDemoRoute,
  adminBotControlRoute,
  allTopicsRoute,
  availableCategoriesRoute,
  availableTopicsRoute,
  docsAliasRoute,
  manageCategoriesRoute,
  myTopicsRoute,
  pricingAliasRoute,
  recentTrainingsRoute,
  rootAliasRoute,
  settingsRoute,
  welcomeAliasRoute,
} from './routesConfig';

// TODO: Allow to show generative data (like a topics count) in the sideboard titles (as badges?)

// prettier-ignore
export const dashboardLinks: SidebarNavItem[] = [
  // Show translations in the namespace of `NavLinks`
  {
    titleId: 'Application',
    items: [
      { href: availableCategoriesRoute, icon: Icons.Categories, titleId: 'AvailableCategories' },
      { href: availableTopicsRoute, icon: Icons.BookOpenCheck, titleId: 'AvailableTopics' },
      { href: recentTrainingsRoute, icon: Icons.Rocket, titleId: 'RecentTrainings' },
    ],
  },
  {
    titleId: 'MyData',
    authorizedOnly: true,
    items: [
      { href: manageCategoriesRoute, icon: Icons.Layers, titleId: 'ManageCategories', authorizedOnly: 'ADMIN' },
      { href: myTopicsRoute, icon: Icons.Topics, titleId: 'MyTopics' },
      { href: allTopicsRoute, icon: Icons.AllTopics, titleId: 'AllTopics', authorizedOnly: 'ADMIN' },
      // Add other data management links?
    ],
  },
  {
    titleId: 'Administration',
    authorizedOnly: 'ADMIN',
    items: [
      { href: adminBotControlRoute, icon: Icons.Bot, titleId: 'BotControl' },
      { href: adminAiTestTextQueryRoute, icon: Icons.BotMessageSquare, titleId: 'TestAiTextQuery' },
      { href: adminUiDemoRoute, icon: Icons.Bug, titleId: 'TestUiDemoPage' },
    ],
  },
  {
    titleId: 'Information',
    items: [
      { href: aboutAliasRoute, icon: Icons.Info, titleId: 'AboutProject' },
      { href: welcomeAliasRoute, icon: Icons.Lightbulb, titleId: 'WelcomePage' },
      { href: docsAliasRoute, icon: Icons.BookMarked, titleId: 'Documentation' },
      { href: pricingAliasRoute, icon: Icons.CircleDollarSign, titleId: 'Pricing' },
    ],
  },
  {
    titleId: 'Options',
    items: [
      { href: settingsRoute, icon: Icons.Settings, titleId: 'Settings' },
      { href: rootAliasRoute, icon: Icons.Messages, titleId: 'Support', disabled: true },
    ],
  },
];
