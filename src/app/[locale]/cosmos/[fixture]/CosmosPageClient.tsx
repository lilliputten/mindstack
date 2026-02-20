'use client';

import dynamic from 'next/dynamic';
import { NextCosmosParams } from 'react-cosmos-next/dist/nextTypes';

const isDev = process.env.NODE_ENV === 'development';

const CosmosPage = dynamic(
  async () => {
    if (!isDev) {
      return () => null;
    }
    const { nextCosmosPage } = await import('react-cosmos-next');
    const cosmosImports = await import('../../../../../cosmos.imports');
    return nextCosmosPage(cosmosImports);
  },
  { ssr: false },
);

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<NextCosmosParams>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return <CosmosPage params={params} searchParams={searchParams} />;
}
