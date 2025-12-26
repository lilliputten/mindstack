import { defineConfig } from 'prisma/config';

import 'dotenv/config';

/* // DEBUG: Test if the DATABASE_URL variables has been defined
 * // eslint-disable-next-line no-console
 * console.log('PRISMA CONFIG DB URL =', process.env.DATABASE_URL);
 */

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
