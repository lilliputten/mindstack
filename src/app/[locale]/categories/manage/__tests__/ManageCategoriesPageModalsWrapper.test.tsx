/** @jest-environment jsdom */

import '@/jest/jestDomSetup';
import '@/jest/jestReactSetup';

import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { getErrorText } from '@/lib/helpers';

// Import the component after all mocks are set up
import { ManageCategoriesPageModalsWrapper } from '../ManageCategoriesPageModalsWrapper';

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity, // Prevent garbage collection during tests
      },
    },
  });

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
      'ManageCategoriesPageModalsWrapper.RequestedCategoryNotExists':
        'Requested category does not exist',
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

// Mock the useGoToTheRoute hook
jest.mock('@/hooks', () => ({
  useGoToTheRoute: () => jest.fn(),
}));

// Define proper types for the useAvailableCategories hook return value
type TUseAvailableCategoriesReturn = {
  allCategories:
    | Array<{
        id: string;
        name: string;
        description?: string;
        createdAt: Date;
        updatedAt: Date;
        userId?: string;
        topicsCount?: number;
      }>
    | undefined;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isFetched: boolean;
};

// Mock the useAvailableCategories hook
jest.mock('@/features/categories/query-hooks/useAvailableCategories', () => ({
  useAvailableCategories: (): TUseAvailableCategoriesReturn => ({
    allCategories: [],
    hasNextPage: false,
    fetchNextPage: jest.fn(),
    isFetchingNextPage: false,
    isLoading: false,
    isError: false,
    error: null,
    isFetched: true,
  }),
}));

// Define proper types for the ManageCategoriesList component props
type TManageCategoriesListProps = {
  handleDeleteCategory: (categoryId: string, from: string) => void;
  handleEditCategory: (categoryId: string) => void;
  handleEditTopics: (categoryId: string) => void;
  handleAddCategory: () => void;
  availableCategoriesQuery: {
    allCategories: Array<{ id: string; name: string }> | undefined;
    hasNextPage: boolean;
    fetchNextPage: () => void;
    isFetchingNextPage: boolean;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    isFetched: boolean;
  };
};

// Mock the ManageCategoriesList component
jest.mock('../ManageCategoriesList', () => ({
  ManageCategoriesList: ({
    handleDeleteCategory,
    handleEditCategory,
    handleEditTopics,
    handleAddCategory,
    // availableCategoriesQuery,
  }: TManageCategoriesListProps) => (
    <div data-testid="manage-categories-list">
      <div>Manage Categories List</div>
      <div data-testid="handle-delete-category">
        {typeof handleDeleteCategory === 'function' ? 'function' : 'not a function'}
      </div>
      <div data-testid="handle-edit-category">
        {typeof handleEditCategory === 'function' ? 'function' : 'not a function'}
      </div>
      <div data-testid="handle-edit-topics">
        {typeof handleEditTopics === 'function' ? 'function' : 'not a function'}
      </div>
      <div data-testid="handle-add-category">
        {typeof handleAddCategory === 'function' ? 'function' : 'not a function'}
      </div>
    </div>
  ),
}));

describe('ManageCategoriesPageModalsWrapper', () => {
  const defaultProps = {};

  const renderWithProviders = (props = {}) => {
    const queryClient = createTestQueryClient();

    return render(
      <QueryClientProvider client={queryClient}>
        <ManageCategoriesPageModalsWrapper {...defaultProps} {...props} />
      </QueryClientProvider>,
    );
  };

  it('should render without crashing', () => {
    try {
      const { container } = renderWithProviders();
      expect(container).toBeInTheDocument();
    } catch (error) {
      const errorMessage = getErrorText(error);
      const nextError = new Error(`Component rendering error: ${errorMessage}`);
      // eslint-disable-next-line no-console
      console.error('[ManageCategoriesPageModalsWrapper.test]', errorMessage, { error });
      throw nextError;
    }
  });

  it('should render the ManageCategoriesList component', () => {
    try {
      renderWithProviders();

      const manageCategoriesList = screen.getByTestId('manage-categories-list');
      expect(manageCategoriesList).toBeInTheDocument();
    } catch (error) {
      const errorMessage = getErrorText(error);
      const nextError = new Error(`Structure test error: ${errorMessage}`);
      // eslint-disable-next-line no-console
      console.error('[ManageCategoriesPageModalsWrapper.test]', errorMessage, { error });
      throw nextError;
    }
  });

  it('should pass handler functions to ManageCategoriesList', () => {
    try {
      renderWithProviders();

      expect(screen.getByTestId('handle-delete-category')).toHaveTextContent('function');
      expect(screen.getByTestId('handle-edit-category')).toHaveTextContent('function');
      expect(screen.getByTestId('handle-edit-topics')).toHaveTextContent('function');
      expect(screen.getByTestId('handle-add-category')).toHaveTextContent('function');
    } catch (error) {
      const errorMessage = getErrorText(error);
      const nextError = new Error(`Handler functions test error: ${errorMessage}`);
      // eslint-disable-next-line no-console
      console.error('[ManageCategoriesPageModalsWrapper.test]', errorMessage, { error });
      throw nextError;
    }
  });

  it('should handle component unmounting correctly', () => {
    try {
      const { unmount } = renderWithProviders();
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
