import { z } from 'zod';

import { parseUrlParamsWithSchema } from '../urls';

// Define a test schema for our tests
const testSchema = z.object({
  searchLang: z.string().optional(),
  showOnlyMyTopics: z.boolean().optional(),
  hasActiveWorkouts: z.nullable(z.boolean()).optional(),
  orderBySelect: z.enum(['byRecent', 'byOldest', 'byNameAsc', 'byNameDesc']).optional(),
  count: z.number().optional(), // Note: this will fail with current implementation as it doesn't convert strings to numbers
});

// type TTestData = z.infer<typeof testSchema>;

describe('parseUrlParamsWithSchema Function', () => {
  it('should parse string parameters correctly', () => {
    const result = parseUrlParamsWithSchema('?searchLang=en', testSchema);

    expect(result).toEqual({ searchLang: 'en' });
  });

  it('should parse multiple parameters correctly', () => {
    const result = parseUrlParamsWithSchema('?searchLang=es&showOnlyMyTopics=true', testSchema);

    expect(result).toEqual({ searchLang: 'es', showOnlyMyTopics: true });
  });

  it('should parse boolean parameters correctly ("true" string)', () => {
    const result = parseUrlParamsWithSchema('?showOnlyMyTopics=true', testSchema);

    expect(result).toEqual({ showOnlyMyTopics: true });
  });

  it('should parse boolean parameters correctly ("false" string)', () => {
    const result = parseUrlParamsWithSchema('?showOnlyMyTopics=false', testSchema);

    expect(result).toEqual({ showOnlyMyTopics: false });
  });

  it('should handle null values correctly', () => {
    const result = parseUrlParamsWithSchema('?hasActiveWorkouts=null', testSchema);

    expect(result).toEqual({ hasActiveWorkouts: null });
  });

  it('should handle invalid parameters gracefully', () => {
    const result = parseUrlParamsWithSchema('?invalidParam=invalidValue', testSchema);

    // Result should be an empty object since invalidParam is not part of the schema
    expect(result).toEqual({});
  });

  it('should handle completely invalid values', () => {
    const result = parseUrlParamsWithSchema('?orderBySelect=invalid_order_by', testSchema, {
      noDebug: true,
    });

    // This should return an empty object since 'invalid_order_by' is not a valid option for orderBySelect
    expect(result).toEqual({});
  });

  it('should handle empty query string', () => {
    const result = parseUrlParamsWithSchema('', testSchema);

    expect(result).toEqual({});
  });

  it('should handle query with no parameters', () => {
    const result = parseUrlParamsWithSchema('?', testSchema);

    expect(result).toEqual({});
  });

  it('should handle multiple valid parameters', () => {
    const result = parseUrlParamsWithSchema(
      '?searchLang=fr&showOnlyMyTopics=false&orderBySelect=byRecent',
      testSchema,
    );

    expect(result).toEqual({
      searchLang: 'fr',
      showOnlyMyTopics: false,
      orderBySelect: 'byRecent',
    });
  });
});
