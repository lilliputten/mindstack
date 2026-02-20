import { parseUrlFilters } from '../parseUrlFilters';

// Test the URL parsing helper function directly
describe('parseUrlFilters Function', () => {
  it('should parse langCode parameter from URL', () => {
    const result = parseUrlFilters('?langCode=en');

    expect(result.langCode).toBe('en');
  });

  it('should parse categoryIds parameter from URL', () => {
    const result = parseUrlFilters('?categoryIds=cat1,cat2,cat3');

    expect(result.categoryIds).toEqual(['cat1', 'cat2', 'cat3']);
  });

  it('should parse multiple parameters from URL', () => {
    const result = parseUrlFilters('?langCode=es&categoryIds=cat1,cat2&searchText=test');

    expect(result.langCode).toBe('es');
    expect(result.categoryIds).toEqual(['cat1', 'cat2']);
    expect(result.searchText).toBe('test');
  });

  it('should parse boolean parameters correctly', () => {
    const result = parseUrlFilters('?showOnlyMyTopics=true&hasWorkoutStats=false');

    expect(result.showOnlyMyTopics).toBe(true);
    expect(result.hasWorkoutStats).toBe(false);
  });

  it('should handle null values for three state fields', () => {
    const result = parseUrlFilters('?hasActiveWorkouts=null');

    expect(result.hasActiveWorkouts).toBeNull();
  });

  it('should handle invalid parameters gracefully', () => {
    // Test with completely invalid parameter
    const result = parseUrlFilters('?invalidParam=invalidValue');

    // Result should be an empty object since invalidParam is not part of the schema
    expect(result).toEqual({});
  });

  it('should handle completely invalid values', () => {
    // Testing a field with an impossible value - like sending a string where only specific enums are allowed
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
