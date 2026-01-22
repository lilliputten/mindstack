import { TFiltersDataKey } from './WorkoutsFiltersTypes';

// NOTE: These texts should be key values in the translation files. See `AvailableWorkoutsFilterTexts` namespace.

export const fieldUnionStrings = {
  true: 'Yes',
  false: 'No',
  null: 'Ignore',
};

export const specifcFieldUnionStrings: Partial<Record<TFiltersDataKey, Record<string, string>>> = {
  hasWorkoutStats: {
    true: 'WithStats',
    false: 'WithoutStats',
    null: 'IgnoreStats',
  },
  hasActiveWorkouts: {
    true: 'WithActive',
    false: 'WithoutActive',
    null: 'IgnoreActive',
  },
  orderBySelect: {
    byRecent: 'OrderBy-Recent',
    byOldest: 'OrderBy-Oldest',
    byStartedRecent: 'OrderBy-StartedRecent',
    byStartedOldest: 'OrderBy-StartedOldest',
    byFinishedRecent: 'OrderBy-FinishedRecent',
    byFinishedOldest: 'OrderBy-FinishedOldest',
    byNameAsc: 'OrderBy-NameAsc',
    byNameDesc: 'OrderBy-NameDesc',
  },
};

export const filterFieldNames: Record<TFiltersDataKey, string> = {
  categoryIds: 'Label-Categories',
  adminMode: 'Label-AdminMode',
  orderBy: 'Label-OrderBy',
  orderBySelect: 'Label-OrderBy',
  searchText: 'Label-SearchText',
  hasWorkoutStats: 'Label-HasWorkoutStats',
  hasActiveWorkouts: 'Label-HasActiveWorkouts',
  langCode: 'Label-LangCode',
  langName: 'Label-LangName',
  searchLang: 'Label-SearchLang',
  minStarted: 'Label-MinStarted',
  maxStarted: 'Label-MaxStarted',
  minFinished: 'Label-MinFinished',
  maxFinished: 'Label-MaxFinished',
};
