'use client';

import { useFixtureSelect } from 'react-cosmos/client';

import { Button, classOptions } from '@/components/ui/Button';

export default function ButtonFixture() {
  // const [variant] = useFixtureInput<TButtonVariants>('variant', 'theme');
  const [variant] = useFixtureSelect('variant', {
    options: Object.keys(classOptions.variant) as NonNullable<
      React.ComponentProps<typeof Button>['variant']
    >[],
  });
  const [size] = useFixtureSelect('size', {
    options: Object.keys(classOptions.size) as NonNullable<
      React.ComponentProps<typeof Button>['size']
    >[],
  });
  const [rounded] = useFixtureSelect('rounded', {
    options: Object.keys(classOptions.rounded) as NonNullable<
      React.ComponentProps<typeof Button>['rounded']
    >[],
  });
  return (
    <Button variant={variant} size={size} rounded={rounded}>
      Click me
    </Button>
  );
}
