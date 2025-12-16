import { TFiltersDataKey, TOrderBySelectOption } from './TopicsFiltersTypes';

// NOTE: These texts should be key values in the translation files. See `AvailableTopicsFilterTexts` namespace.

export const fieldUnionStrings = {
  true: 'Yes',
  false: 'No',
  null: 'Ignore',
};

export const specifcFieldUnionStrings: Partial<Record<TFiltersDataKey, Record<string, string>>> = {
  hasWorkoutStats: {
    true: 'WithStatistics',
    false: 'WithoutStatistics',
  },
  hasActiveWorkouts: {
    true: 'WithActiveWorkouts',
    false: 'WithoutActiveWorkouts',
  },
  hasQuestions: {
    true: 'WithQuestions',
    false: 'WithoutQuestions',
  },
  showOnlyMyTopics: {
    true: 'OnlyMyTopics',
  },
  orderBySelect: {
    byRecent: 'OrderByRecent',
    byOldest: 'OrderByOldest',
    byNameAsc: 'OrderByName',
    byNameDesc: 'OrderByNameDescending',
  } satisfies Record<TOrderBySelectOption, string>,
};

export const filterFieldNames: Record<TFiltersDataKey, string> = {
  searchText: 'SearchFor',
  searchLang: 'Language',
  showOnlyMyTopics: 'OnlyMy',
  hasWorkoutStats: 'Statistics',
  hasActiveWorkouts: 'ActiveWorkouts',
  hasQuestions: 'Questions',
  orderBySelect: 'OrderBy',
};
