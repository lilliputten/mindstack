/* eslint-env jest */

import { ExtendedUser } from '@/@types/next-auth';
import { TextDecoder, TextEncoder } from 'util';

/* // NOTE: Using the local db for tests. Make sure all the data is cleaning.
 * // Test db. Ensure if it has been created
 * const DATABASE_URL = 'file:.data/test.db';
 * // Set it for prisma also
 * process.env.DATABASE_URL = DATABASE_URL;
 */

// Add TextDecoder and TextEncoder to global scope for packages that need it
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder as typeof window.TextDecoder;
}
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder as typeof window.TextEncoder;
}

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return index < keys.length ? keys[index] : null;
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return index < keys.length ? keys[index] : null;
    },
  };
})();

Object.defineProperty(global, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

// Mock location for window if it doesn't exist
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'location', {
    value: {
      search: '',
      href: 'http://localhost:3000/',
    },
    writable: true,
  });
}

// Mocks...

jest.mock('@/jest/test/bare', () => ({
  getBare: jest.fn(() => 'initial mocked bare'),
}));

jest.mock('@/lib/session', () => ({
  getCurrentUser: jest.fn() as jest.MockedFunction<() => Promise<ExtendedUser | undefined>>,
}));

// Mock the envServer to prevent execution of the guard code during tests
jest.mock('@/config/envServer', () => ({
  envServer: {},
  // Export all the same named exports as the original file with test values
  VERCEL_ENV: 'development',
  NODE_ENV: 'test',
  NEXT_PUBLIC_URL: 'http://localhost:3000',
  isVercel: false,
  isVercelPreview: false,
  isVercelProduction: false,
  isDev: true,
  PUBLIC_URL: 'http://localhost:3000',
  EMAIL_USE_SSL: false,
  SET_FIRST_USER_ADMIN: false,
  USE_ALLOWED_USERS: false,
  doTestPayments: false,
  useFakePrices: false,
  yookassaShopId: 'test_shop_id',
  yookassaSecretKey: 'test_secret_key',
  stripePublishableKey: 'test_publishable_key',
  stripeSecretKey: 'test_secret_key',
  WEBHOOK_HOST: 'http://localhost:3000',
  BOT_USERNAME: 'test_bot',
  BOT_TOKEN: 'test_token',
  GIGACHAT_CREDENTIALS: 'test_credentials',
  GIGACHAT_MODEL: 'test_model',
  CLOUDFLARE_ACCOUNT_ID: 'test_account_id',
  CLOUDFLARE_API_TOKEN: 'test_api_token',
  BASIC_USER_GENERATIONS: 10,
  PRO_USER_MONTHLY_GENERATIONS: 100,
  LOGGING_CHANNEL_ID: 'test_channel',
  CONTROLLER_CHANNEL_ID: 'test_controller',
  BOT_ADMIN_USERNAME: 'admin',
  BOT_ADMIN_USERID: '123456',
  AUTH_SECRET: 'test_secret',
  NEXTAUTH_URL: 'http://localhost:3000/api/auth',
  GITHUB_CLIENT_ID: 'test_github_id',
  GITHUB_CLIENT_SECRET: 'test_github_secret',
  GOOGLE_CLIENT_ID: 'test_google_id',
  GOOGLE_CLIENT_SECRET: 'test_google_secret',
  YANDEX_CLIENT_ID: 'test_yandex_id',
  YANDEX_CLIENT_SECRET: 'test_google_secret',
  EMAIL_FROM_NAME: 'Test Sender',
  EMAIL_FROM: 'test@example.com',
  EMAIL_HOST: 'smtp.example.com',
  EMAIL_PORT: 587,
  EMAIL_HOST_USER: 'test_user',
  EMAIL_TEST_USER: 'test@example.com',
  EMAIL_HOST_PASSWORD: 'test_password',
  YOOKASSA_SHOP_ID: 'test_shop_id',
  YOOKASSA_SECRET_KEY: 'test_secret_key',
  YOOKASSA_SHOP_ID_TEST: 'test_shop_id',
  YOOKASSA_SECRET_KEY_TEST: 'test_secret_key',
  NEXT_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
  STRIPE_SECRET_KEY: 'sk_test_123',
  NEXT_STRIPE_PUBLISHABLE_KEY_TEST: 'pk_test_123',
  STRIPE_SECRET_KEY_TEST: 'sk_test_123',
  VERCEL_PROJECT_PRODUCTION_URL: 'vercel.app',
  VERCEL_URL: 'localhost:3000',
}));
