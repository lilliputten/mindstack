import { AuthConfig } from '@auth/core';
import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';
import { JWT } from 'next-auth/jwt';

import { SET_FIRST_USER_ADMIN, USE_ALLOWED_USERS } from '@/config/envServer';
import { authErrorRoute, welcomeAliasRoute } from '@/config/routesConfig';
import { prisma } from '@/lib/db';
import { isDev } from '@/config';
import { checkIsAllowedUser } from '@/features/allowed-users/helpers/checkIsAllowedUser';
import { TUserRejectReason } from '@/features/allowed-users/types/TUserRejectReason';
import { getUserById } from '@/features/users/actions/';
import { setFirstUserAsAdmin } from '@/features/users/helpers/setFirstUserAsAdmin';
import { UserRoleType } from '@/generated/prisma';

import authConfig from './auth.config.server';
import { sessionMaxAge, sessionUpdateAge } from './constants';

const invalidEmailRoute = '/demo-info';

/* // UNUSED: Workaround for make sure that `auth.config.server` is used only on server.
 * // Use different imports for server and client
 * import authConfig from './auth.config';
 * // This is a dynamic import that only runs on the server
 * // It's not included in the client bundle
 * let serverConfig = authConfig;
 * if (typeof window === 'undefined') {
 *   // We're on the server
 *   // eslint-disable-next-line @typescript-eslint/no-require-imports
 *   serverConfig = require('./auth.config.server').default;
 * }
 */

export const nextAuthApp = NextAuth({
  debug: isDev,
  // trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: sessionMaxAge,
    updateAge: sessionUpdateAge,
  },
  useSecureCookies: !isDev,
  cookies: {
    pkceCodeVerifier: {
      name: 'next-auth.pkce.code_verifier',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: !isDev,
      },
    },
  },
  pages: {
    // @see https://next-auth.js.org/configuration/pages
    signIn: welcomeAliasRoute, // <-- /api/auth/signin
    error: authErrorRoute, // <-- /api/auth/error
    // signOut: '/auth/signout',
  },
  callbacks: {
    async signIn(params) {
      const {
        user,
        account,
        profile,
        // email: verificationEmail, // { verificationRequest?: boolean }
        credentials,
      } = params;
      const { provider, type, providerAccountId } = account || {};
      const userEmail = user.email;
      const profileEmail = profile?.email;
      const email = userEmail || profileEmail;

      const rejectReason: TUserRejectReason | undefined = USE_ALLOWED_USERS
        ? await checkIsAllowedUser(params)
        : undefined;

      if (rejectReason) {
        // eslint-disable-next-line no-console
        console.warn('[auth:callbacks:signIn] Sing in rejected:', {
          rejectReason,
          email,
          userEmail,
          profileEmail,
          provider,
          type,
          providerAccountId,
          user,
          account,
          profile,
          credentials,
        });
        // debugger; // eslint-disable-line no-debugger
        if (provider === 'nodemailer' && type === 'email') {
          throw rejectReason;
        }
        return `${invalidEmailRoute}?reason=${rejectReason}`;
      }
      return true;
    },

    async session(params) {
      const { token, session } = params;
      const user = session.user;
      if (user) {
        if (token.sub) {
          user.id = token.sub;
          // It uses tg user id for telegram login
        }
        if (token.email) {
          user.email = token.email;
        }
        if (token.role) {
          // @see JWT type extension in `@types/next-auth.d.ts`
          user.role = token.role as UserRoleType;
        }
        user.name = token.name || null;
        user.image = token.picture || null;
      }
      return session;
    },

    async jwt(params) {
      const token = params.token as JWT;
      const { trigger } = params;
      const isNewUser = trigger === 'signUp';

      if (!token.sub) {
        return token;
      }

      // Set first user as admin if this is a new user
      if (isNewUser && (SET_FIRST_USER_ADMIN || isDev)) {
        await setFirstUserAsAdmin(token.sub);
      }

      const dbUser = await getUserById(token.sub);
      if (!dbUser) {
        return token;
      }
      token.name = dbUser.name;
      token.email = dbUser.email;
      token.picture = dbUser.image;
      token.role = dbUser.role as UserRoleType;
      return token;
    },
  } satisfies AuthConfig['callbacks'],
  // Use the server config if we're on the server, otherwise use the client-safe config
  ...authConfig,
});

export const {
  handlers: { GET, POST },
  auth,
} = nextAuthApp;
