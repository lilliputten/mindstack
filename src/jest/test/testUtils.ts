import { formatDateTag, getRandomHashString } from '@/lib/helpers';

/**
 * Generates a unique tag for test data to prevent collisions between concurrent tests
 * Combines the date tag with a random suffix to ensure uniqueness
 */
export function generateTestTag(prefix?: string): string {
  const dateTag = formatDateTag();
  const randomSuffix = getRandomHashString(); // Math.random().toString(36).substring(2, 8); // Random 6-character string
  return [prefix, dateTag, randomSuffix].filter(Boolean).join('-');
}

/**
 * Creates a unique email address for test users
 */
export function generateTestEmail(prefix: string = 'user'): string {
  return `${generateTestTag(prefix)}@test.com`;
}
