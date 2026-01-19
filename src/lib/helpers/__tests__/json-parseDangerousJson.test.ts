import { disableErrorLogging, enableErrorLogging } from 'best-effort-json-parser';

import { parseDangerousJson } from '../json';

describe('parseDangerousJson', () => {
  beforeAll(() => {
    disableErrorLogging();
  });

  afterAll(() => {
    enableErrorLogging();
  });

  // Test Case 1: Unpaired brackets
  test('should handle unpaired brackets', () => {
    const unpairedBracketsJson = `{ "count": 1, "items":
      [
        {
          { "text": "TEXT-1", "answersCount": 3, "answers": [
            { "text": "TEXT-2", "explanation": "TEXT-3", "isCorrect": true },
            { "text": "TEXT-4", "explanation": "TEXT-5", "isCorrect": true },
            { "text": "TEXT-6", "explanation": "TEXT-7", "isCorrect": false }
          ]
        }
      ]
    }`;

    // Should be invalid JSON initially
    expect(() => JSON.parse(unpairedBracketsJson)).toThrow();

    const healed = parseDangerousJson(unpairedBracketsJson, true);
    expect(healed).toBeDefined();

    // The library returns objects directly, so we should check if it's an object
    expect(typeof healed).toBe('object');
    expect(healed).toHaveProperty('count');
    expect(healed).toHaveProperty('items');
  });

  // Test Case 2: Incorrectly repaired JSON
  test('should handle incorrectly repaired JSON', () => {
    const incorrectlyRepairedJson = `{ "count": 1 "items":
      [
        {},
        { "text": "TEXT-1", "answersCount": 3, "answers": [
          { "text": "TEXT-2", "explanation": "TEXT-3", "isCorrect": true },
          { "text": "TEXT-4", "explanation": "TEXT-5", "isCorrect": true },
          { "text": "TEXT-6", "explanation": "TEXT-7", "isCorrect": false }
        ]}
      ]}`;

    // Should be invalid JSON initially
    expect(() => JSON.parse(incorrectlyRepairedJson)).toThrow();

    const healed = parseDangerousJson(incorrectlyRepairedJson, true);
    expect(healed).toBeDefined();

    // The library returns objects directly
    expect(typeof healed).toBe('object');
    expect(healed).toHaveProperty('count');
  });

  // Test Case 3: Missed comma (the original sample)
  test('should handle missed comma', () => {
    const missedCommaJson = `{
      "count": 1,
      "items": [
        {
          {
            "text": "TEXT-1",
            "answersCount": 2
            "answers": [
              { "text": "TEXT-2", "explanation": "TEXT-3", "isCorrect": true },
              { "text": "TEXT-4", "explanation": "TEXT-5", "isCorrect": false }
            ]
          }
        }
      ]
    }`;

    // Should be invalid JSON initially
    expect(() => JSON.parse(missedCommaJson)).toThrow();

    const healed = parseDangerousJson(missedCommaJson, true);
    expect(healed).toBeDefined();

    // The library returns objects directly
    expect(typeof healed).toBe('object');
    expect(healed).toHaveProperty('count');
    expect(healed).toHaveProperty('items');
  });

  // Test Case 4: Valid JSON should return parsed object
  test('should parse valid JSON correctly', () => {
    const validJson = `{
      "count": 1,
      "items": [
        {
          "text": "TEXT-1",
          "answersCount": 2,
          "answers": [
            { "text": "TEXT-2", "isCorrect": true },
            { "text": "TEXT-3", "isCorrect": false }
          ]
        }
      ]
    }`;

    const result = parseDangerousJson(validJson, true);
    expect(typeof result).toBe('object');
    expect(result).toHaveProperty('count', 1);
    expect(result).toHaveProperty('items');
    expect(Array.isArray(result?.items)).toBe(true);
  });

  // Test Case 5: Empty or undefined input
  test('should handle empty input gracefully', () => {
    expect(parseDangerousJson(undefined, true)).toBeUndefined();
    expect(parseDangerousJson('', true)).toBeUndefined();
    expect(parseDangerousJson('   ', true)).toBeUndefined();
  });

  // Test Case 6: Completely invalid JSON
  test('should handle completely invalid JSON gracefully', () => {
    const completelyInvalid = 'This is not JSON at all { [ }';

    const result = parseDangerousJson(completelyInvalid, true);
    // The best-effort parser tries to extract whatever it can
    // For this input, it might return "This" or some parsed fragment
    expect(result).toBeDefined();
    // The library attempts to parse whatever it can, so we can't guarantee undefined
  });
});
