'use server';

import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';
import { headers } from 'next/headers';

export async function getServerHeaders() {
  const headersObj: ReadonlyHeaders = await headers();
  // DEBUG: Use reduce to convert headers to a plain object
  return Array.from(headersObj.entries()).reduce(
    (acc, [key, value]) => {
      acc[key] = value;
      return acc;
    },
    {} as Record<string, string>,
  );
}
