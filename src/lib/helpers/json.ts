import { parse } from 'best-effort-json-parser';
import { jsonrepair } from 'jsonrepair';

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

function sanitizeRawJson(rawContent?: string, _noDebug?: boolean) {
  rawContent = rawContent?.trim();
  if (!rawContent || rawContent?.length === 0) {
    return undefined;
  }

  // NOTE: Cloudflare might return this: ```json\n{...}\n```
  // NOTE: Sometimes it's possible to have some content before ```json from Cloudflare
  const mdStart = '```json';
  const mdEnd = '```';
  const jsonStart = rawContent.indexOf(mdStart);
  // OLD APPROACH: if (rawContent.startsWith(mdStart) && rawContent.endsWith(mdEnd)) ...
  if (jsonStart !== -1) {
    rawContent = rawContent.substring(jsonStart + mdStart.length);
    const lastIndex = rawContent.lastIndexOf(mdEnd);
    if (lastIndex !== -1) {
      rawContent = rawContent.substring(0, lastIndex);
    }
    rawContent = rawContent.trim();
  }

  return rawContent;
}

export function parseDangerousJson(rawContent?: string, noDebug?: boolean) {
  rawContent = sanitizeRawJson(rawContent, noDebug);
  if (!rawContent || !rawContent?.length) {
    return undefined;
  }

  try {
    // First try to parse as-is - it might be valid
    return JSON.parse(rawContent);
  } catch (error) {
    if (!noDebug) {
      // prettier-ignore
      console.warn('[json:parseDangerousJson] Failure level 1: Failed to parse json, trying to heal', { // eslint-disable-line no-console
        rawContent,
        error,
      });
      debugger; // eslint-disable-line no-debugger
    }

    try {
      // JSON is invalid, try to repair with jsonrepair
      rawContent = jsonrepair(rawContent);
      return JSON.parse(rawContent);
    } catch (error) {
      if (!noDebug) {
        // prettier-ignore
        console.warn('[json:parseDangerousJson] Failure level 2: Failed to repair json via jsonrepair', { // eslint-disable-line no-console
          rawContent,
          error,
        });
        debugger; // eslint-disable-line no-debugger
      }
    }

    try {
      // JSON is invalid, try to repair with best-effort-json-parser
      return parse(rawContent);
    } catch (healError) {
      if (!noDebug) {
        // prettier-ignore
        console.warn('[json:parseDangerousJson] Failure level 3: Failed to repair with best-effort-json-parser', { // eslint-disable-line no-console
          rawContent,
          healError,
        });
        debugger; // eslint-disable-line no-debugger
      }
      return undefined;
    }
  }
}
