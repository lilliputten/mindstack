'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useTheme } from 'next-themes';

import { siteTitle } from '@/config/env';
import { aboutRoute, welcomeRoute } from '@/config/routesConfig';
import { getAllRouteSynonyms } from '@/lib/routes';
import { TPropsWithChildrenAndClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import logoOnWhiteSvg from '@/assets/logo/logo-with-sign-in-circle.svg';
import logoSvg from '@/assets/logo/logo-with-sign-on-dark.svg';
import { isDev } from '@/constants';
import { Link } from '@/i18n/routing';
import { TLocale } from '@/i18n/types';

interface NavBarBrandProps {
  isUser?: boolean;
  onSidebar?: boolean;
}

function BrandWrapper(props: TPropsWithChildrenAndClassName & NavBarBrandProps) {
  const { isUser, children, className: parentClassName } = props;
  const locale = useLocale() as TLocale;
  const pathname = decodeURI(usePathname() || '');
  const rootRoute = isUser ? aboutRoute : welcomeRoute;
  const rootRoutesList = getAllRouteSynonyms(rootRoute, locale);
  const isRoot = !pathname || rootRoutesList.includes(pathname);
  const className = cn(
    isDev && '__BrandWrapper', // DEBUG
    parentClassName,
    'flex',
    'items-center',
    'space-x-1.5',
    'gap-2',
    'transition-all',
    'mr-10',
    'select-none',
    !isRoot && 'hover:opacity-80',
  );
  if (isRoot) {
    return <div className={className}>{children}</div>;
  }
  return (
    <Link href={rootRoute} className={className}>
      {children}
    </Link>
  );
}

export function NavBarBrand(props: NavBarBrandProps) {
  const { onSidebar } = props;
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  return (
    <BrandWrapper {...props} className="h-12">
      <Image
        data-testid="NavBarBrandImage"
        src={!isDark && onSidebar ? logoOnWhiteSvg : logoSvg}
        className="h-auto w-48 select-none"
        // className="h-14 w-auto"
        priority={false}
        alt={siteTitle}
      />
      {/*
      <h1
        role="heading"
        data-testid="NavBarBrandTitle"
        className={cn(
          'font-urban',
          'text-xl',
          'text-theme-foreground',
          'font-bold',
          'whitespace-nowrap',
          'overflow-hidden',
          'text-ellipsis',
        )}
      >
        {siteTitle}
      </h1>
      */}
    </BrandWrapper>
  );
}
