import { z } from 'zod';

import { getErrorText } from '../errors';

describe('getErrorText', () => {
  describe('ZodError handling', () => {
    it('should format single field validation error', () => {
      const schema = z.object({
        searchLang: z.string(),
      });

      try {
        schema.parse({ searchLang: 123 });
      } catch (error) {
        const result = getErrorText(error);
        expect(result).toBe('ZodError: searchLang: Expected string, received number');
      }
    });

    it('should format multiple field validation errors', () => {
      const schema = z.object({
        searchLang: z.string(),
        hasWorkoutStats: z.boolean(),
      });

      try {
        schema.parse({ searchLang: 123, hasWorkoutStats: 'invalid' });
      } catch (error) {
        const result = getErrorText(error);
        expect(result).toContain('searchLang: Expected string, received number');
        expect(result).toContain('hasWorkoutStats: Expected boolean, received string');
      }
    });

    it('should format nested field validation error', () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
        }),
      });

      try {
        schema.parse({ user: { name: 123 } });
      } catch (error) {
        const result = getErrorText(error);
        expect(result).toBe('ZodError: user.name: Expected string, received number');
      }
    });

    it('should format root level validation error', () => {
      const schema = z.string();

      try {
        schema.parse(123);
      } catch (error) {
        const result = getErrorText(error);
        expect(result).toBe('ZodError: Expected string, received number');
      }
    });

    it('should omit error name when requested', () => {
      const schema = z.object({
        searchLang: z.string(),
      });

      try {
        schema.parse({ searchLang: 123 });
      } catch (error) {
        const result = getErrorText(error, { omitErrorName: true });
        expect(result).toBe('searchLang: Expected string, received number');
      }
    });
  });
});
