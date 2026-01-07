import { NextRequest } from 'next/server';
import { encode } from '@auth/core/jwt';

import { AUTH_SECRET, PUBLIC_URL } from '@/config/envServer';
import { prisma } from '@/lib/db';
import { ServerError } from '@/lib/errors';
import { getErrorText } from '@/lib/helpers';
import { cookieName, sessionMaxAge } from '@/auth/constants';
import { verifyTelegramToken } from '@/auth/telegram/telegram-provider';
import { authErrorRoute, isProd, rootAliasRoute } from '@/config';
import { TUser } from '@/features/users/types/TUser';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const callbackUrl = searchParams.get('callbackUrl') || rootAliasRoute;

  let tokenData: Awaited<ReturnType<typeof verifyTelegramToken>>;

  // Check parameters...
  try {
    if (!token) {
      throw new ServerError('Missing token', 400);
    }
    // Verify the token
    tokenData = await verifyTelegramToken({ token });
    if (!tokenData) {
      throw new ServerError('Invalid or expired token', 401);
    }
  } catch (error) {
    const status = error instanceof ServerError ? error.statusCode : 500;
    const errMsg = ['Wrong authentication parameters', getErrorText(error)]
      .filter(Boolean)
      .join(': ');
    // Redirect to error page with error details
    const errorUrl = new URL(authErrorRoute, PUBLIC_URL);
    errorUrl.searchParams.set('error', errMsg);
    // eslint-disable-next-line no-console
    console.error('[src/app/api/auth/callback/telegram/route.ts]', errMsg, {
      errorUrl: errorUrl.toString(),
      searchParams,
      token,
      callbackUrl,
      error,
      status,
    });
    // eslint-disable-next-line no-debugger
    debugger;
    return Response.redirect(errorUrl);
  }

  // Create user and account directly
  try {
    const {
      id,
      name,
      image,
      // locale,
    } = tokenData;

    // Check if user exists
    // const existingUser = await prisma.user.findUnique({ where: { id } });
    // const isNewUser = !existingUser;
    const usersCount = await prisma.user.count({
      where: { id: { not: id } },
    });

    const userData: Pick<TUser, 'name' | 'image' | 'role'> = {
      name,
      image,
      role: usersCount ? 'USER' : 'ADMIN',
    };

    // Create or update user
    const user = await prisma.user.upsert({
      where: { id },
      update: userData,
      create: { id, ...userData },
    });

    // Create an account if it doesn't exist
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'telegram',
          providerAccountId: id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        type: 'credentials',
        provider: 'telegram',
        providerAccountId: id,
      },
    });

    // Create NextAuth JWT session token
    const now = Date.now();
    const expires = new Date(now + sessionMaxAge * 1000);

    const sessionToken = await encode({
      token: {
        sub: user.id,
        name: user.name,
        picture: user.image,
        iat: Math.floor(now / 1000),
        exp: Math.floor(expires.getTime() / 1000),
      },
      secret: AUTH_SECRET,
      salt: cookieName,
    });

    // Create session record in database for tracking
    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires,
      },
    });

    const redirectUrl = new URL(callbackUrl, PUBLIC_URL);

    // Set session cookie and redirect
    const cookieValue = `${cookieName}=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Expires=${expires.toUTCString()}${isProd ? '; Secure' : ''}`;

    const response = new Response(null, {
      status: 302,
      headers: {
        Location: redirectUrl.toString(),
        'Set-Cookie': cookieValue,
      },
    });

    return response;
  } catch (error) {
    const status = error instanceof ServerError ? error.statusCode : 500;
    const errMsg = ['Authentication failed', getErrorText(error)].filter(Boolean).join(': ');
    // Redirect to error page with error details
    const errorUrl = new URL(authErrorRoute, PUBLIC_URL);
    errorUrl.searchParams.set('error', errMsg);
    // eslint-disable-next-line no-console
    console.error('[src/app/api/auth/callback/telegram/route.ts]', errMsg, {
      errorUrl: errorUrl.toString(),
      tokenData,
      searchParams,
      token,
      callbackUrl,
      error,
      status,
    });
    // eslint-disable-next-line no-debugger
    debugger;
    return Response.redirect(errorUrl);
  }
}
