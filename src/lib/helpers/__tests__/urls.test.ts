import { z } from 'zod';

import { parseUrlParamsWithSchema, updateUrlParamsWithSchema } from '../urls';

// Define a test schema for our tests
const parseTestSchema = z.object({
  searchLang: z.string().optional(),
  showOnlyMyTopics: z.boolean().optional(),
  hasActiveWorkouts: z.nullable(z.boolean()).optional(),
  orderBySelect: z.enum(['byRecent', 'byOldest', 'byNameAsc', 'byNameDesc']).optional(),
  count: z.number().optional(), // Note: this will fail with current implementation as it doesn't convert strings to numbers
});

// type TTestData = z.infer<typeof parseTestSchema>;

describe('parseUrlParamsWithSchema Function', () => {
  it('should parse string parameters correctly', () => {
    const result = parseUrlParamsWithSchema('?searchLang=en', parseTestSchema);

    expect(result).toEqual({ searchLang: 'en' });
  });

  it('should parse multiple parameters correctly', () => {
    const result = parseUrlParamsWithSchema(
      '?searchLang=es&showOnlyMyTopics=true',
      parseTestSchema,
    );

    expect(result).toEqual({ searchLang: 'es', showOnlyMyTopics: true });
  });

  it('should parse boolean parameters correctly ("true" string)', () => {
    const result = parseUrlParamsWithSchema('?showOnlyMyTopics=true', parseTestSchema);

    expect(result).toEqual({ showOnlyMyTopics: true });
  });

  it('should parse boolean parameters correctly ("false" string)', () => {
    const result = parseUrlParamsWithSchema('?showOnlyMyTopics=false', parseTestSchema);

    expect(result).toEqual({ showOnlyMyTopics: false });
  });

  it('should handle null values correctly', () => {
    const result = parseUrlParamsWithSchema('?hasActiveWorkouts=null', parseTestSchema);

    expect(result).toEqual({ hasActiveWorkouts: null });
  });

  it('should handle invalid parameters gracefully', () => {
    const result = parseUrlParamsWithSchema('?invalidParam=invalidValue', parseTestSchema);

    // Result should be an empty object since invalidParam is not part of the schema
    expect(result).toEqual({});
  });

  it('should handle completely invalid values', () => {
    const result = parseUrlParamsWithSchema('?orderBySelect=invalid_order_by', parseTestSchema, {
      noDebug: true,
    });

    // This should return an empty object since 'invalid_order_by' is not a valid option for orderBySelect
    expect(result).toEqual({});
  });

  it('should handle empty query string', () => {
    const result = parseUrlParamsWithSchema('', parseTestSchema);

    expect(result).toEqual({});
  });

  it('should handle query with no parameters', () => {
    const result = parseUrlParamsWithSchema('?', parseTestSchema);

    expect(result).toEqual({});
  });

  it('should handle multiple valid parameters', () => {
    const result = parseUrlParamsWithSchema(
      '?searchLang=fr&showOnlyMyTopics=false&orderBySelect=byRecent',
      parseTestSchema,
    );

    expect(result).toEqual({
      searchLang: 'fr',
      showOnlyMyTopics: false,
      orderBySelect: 'byRecent',
    });
  });
});

// Define a simple schema for testing
const updateTestSchema = z.object({
  searchText: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  hasQuestions: z.boolean().nullable().optional(),
  orderBy: z.enum(['asc', 'desc']).optional(),
});

describe('updateUrlParamsWithSchema', () => {
  it('should update URL params according to the provided schema', () => {
    const params = {
      searchText: 'test',
      categoryIds: ['cat1', 'cat2'],
      hasQuestions: true,
      orderBy: 'asc' as const,
    };

    const searchParams = new URLSearchParams('');
    const result = updateUrlParamsWithSchema(params, updateTestSchema, searchParams);

    expect(result.get('searchText')).toBe('test');
    expect(result.get('categoryIds')).toBe('cat1,cat2');
    expect(result.get('hasQuestions')).toBe('true');
    expect(result.get('orderBy')).toBe('asc');
  });

  it('should exclude parameters that match default values', () => {
    const params = {
      searchText: 'different', // Different from default
      categoryIds: ['cat1', 'cat2'],
      hasQuestions: null, // Same as default
      orderBy: 'asc' as const,
    };

    const defaultValues = {
      searchText: 'default',
      hasQuestions: null, // This matches the param value
    };

    const searchParams = new URLSearchParams(
      'searchText=default&hasQuestions=null&categoryIds=old',
    );
    const result = updateUrlParamsWithSchema(params, updateTestSchema, searchParams, defaultValues);

    expect(result.get('searchText')).toBe('different'); // Changed from default
    expect(result.get('categoryIds')).toBe('cat1,cat2');
    expect(result.get('hasQuestions')).toBeNull(); // Same as default, should be removed
    expect(result.get('orderBy')).toBe('asc');
  });

  it('should handle empty arrays by removing the parameter', () => {
    const params = {
      searchText: 'test',
      categoryIds: [],
    };

    const searchParams = new URLSearchParams('searchText=old&categoryIds=item1,item2');
    const result = updateUrlParamsWithSchema(params, updateTestSchema, searchParams);

    expect(result.get('searchText')).toBe('test');
    expect(result.get('categoryIds')).toBeNull(); // Should be removed when empty
  });

  it('should handle empty strings by removing the parameter', () => {
    const params = {
      searchText: '',
      categoryIds: ['cat1'],
    };

    const searchParams = new URLSearchParams('searchText=old&categoryIds=cat2');
    const result = updateUrlParamsWithSchema(params, updateTestSchema, searchParams);

    expect(result.get('searchText')).toBeNull(); // Should be removed when empty
    expect(result.get('categoryIds')).toBe('cat1');
  });

  it('should handle nullable values correctly', () => {
    const params = {
      hasQuestions: null,
    };

    const searchParams = new URLSearchParams('hasQuestions=true');
    const result = updateUrlParamsWithSchema(params, updateTestSchema, searchParams);

    expect(result.get('hasQuestions')).toBeNull(); // Should be removed when null
  });

  it('should handle boolean values correctly', () => {
    const params = {
      hasQuestions: true,
    };

    const searchParams = new URLSearchParams('');
    const result = updateUrlParamsWithSchema(params, updateTestSchema, searchParams);

    expect(result.get('hasQuestions')).toBe('true');
  });

  it('should preserve unrelated parameters', () => {
    const params = {
      searchText: 'test',
    };

    const searchParams = new URLSearchParams('unrelated=param&another=value');
    const result = updateUrlParamsWithSchema(params, updateTestSchema, searchParams);

    expect(result.get('searchText')).toBe('test');
    expect(result.get('unrelated')).toBe('param');
    expect(result.get('another')).toBe('value');
  });

  it('should only update schema-defined parameters', () => {
    // Using type assertion to temporarily add a field not in the schema for testing
    // This simulates passing an object that has extra properties not in the schema
    const params = {
      searchText: 'test',
      // This is not in the schema, so it should be ignored
      invalidParam: 'ignored',
    } as unknown as z.infer<typeof updateTestSchema>; // Using unknown as intermediate to avoid direct any

    const searchParams = new URLSearchParams('');
    const result = updateUrlParamsWithSchema(params, updateTestSchema, searchParams);

    expect(result.get('searchText')).toBe('test');
    // Invalid param should not be added since it's not in the schema
    expect(result.toString()).toBe('searchText=test');
  });
});
