import { parse } from 'best-effort-json-parser';

export function safeJsonParse<T = unknown>(data: string | undefined | null, defaultValue: T) {
  if (!data) {
    return defaultValue;
  }
  try {
    return JSON.parse(data) as T;
  } catch {
    return defaultValue;
  }
}

export function parseDangerousJson(rawString?: string, noDebug?: boolean) {
  rawString = rawString?.trim();
  if (!rawString || rawString?.length === 0) {
    return undefined;
  }

  // NOTE: Cloudflare might return this: ```json\n{...}\n```
  const mdStart = '```json';
  const mdEnd = '```';
  if (rawString.startsWith(mdStart) && rawString.endsWith(mdEnd)) {
    rawString = rawString.substring(mdStart.length, rawString.length - mdEnd.length).trim();
  }

  try {
    // First try to parse as-is - it might be valid
    return JSON.parse(rawString);
  } catch (error) {
    if (!noDebug) {
      // eslint-disable-next-line no-console
      console.warn('[json:parseDangerousJson] Failed to parse json, trying to heal', {
        rawString,
        error,
      });
      debugger; // eslint-disable-line no-debugger
    }

    try {
      // JSON is invalid, let's try to heal it using the best-effort parser
      return parse(rawString);
    } catch (healError) {
      if (!noDebug) {
        // eslint-disable-next-line no-console
        console.warn('[json:parseDangerousJson] Failed to heal json', {
          rawString,
          healError,
        });
      }
      return undefined;
    }
  }
}
