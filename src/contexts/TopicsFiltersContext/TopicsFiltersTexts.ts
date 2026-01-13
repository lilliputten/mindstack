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
    byRecent: 'OrderBy-Recent',
    byOldest: 'OrderBy-Oldest',
    byNameAsc: 'OrderBy-Name',
    byNameDesc: 'OrderBy-NameDescending',
  } satisfies Record<TOrderBySelectOption, string>,
};

export const filterFieldNames: Record<TFiltersDataKey, string> = {
  searchText: 'Label-SearchText',
  searchLang: 'Label-SearchLang',
  showOnlyMyTopics: 'Label-ShowOnlyMyTopics',
  hasWorkoutStats: 'Label-HasWorkoutStats',
  hasActiveWorkouts: 'Label-HasActiveWorkouts',
  hasQuestions: 'Label-HasQuestions',
  categoryIds: 'Label-CategoryIds',
  orderBySelect: 'Label-OrderBy',
};
