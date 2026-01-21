import { filtersDataSchema, TFiltersData } from '../TopicsFiltersTypes';

interface TOptions {
  noDebug?: boolean;
}

/**
 * Parses URL query parameters using the filters data schema
 * @param searchParamsString - The URL search parameters string (e.g., "?searchLang=en&categoryIds=cat1,cat2")
 * @returns Partial<TFiltersData> with parsed parameters or empty object if parsing fails
 */
export function parseUrlFilters(
  searchParamsString: string,
  opts?: TOptions,
): Partial<TFiltersData> {
  try {
    // Create URLSearchParams from the search string
    const searchParams = new URLSearchParams(searchParamsString);

    // Convert URLSearchParams to a plain object with type conversion
    const paramsObj: Record<string, unknown> = {};
    searchParams.forEach((value: string, key: string) => {
      // Handle categoryIds specially since it's an array
      if (key === 'categoryIds' && typeof value === 'string') {
        paramsObj[key] = value
          .split(',')
          .map((id: string) => id.trim())
          .filter((id: string) => id.length > 0);
      } else {
        // Convert string values to appropriate types for the schema
        if (value === 'true') {
          paramsObj[key] = true;
        } else if (value === 'false') {
          paramsObj[key] = false;
        } else if (value === 'null') {
          paramsObj[key] = null;
        } else {
          // Keep as string
          paramsObj[key] = value;
        }
      }
    });

    // Parse and validate the parameters using the filters data schema
    const parsedParams = filtersDataSchema.partial().parse(paramsObj);
    return parsedParams as Partial<TFiltersData>;
  } catch (error) {
    // If there's an error parsing, log it but return an empty object
    // This prevents crashes if invalid parameters are passed in the URL
    if (!opts?.noDebug) {
      // eslint-disable-next-line no-console
      console.warn('Invalid URL parameters for filters', error);
    }
    return {};
  }
}
