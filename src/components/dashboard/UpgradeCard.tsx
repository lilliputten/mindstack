import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Link, useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { pricingAliasRoute } from '@/config';
import { isDev } from '@/constants';

type TProps = TPropsWithClassName & {
  dontFlatten?: boolean;
  onSidebar?: boolean;
  onClickEffect?: () => void;
};

export function UpgradeCard({ className, dontFlatten, onSidebar, onClickEffect }: TProps) {
  const t = useT();

  return (
    <Card
      className={cn(
        isDev && '__UpgradeCard', // DEBUG
        !dontFlatten && 'md:max-xl:rounded-none md:max-xl:border-none md:max-xl:shadow-none',
        // 'bg-theme/10',
        'bg-gradient-to-r from-triadic1/30 to-complementary/30',
        // onSidebar && 'bg-theme-400/10 text-white',
        onSidebar && 'text-white',
        className,
      )}
    >
      <CardHeader className="flex flex-col gap-2 md:max-xl:px-4">
        <CardTitle>{t('UpgradeCard.Title')}</CardTitle>
        <CardDescription className="font-normal">{t('UpgradeCard.Description')}</CardDescription>
      </CardHeader>
      <CardContent className="md:max-xl:px-4">
        <Button
          // size="sm"
          // variant={onSidebar ? 'themeInverted' : 'theme'}
          variant="gr1"
          className={cn(
            isDev && '__UpgradeCard_Button', // DEBUG
            'w-full',
            // onSidebar && 'bg-white text-theme-600 hover:bg-theme-700 hover:text-white',
          )}
          onClick={onClickEffect}
        >
          <Link href={pricingAliasRoute} className="flex items-center gap-2">
            {t('UpgradeCard.Upgrade')}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
