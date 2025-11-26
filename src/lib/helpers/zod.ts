import { z, ZodObject, ZodRawShape, ZodTypeAny } from 'zod';

/**
 * Unwraps optional and nullable modifiers to get the base field type
 */
export function getBaseField(field: ZodTypeAny): ZodTypeAny {
  let baseField = field;

  // Keep unwrapping until we reach the base type
  while (baseField.isOptional() || baseField.isNullable()) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const innerType = (baseField as any)._def.innerType;
    if (innerType) {
      baseField = innerType;
    } else {
      break;
    }
  }

  return baseField;
}

export function makeAllFieldsCoerced<T extends ZodRawShape>(
  schema: ZodObject<T>,
): ZodObject<{ [K in keyof T]: ZodTypeAny }> {
  const newShape: Partial<{ [K in keyof T]: ZodTypeAny }> = {};

  for (const key in schema.shape) {
    if (Object.prototype.hasOwnProperty.call(schema.shape, key)) {
      const field = schema.shape[key];

      // Check optional and nullable modifiers
      const isOptional = field.isOptional();
      const isNullable = field.isNullable();

      // Determine base type for coercion
      const baseField = getBaseField(field);

      let coercedField: ZodTypeAny;

      if (baseField instanceof z.ZodNumber) {
        coercedField = z.coerce.number();
      } else if (baseField instanceof z.ZodBoolean) {
        coercedField = z.coerce.boolean();
      } else if (baseField instanceof z.ZodDate) {
        coercedField = z.coerce.date();
      } else if (baseField instanceof z.ZodBigInt) {
        coercedField = z.coerce.bigint();
      } else if (baseField instanceof z.ZodString) {
        coercedField = z.string(); // no string coercion in zod
      } else {
        // fallback: use original field
        coercedField = field;
      }

      // Reapply modifiers
      if (isNullable) coercedField = coercedField.nullable();
      if (isOptional) coercedField = coercedField.optional();

      newShape[key] = coercedField;
    }
  }

  return z.object(newShape as { [K in keyof T]: ZodTypeAny });
}

export function makeAllFieldsOptionalString<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newShape: { [K in keyof T]: z.ZodOptional<z.ZodString> } = {} as any;
  for (const key in schema.shape) {
    if (Object.prototype.hasOwnProperty.call(schema.shape, key)) {
      newShape[key as keyof T] = z.string().optional();
    }
  }
  return z.object(newShape);
}

export function makeNullableFieldsOptional<T extends ZodRawShape>(
  schema: ZodObject<T>,
): ZodObject<T> {
  // New shape object to hold converted fields
  const newShape: Partial<T> = {};

  for (const key in schema.shape) {
    if (Object.prototype.hasOwnProperty.call(schema.shape, key)) {
      const field = schema.shape[key];

      // Check if the field is a nullable type
      // Zod nullable is implemented as ZodOptional<ZodNullable<...>>, or ZodOptional<...> with inner nullable
      // But we can also check typeName or unwrap .nullable() from union with null

      // A reliable way is checking if unwrap().isNullable()

      // Unfortunately, zod doesn't expose a direct isNullable(), but we can check the ._def to see if it's ZodNullable
      if (field._def.typeName === 'ZodNullable') {
        // get the inner type (non-nullable part)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const innerType = (field as any)._def.innerType as ZodTypeAny;
        // convert it to optional instead of nullable:
        newShape[key] = innerType.optional() as unknown as T[typeof key];
      } else {
        // leave unchanged
        newShape[key] = field;
      }
    }
  }

  return z.object(newShape as T);
}
