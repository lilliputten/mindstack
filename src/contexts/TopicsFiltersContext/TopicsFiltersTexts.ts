import { TFiltersDataKey } from './TopicsFiltersTypes';

// NOTE: These texts should be key values in the translation files

export const fieldUnionStrings = {
  true: 'Yes',
  false: 'No',
  null: 'Ignore',
};

export const specifcFieldUnionStrings: Partial<Record<TFiltersDataKey, Record<string, string>>> = {
  hasWorkoutStats: {
    true: 'With Statistics',
    false: 'Without Statistics',
  },
  hasActiveWorkouts: {
    true: 'With Active Workouts',
    false: 'Without Active Workouts',
  },
  hasQuestions: {
    true: 'With Questions',
    false: 'Without Questions',
  },
  showOnlyMyTopics: {
    true: 'Only My Topics',
  },
  orderBySelect: {
    byRecent: 'Most Recent',
    byOldest: 'Most Oldest',
    byNameAsc: 'By Name',
    byNameDesc: 'By Name (descending)',
  },
};

export const filterFieldNames: Record<TFiltersDataKey, string> = {
  searchText: 'Search for',
  searchLang: 'Language',
  showOnlyMyTopics: 'Only My',
  hasWorkoutStats: 'Statistics',
  hasActiveWorkouts: 'Active Workouts',
  hasQuestions: 'Questions',
  orderBySelect: 'Order by',
};
