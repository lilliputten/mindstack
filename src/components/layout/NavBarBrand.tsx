'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useTheme } from 'next-themes';

import { siteTitle } from '@/config/env';
import { infoRoute, welcomeRoute } from '@/config/routesConfig';
import { getAllRouteSynonyms } from '@/lib/routes';
import { TPropsWithChildrenAndClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import logoSvg from '@/assets/logo/logo-with-sign-on-dark.svg';
import { isDev } from '@/constants';
import { Link } from '@/i18n/routing';
import { TLocale } from '@/i18n/types';

interface NavBarBrandProps {
  isUser?: boolean;
}

function BrandWrapper(props: TPropsWithChildrenAndClassName & NavBarBrandProps) {
  const { isUser, children, className: parentClassName } = props;
  const locale = useLocale() as TLocale;
  const pathname = decodeURI(usePathname() || '');
  const rootRoute = isUser ? infoRoute : welcomeRoute;
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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  return (
    <BrandWrapper {...props} className="h-12">
      <Image
        data-testid="NavBarBrandImage"
        src={logoSvg}
        className="h-14 w-auto"
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
