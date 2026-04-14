/* eslint-disable @typescript-eslint/no-require-imports */

import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Define the types for our mock
type AuthSession = {
  user?: {
    role: string;
  };
} | null;

// Define the type for the layout component
type TAwaitedLocaleProps = {
  params: Promise<{ locale: string }>;
};

type TManageCategoriesLayoutProps = TAwaitedLocaleProps & {
  children: ReactElement;
  addCategoryModal: ReactElement; // slot from @addCategoryModal
  editCategoryModal: ReactElement; // slot from @editCategoryModal
  deleteCategoryModal: ReactElement; // slot from @deleteCategoryModal
};

type LayoutComponentType = (props: TManageCategoriesLayoutProps) => Promise<ReactElement | null>;

// Mock the modules that would normally cause side effects during testing
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('next-intl/server', () => ({
  setRequestLocale: jest.fn(),
  getRequestConfig: jest.fn(() => ({
    messages: {},
    onError: jest.fn(),
    getMessageFallback: jest.fn(),
  })),
}));

// Mock the auth module with proper typing
const mockAuth = jest.fn<() => Promise<AuthSession>>();
jest.mock('@/auth', () => ({
  get auth() {
    return mockAuth;
  },
}));

// Import the layout component
let LayoutComponent: LayoutComponentType;

beforeEach(async () => {
  jest.clearAllMocks();

  // Dynamic import to ensure mocks are in place
  const layoutModule = await import('../layout');
  LayoutComponent = layoutModule.default;
});

describe('ManageCategoriesLayout', () => {
  it('should redirect to startAliasRoute when user is not an admin', async () => {
    // Mock a non-admin user session
    mockAuth.mockResolvedValue({
      user: {
        role: 'USER', // Not an admin
      },
    });

    // Mock params
    const paramsPromise = Promise.resolve({ locale: 'en' });

    // Access the mocked modules after they have been set up
    const { redirect: mockRedirect } = require('next/navigation');

    // Call the component directly since it's a server component
    await LayoutComponent({
      params: paramsPromise,
      children: <div>Children Content</div>,
      addCategoryModal: <div>Add Category Modal</div>,
      editCategoryModal: <div>Edit Category Modal</div>,
      deleteCategoryModal: <div>Delete Category Modal</div>,
    });

    // Verify redirect was called
    expect(mockRedirect).toHaveBeenCalledWith(expect.any(String)); // Should redirect to some route
    expect(mockRedirect).toHaveBeenCalledTimes(1);
  });

  it('should not redirect when user is an admin', async () => {
    // Mock an admin user session
    mockAuth.mockResolvedValue({
      user: {
        role: 'ADMIN',
      },
    });

    // Mock params
    const paramsPromise = Promise.resolve({ locale: 'en' });

    // Access the mocked modules
    const { redirect: mockRedirect } = require('next/navigation');
    const { setRequestLocale: mockSetRequestLocale } = require('next-intl/server');

    // Mock setRequestLocale to prevent side effects
    mockSetRequestLocale.mockImplementation(() => {});

    // Call the component directly since it's a server component
    const result = await LayoutComponent({
      params: paramsPromise,
      children: <div>Children Content</div>,
      addCategoryModal: <div>Add Category Modal</div>,
      editCategoryModal: <div>Edit Category Modal</div>,
      deleteCategoryModal: <div>Delete Category Modal</div>,
    });

    // Verify redirect was not called
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(mockSetRequestLocale).toHaveBeenCalledWith('en');

    // Since this is a server component, we can't easily test the rendered result
    // But we can verify that the function completed without redirecting
    expect(result).toBeDefined();
  });

  it('should redirect when user does not exist (not logged in)', async () => {
    // Mock no user session
    mockAuth.mockResolvedValue(null);

    // Mock params
    const paramsPromise = Promise.resolve({ locale: 'en' });

    // Access the mocked modules
    const { redirect: mockRedirect } = require('next/navigation');

    // Call the component directly since it's a server component
    await LayoutComponent({
      params: paramsPromise,
      children: <div>Children Content</div>,
      addCategoryModal: <div>Add Category Modal</div>,
      editCategoryModal: <div>Edit Category Modal</div>,
      deleteCategoryModal: <div>Delete Category Modal</div>,
    });

    // Verify redirect was called
    expect(mockRedirect).toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledTimes(1);
  });
});
