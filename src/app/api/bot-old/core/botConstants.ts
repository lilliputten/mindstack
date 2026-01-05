/** Use xtunnel for local development (see `.env:NEXTAUTH_URL,NEXT_PUBLIC_URL`). */
export const appHost: string = process.env.VERCEL_URL
  ? 'https://' + process.env.VERCEL_URL
  : process.env.NEXT_PUBLIC_URL || '';

if (!appHost) {
  throw new Error('No webapp host provided (NEXT_PUBLIC_URL or VERCEL_URL)');
}

/** Full telegram web app url. */
export const webAppUrl = `${appHost}/miniapp`;
