import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { pricingAliasRoute } from '@/config';
import { isDev } from '@/constants';
import { Link, useT } from '@/i18n';

export function UpgradeCard({
  className,
  dontFlatten,
  onSidebar,
}: TPropsWithClassName & { dontFlatten?: boolean; onSidebar?: boolean }) {
  const t = useT();

  return (
    <Card
      className={cn(
        isDev && '__UpgradeCard', // DEBUG
        !dontFlatten && 'md:max-xl:rounded-none md:max-xl:border-none md:max-xl:shadow-none',
        'bg-theme/10',
        onSidebar && 'bg-theme-400/10 text-white',
        className,
      )}
    >
      <CardHeader className="md:max-xl:px-4">
        <CardTitle>{t('UpgradeCard.Title')}</CardTitle>
        <CardDescription>{t('UpgradeCard.Description')}</CardDescription>
      </CardHeader>
      <CardContent className="md:max-xl:px-4">
        <Button
          size="sm"
          variant="theme"
          className={cn(
            isDev && '__UpgradeCard_Button', // DEBUG
            'w-full',
            onSidebar && 'bg-white text-theme-600 hover:bg-theme-700 hover:text-white',
          )}
        >
          <Link href={pricingAliasRoute} className="flex items-center gap-2">
            {t('UpgradeCard.Upgrade')}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
