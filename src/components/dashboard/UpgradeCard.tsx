import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { isDev } from '@/constants';

export function UpgradeCard({
  className,
  dontFlatten,
  onSidebar,
}: TPropsWithClassName & { dontFlatten?: boolean; onSidebar?: boolean }) {
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
        <CardTitle>Upgrade to Pro</CardTitle>
        <CardDescription>
          Unlock all features and get unlimited access to our support team.
        </CardDescription>
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
          Upgrade
        </Button>
      </CardContent>
    </Card>
  );
}
