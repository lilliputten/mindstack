/** quoteHtmlAttr -- quote all invalid characters for html */
export function quoteHtmlAttr(str: string, preserveCR?: boolean) {
  const crValue = preserveCR ? '&#13;' : '\n';
  return (
    String(str) // Forces the conversion to string
      .replace(/&/g, '&amp;') // This MUST be the 1st replacement
      .replace(/'/g, '&apos;') // The 4 other predefined entities, required
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // You may add other replacements here for HTML only (but it's not
      // necessary). Or for XML, only if the named entities are defined in its
      // DTD.
      .replace(/\r\n/g, crValue) // Must be before the next replacement
      .replace(/[\r\n]/g, crValue)
  );
}

/**
 * Formats a number to a shortened string representation with SI unit prefixes.
 *
 * This function takes a number and formats it using appropriate SI unit prefixes
 * (K for thousands, M for millions, G for billions, T for trillions, etc.) to make
 * large numbers more readable. It also handles decimal precision and removes
 * trailing zeros.
 *
 * @param num - The number to format
 * @param digits - The number of digits after the decimal point (default: 1)
 * @returns A formatted string with SI unit suffix (K, M, G, T, P, E) or '0' if the number is falsy
 *
 * @example
 * nFormatter(1000) // Returns '1K'
 * nFormatter(1500) // Returns '1.5K'
 * nFormatter(1000000) // Returns '1M'
 * nFormatter(1234567, 2) // Returns '1.23M'
 * nFormatter(0) // Returns '0'
 */
export function nFormatter(num: number, digits?: number) {
  if (!num) {
    return '0';
  }
  const defaultDigits = 1;
  // TODO: Use translator?
  const lookup = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'K' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'G' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  return item
    ? (num / item.value)
        .toFixed(typeof digits === 'number' ? digits : defaultDigits)
        .replace(rx, '$1') + item.symbol
    : '0';
}

export function capitalizeString(str: string) {
  if (!str || typeof str !== 'string') {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const defaultEllipsis = '…';

export function truncateString(str?: string, len?: number, ellipsis: string = defaultEllipsis) {
  if (!str || !len) {
    return '';
  }
  str = str.trim();
  if (str.length > len) {
    return str.substring(0, len - ellipsis.length) + ellipsis;
  }
  return str;
}

export function getRandomHashString(len: number = 4) {
  const randVal = Math.random();
  const hash = (randVal + 1)
    .toString(36)
    // Remove the leading `1.`
    .substring(2, 2 + len);
  return hash;
}

export function getNumericHash(str?: string) {
  if (!str) {
    return 0;
  }
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return hash.toString(16);
}

export function getAbcHashString(str?: string) {
  if (!str) {
    return '';
  }
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0; // keep as unsigned 32-bit
  }
  return hash.toString(36); // base 36 for alphanumeric
}
