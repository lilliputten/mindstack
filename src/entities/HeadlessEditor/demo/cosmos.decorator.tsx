import { DecoratorProps } from 'react-cosmos-core';

export default function CosmosDecorator({ children }: DecoratorProps) {
  return <div className="flex flex-1 flex-col overflow-hidden py-6">{children}</div>;
}
