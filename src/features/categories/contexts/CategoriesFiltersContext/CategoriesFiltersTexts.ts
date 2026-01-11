import { TFiltersDataKey, TOrderBySelectOption } from './CategoriesFiltersTypes';

// NOTE: These texts should be key values in the translation files. See `AvailableCategoriesFilterTexts` namespace.

export const fieldUnionStrings = {
  true: 'Yes',
  false: 'No',
  null: 'Ignore',
};

export const specifcFieldUnionStrings: Partial<Record<TFiltersDataKey, Record<string, string>>> = {
  hasImage: {
    true: 'WithImage',
    false: 'WithoutImage',
  },
  hasTopics: {
    true: 'WithTopics',
    false: 'WithoutTopics',
  },
  status: {
    PUBLIC: 'Status-Public',
    SUGGESTED: 'Status-Suggested',
    HIDDEN: 'Status-Hidden',
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
  status: 'Label-Status',
  hasImage: 'Label-HasImage',
  hasTopics: 'Label-HasTopics',
  orderBySelect: 'Label-OrderBy',
  minCreatedAt: 'Label-MinCreatedAt',
  maxCreatedAt: 'Label-MaxCreatedAt',
  minUpdatedAt: 'Label-MinUpdatedAt',
  maxUpdatedAt: 'Label-MaxUpdatedAt',
};
