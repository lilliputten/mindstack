import { parseUrlFilters } from '../parseUrlFilters';

describe('parseUrlFilters Function for Categories', () => {
  it('should parse searchLang parameter from URL', () => {
    const result = parseUrlFilters('?searchLang=en');

    expect(result.searchLang).toBe('en');
  });

  it('should parse multiple parameters from URL', () => {
    const result = parseUrlFilters('?searchLang=es&searchText=test');

    expect(result.searchLang).toBe('es');
    expect(result.searchText).toBe('test');
  });

  it('should parse boolean parameters correctly', () => {
    const result = parseUrlFilters('?hasImage=true&hasTopics=false');

    expect(result.hasImage).toBe(true);
    expect(result.hasTopics).toBe(false);
  });

  it('should handle null values for nullable fields', () => {
    const result = parseUrlFilters('?hasImage=null');

    expect(result.hasImage).toBeNull();
  });

  it('should handle invalid parameters gracefully', () => {
    const result = parseUrlFilters('?invalidParam=invalidValue');

    // Result should be an empty object since invalidParam is not part of the schema
    expect(result).toEqual({});
  });

  it('should handle completely invalid values', () => {
    const result = parseUrlFilters('?orderBySelect=invalid_order_by', { noDebug: true });

    // This should return an empty object since 'invalid_order_by' is not a valid option for orderBySelect
    expect(result).toEqual({});
  });

  it('should handle empty query string', () => {
    const result = parseUrlFilters('');

    expect(result).toEqual({});
  });

  it('should handle query with no parameters', () => {
    const result = parseUrlFilters('?');

    expect(result).toEqual({});
  });
});
