import { z } from 'zod';

import { filterOutEmpties } from './arrays';

type TUrlParamScalarValue = string | number | boolean | undefined | null;
type TUrlParamValue = TUrlParamScalarValue | unknown[] | Record<string, unknown>;

interface TOptions {
  noDebug?: boolean;
}

interface TComposeUrlOptions {
  /** Skip all undefined (or null) values (default=true) */
  omitEmpty?: boolean;
  /** Skip all falsy values */
  omitFalsy?: boolean;
}

export type TComposeUrlParams = Record<string, TUrlParamValue>;

function stringifyUrlValue(val: unknown) {
  if (val == undefined) {
    return String(null);
  } else if (typeof val === 'object') {
    // Jsonify array or object...
    return JSON.stringify(val);
  } else if (typeof val !== 'string') {
    return String(val);
  }
  return val;
}

/** Compose an url query string (`{a: 1, b: 2}` => `a=1&b=2`
 * @param {TComposeUrlParams} params
 * @param {TComposeUrlOptions} options
 * @param {boolean} [options.omitEmpty=true] - Skip all undefined (or null) values (default=true)
 * @param {boolean} [options.omitFalsy] - Skip all falsy values
 */
export function composeUrlQuery(
  params: TComposeUrlParams = {},
  options: TComposeUrlOptions = {},
): string {
  const { omitEmpty = true, omitFalsy } = options;
  const queryString = Object.entries(params)
    // Filter non-empty values
    .filter(
      ([key, value]) =>
        key && (!omitEmpty || (value != undefined && value !== '')) && (!omitFalsy || !!value),
    )
    // Create a 'key=value' string
    .map((pair) => pair.map(stringifyUrlValue).map(encodeURIComponent).join('='))
    // Combine with '&'
    .join('&');
  // Return final url
  return queryString;
}

/** Compose an url from the url base and parameters hash
 * @param {string} baseUrl
 * @param {string} queryString
 */
export function appendUrlQuery(baseUrl: string, queryString?: string): string {
  const hasQuestionMark = baseUrl.includes('?');
  // const hasAndMark = baseUrl.includes('&');
  const delim = hasQuestionMark ? '&' : '?';
  // Remove '&' or '?' from `queryString`
  if (queryString?.startsWith('?') || queryString?.startsWith('&')) {
    queryString = queryString.substring(1);
  }
  // Return combined url
  return [baseUrl, queryString].filter(Boolean).join(delim);
}

/** Compose an url from the url base and parameters hash
 * @param {string} baseUrl
 * @param {[...string[]]} ...queryStrings
 */
export function appendUrlQueries(baseUrl: string, ...queryStrings: (string | undefined)[]): string {
  // Join all the query string step by step...
  return filterOutEmpties<string>(queryStrings).reduce((baseUrl, queryString) => {
    return appendUrlQuery(baseUrl, queryString);
  }, baseUrl);
}

/** Compose an url from the url base and parameters hash
 * @param {string} baseUrl
 * @param {TComposeUrlParams} params
 * @param {TComposeUrlOptions} options
 * @param {boolean} [options.omitEmpty=true] - Skip all undefined (or null) values (default=true)
 * @param {boolean} [options.omitFalsy] - Skip all falsy values
 */
export function composeUrl(
  baseUrl: string,
  params: TComposeUrlParams = {},
  options: TComposeUrlOptions = {},
): string {
  const queryString = composeUrlQuery(params, options);
  return appendUrlQuery(baseUrl, queryString);
}

/**
 * Generic function to parse URL query parameters using a provided Zod schema
 * @param searchParamsString - The URL search parameters string (e.g., "?param1=value1&param2=value2")
 * @param schema - The Zod schema to validate and parse the parameters
 * @returns Parsed parameters according to the schema or empty object if parsing fails
 */
export function parseUrlParamsWithSchema<T extends z.ZodRawShape>(
  searchParamsString: string,
  schema: z.ZodObject<T>,
  opts?: TOptions,
): z.infer<typeof schema> | object {
  try {
    // Create URLSearchParams from the search string
    const searchParams = new URLSearchParams(searchParamsString);

    // Convert URLSearchParams to a plain object with type conversion
    const paramsObj: Record<string, unknown> = {};
    searchParams.forEach((value: string, key: string) => {
      // Default conversion: convert string values to appropriate types for the schema
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
    });

    // Parse and validate the parameters using the provided schema
    const parsedParams = schema.partial().parse(paramsObj);
    return parsedParams;
  } catch (error) {
    // If there's an error parsing, log it but return an empty object
    if (!opts?.noDebug) {
      // This prevents crashes if invalid parameters are passed in the URL
      // eslint-disable-next-line no-console
      console.warn('Invalid URL parameters', error);
    }
    return {};
  }
}
