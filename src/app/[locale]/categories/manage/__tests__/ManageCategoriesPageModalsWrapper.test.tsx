/** @jest-environment jsdom */

import '@/jest/jestDomSetup';
import '@/jest/jestReactSetup';

import React from 'react';
import { render, screen } from '@testing-library/react';

import { getErrorText } from '@/lib/helpers';

describe('ManageCategoriesPageModalsWrapper', () => {
  // Mock all complex dependencies including Next.js and auth modules
  jest.mock('next/navigation', () => ({
    useParams: () => ({ locale: 'en' }),
    useRouter: () => ({
      push: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }),
    useSearchParams: () => ({
      get: () => null,
    }),
  }));

  jest.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
      const translations: Record<string, string> = {
        'CategoriesPage.modals.add.title': 'Add Category',
        'CategoriesPage.modals.add.description': 'Add a new category',
        'CategoriesPage.modals.edit.title': 'Edit Category',
        'CategoriesPage.modals.edit.description': 'Edit an existing category',
        'CategoriesPage.modals.delete.title': 'Delete Categories',
        'CategoriesPage.modals.delete.description': 'Delete selected categories',
      };
      return translations[key] || key;
    },
  }));

  jest.mock('@/components/ui/Modal', () => ({
    Modal: ({ children }: React.HTMLAttributes<HTMLDivElement>) => (
      <div data-testid="modal">{children}</div>
    ),
  }));

  jest.mock('@/components/pages/ManageCategoriesPage/AddCategoryModal', () => ({
    AddCategoryModal: ({ onClose }: { onClose?: () => void }) => (
      <div data-testid="add-category-modal" onClick={onClose}>
        Add Category Modal
      </div>
    ),
  }));

  jest.mock('@/components/pages/ManageCategoriesPage/DeleteCategoriesModal', () => ({
    DeleteCategoriesModal: ({ onClose }: { onClose?: () => void }) => (
      <div data-testid="delete-categories-modal" onClick={onClose}>
        Delete Categories Modal
      </div>
    ),
  }));

  jest.mock('@/components/pages/ManageCategoriesPage/EditCategoryModal', () => ({
    EditCategoryModal: ({ categoryId, onClose }: { categoryId?: string; onClose?: () => void }) => (
      <div data-testid="edit-category-modal" data-category-id={categoryId} onClick={onClose}>
        Edit Category Modal: {categoryId}
      </div>
    ),
  }));

  // Import after mocks
  let ManageCategoriesPageModalsWrapper: React.ComponentType;

  beforeEach(async () => {
    // Clear the module cache to get fresh mocks
    jest.resetModules();

    // Dynamically import the component after mocks are set up
    const importedModule = await import('../ManageCategoriesPageModalsWrapper');
    ManageCategoriesPageModalsWrapper = importedModule.ManageCategoriesPageModalsWrapper;
  });

  it('should render without crashing', () => {
    try {
      const { container } = render(<ManageCategoriesPageModalsWrapper />);
      expect(container).toBeInTheDocument();
    } catch (error) {
      const errorMessage = getErrorText(error);
      const nextError = new Error(`Component rendering error: ${errorMessage}`);
      // eslint-disable-next-line no-console
      console.error('[ManageCategoriesPageModalsWrapper.test]', errorMessage, { error });
      throw nextError;
    }
  });

  it('should contain the modal wrapper structure', () => {
    try {
      render(<ManageCategoriesPageModalsWrapper />);

      // The component should render its wrapper
      const wrapperElements = screen.getAllByRole('generic');
      expect(wrapperElements.length).toBeGreaterThan(0);
    } catch (error) {
      const errorMessage = getErrorText(error);
      const nextError = new Error(`Structure test error: ${errorMessage}`);
      // eslint-disable-next-line no-console
      console.error('[ManageCategoriesPageModalsWrapper.test]', errorMessage, { error });
      throw nextError;
    }
  });

  it('should handle component unmounting correctly', () => {
    try {
      const { unmount } = render(<ManageCategoriesPageModalsWrapper />);
      expect(() => unmount()).not.toThrow();
    } catch (error) {
      const errorMessage = getErrorText(error);
      const nextError = new Error(`Lifecycle test error: ${errorMessage}`);
      // eslint-disable-next-line no-console
      console.error('[ManageCategoriesPageModalsWrapper.test]', errorMessage, { error });
      throw nextError;
    }
  });
});
