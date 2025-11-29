import { localesPathPrefixRegExp } from './types';

export function removePathLocalePrefix(path: string) {
  return path.replace(localesPathPrefixRegExp, '');
}

/** Compare test path with the current route */
export function comparePathsWithoutLocalePrefix(testPath: string, currentRoutePath: string) {
  return testPath === currentRoutePath || testPath === removePathLocalePrefix(currentRoutePath);
}
