import { NextCosmosParams } from 'react-cosmos-next/dist/nextTypes';

import CosmosPageClient from './CosmosPageClient';

const isDev = process.env.NODE_ENV === 'development';

export const generateStaticParams = async () => {
  if (!isDev) {
    return [];
  }
  const { nextCosmosStaticParams } = await import('react-cosmos-next');
  const cosmosImports = await import('../../../../../cosmos.imports');
  return nextCosmosStaticParams(cosmosImports);
};

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<NextCosmosParams>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return <CosmosPageClient params={params} searchParams={searchParams} />;
}
