import { DecoratorProps } from 'react-cosmos-core';

export default function CosmosDecorator({ children }: DecoratorProps) {
  return <div className="absolute inset-0 flex items-center justify-center p-6">{children}</div>;
}
