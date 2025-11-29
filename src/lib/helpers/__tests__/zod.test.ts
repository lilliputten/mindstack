import { z } from 'zod';

import { getBaseField } from '../zod';

describe('getBaseField', () => {
  it('should return the same field if not optional or nullable', () => {
    const stringField = z.string();
    const numberField = z.number();
    const booleanField = z.boolean();

    expect(getBaseField(stringField)).toBe(stringField);
    expect(getBaseField(numberField)).toBe(numberField);
    expect(getBaseField(booleanField)).toBe(booleanField);
  });

  it('should unwrap optional fields', () => {
    const baseString = z.string();
    const optionalString = baseString.optional();

    const result = getBaseField(optionalString);
    expect(result).toBe(baseString);
  });

  it('should unwrap nullable fields', () => {
    const baseNumber = z.number();
    const nullableNumber = baseNumber.nullable();

    const result = getBaseField(nullableNumber);
    expect(result).toBe(baseNumber);
  });

  it('should unwrap both optional and nullable fields', () => {
    const baseBoolean = z.boolean();
    const optionalNullableBoolean = baseBoolean.nullable().optional();

    const result = getBaseField(optionalNullableBoolean);
    expect(result).toBe(baseBoolean);
  });

  it('should unwrap nested optional and nullable in different order', () => {
    const baseDate = z.date();
    const nullableOptionalDate = baseDate.optional().nullable();

    const result = getBaseField(nullableOptionalDate);
    expect(result).toBe(baseDate);
  });

  it('should handle complex types', () => {
    const baseArray = z.array(z.string());
    const optionalArray = baseArray.optional();

    const result = getBaseField(optionalArray);
    expect(result).toBe(baseArray);
  });

  it('should handle union types', () => {
    const baseUnion = z.union([z.string(), z.number()]);
    const optionalUnion = baseUnion.optional();

    const result = getBaseField(optionalUnion);
    expect(result).toBe(baseUnion);
  });
});
