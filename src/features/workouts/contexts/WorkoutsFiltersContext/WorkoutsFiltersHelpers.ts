import { dontUseOnlyValueFor, TFiltersData, TFiltersDataKey } from './WorkoutsFiltersTypes';

export const getFilterFieldName = (field: TFiltersDataKey, t: (key: string) => string) => {
  const fieldNames: Record<TFiltersDataKey, string> = {
    adminMode: t('AdminMode'),
    orderBy: t('SortBy'),
    searchText: t('SearchText'),
    hasWorkoutStats: t('HasWorkoutStats'),
    hasActiveWorkouts: t('HasActiveWorkouts'),
    langCode: t('LangCode'),
    langName: t('LangName'),
    searchLang: t('SearchLang'),
    minStarted: t('MinStarted'),
    maxStarted: t('MaxStarted'),
    minFinished: t('MinFinished'),
    maxFinished: t('MaxFinished'),
    categoryIds: t('Categories'),
  };
  return fieldNames[field];
};

export const getActiveFilterIds = (filtersData: TFiltersData) => {
  const activeFilters: TFiltersDataKey[] = [];

  (Object.keys(filtersData) as TFiltersDataKey[]).forEach((key) => {
    const value = filtersData[key];
    if (value !== undefined && value !== null && value !== '') {
      activeFilters.push(key);
    }
  });

  return activeFilters;
};

export const getFiltersLabelValueString = (
  filtersData: TFiltersData,
  t: (key: string) => string,
): string => {
  const activeFilters = getActiveFilterIds(filtersData);

  if (activeFilters.length === 0) {
    return '';
  }

  return activeFilters
    .map((field) => {
      const value = filtersData[field];
      const fieldName = getFilterFieldName(field, t);

      if (dontUseOnlyValueFor.includes(field)) {
        return `${fieldName}`;
      }

      if (typeof value === 'boolean') {
        return value ? fieldName : `${fieldName}: no`;
      }

      return `${fieldName}: ${value}`;
    })
    .join(', ');
};
