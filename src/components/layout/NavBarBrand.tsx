'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

import { siteTitle } from '@/config/env';
import { getAllRouteSynonyms } from '@/lib/routes';
import { TPropsWithChildrenAndClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { TLocale } from '@/i18n/types';
import logoSvg from '@/assets/logo/logo-with-sign-on-dark.svg';
import { rootAliasRoute, welcomeAliasRoute } from '@/config';
import { isDev } from '@/constants';

interface NavBarBrandProps {
  isUser?: boolean;
  onSidebar?: boolean;
}

function BrandWrapper(props: TPropsWithChildrenAndClassName & NavBarBrandProps) {
  const { children, className: parentClassName } = props;
  const locale = useLocale() as TLocale;
  const pathname = decodeURI(usePathname() || '');
  // const rootAliasRoute = isUser ? aboutAliasRoute : welcomeAliasRoute;
  const publicRootRoutesList = getAllRouteSynonyms(rootAliasRoute, locale);
  const isRoot = !pathname || publicRootRoutesList.includes(pathname);
  const urlRoute = isRoot ? welcomeAliasRoute : rootAliasRoute;
  const className = cn(
    isDev && '__BrandWrapper', // DEBUG
    parentClassName,
    'flex',
    'items-center',
    'space-x-1.5',
    'gap-2',
    'transition-all',
    // 'mr-4',
    'select-none',
    'hover:opacity-80',
  );
  // if (isRoot) {
  //   return <div className={className}>{children}</div>;
  // }
  return (
    <Link href={urlRoute} className={className}>
      {children}
    </Link>
  );
}

export function NavBarBrand(props: NavBarBrandProps) {
  // const { onSidebar } = props;
  // const { resolvedTheme } = useTheme();
  // const isDark = resolvedTheme === 'dark';
  return (
    <BrandWrapper {...props} className="h-12">
      <Image
        data-testid="NavBarBrandImage"
        src={logoSvg} // {!isDark && onSidebar ? logoOnWhiteSvg : logoSvg}
        className="h-auto w-48 select-none sm:min-w-48"
        // className="h-14 w-auto"
        priority={false}
        alt={siteTitle}
      />
    </BrandWrapper>
  );
}
