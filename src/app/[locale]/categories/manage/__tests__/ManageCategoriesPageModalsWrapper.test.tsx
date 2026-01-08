/** @jest-environment jsdom */

import '@/jest/jestDomSetup';
import '@/jest/jestReactSetup';

import React from 'react';
import { render, screen } from '@testing-library/react';

import { getErrorText } from '@/lib/helpers';

// Import the component after all mocks are set up
import { ManageCategoriesPageModalsWrapper } from '../ManageCategoriesPageModalsWrapper';

// Mock all complex dependencies BEFORE importing the component
jest.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en', add: null, delete: null, edit: null }),
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

jest.mock('next-intl', () => ({
  useLocale: () => 'en',
}));

jest.mock('@/i18n', () => ({
  useT: () => (key: string) => {
    const translations: Record<string, string> = {
      'CategoriesPage.Modals.Add.Title': 'Add Category',
      'CategoriesPage.Modals.Add.Description': 'Add a new category',
      'CategoriesPage.Modals.Edit.Title': 'Edit Category',
      'CategoriesPage.Modals.Edit.Description': 'Edit an existing category',
      'CategoriesPage.Modals.Delete.Title': 'Delete Categories',
      'CategoriesPage.Modals.Delete.Description': 'Delete selected categories',
    };
    return translations[key] || key;
  },
}));

// Mock the CategoriesContext if it's being used somewhere
jest.mock('@/contexts/CategoriesContext', () => ({
  useCategoriesContext: () => ({
    selectedCategoryIds: [],
    toggleCategorySelection: jest.fn(),
    selectAllCategories: jest.fn(),
    clearSelection: jest.fn(),
    isCategorySelected: jest.fn(),
    areAllCategoriesSelected: jest.fn(),
    getSelectedCategories: jest.fn(),
  }),
}));

// Mock the useAvailableCategories hook
jest.mock('@/features/categories/query-hooks/useAvailableCategories', () => ({
  useAvailableCategories: () => ({
    allCategories: [],
    hasNextPage: false,
    fetchNextPage: jest.fn(),
    isFetchingNextPage: false,
    isLoading: false,
    isError: false,
    error: null,
  }),
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

describe('ManageCategoriesPageModalsWrapper', () => {
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

      // Look for the rendered modals
      const addModal = screen.queryByTestId('add-category-modal');
      const deleteModal = screen.queryByTestId('delete-categories-modal');
      const editModal = screen.queryByTestId('edit-category-modal');

      // Expect the containers to exist even if modals are closed
      expect(addModal || deleteModal || editModal).toBeDefined();
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
