/** Creates pre-calculated table for nFormatter function
 * @param [useKBytes] - Use KBytes as a base (1024 instead of 1000)
 */
function getNFormatterLookupTable(useKBytes?: boolean) {
  const base = useKBytes ? 1024 : 1000;
  const lookup = [
    { value: Math.pow(base, 6) /* 1e18 */, symbol: 'E' },
    { value: Math.pow(base, 5) /* 1e15 */, symbol: 'P' },
    { value: Math.pow(base, 4) /* 1e12 */, symbol: 'T' },
    { value: Math.pow(base, 3) /* 1e9 */, symbol: 'G' },
    { value: Math.pow(base, 2) /* 1e6 */, symbol: 'M' },
    { value: base /* 1e3 */, symbol: 'K' },
    { value: 1, symbol: '' },
  ] as const;
  return lookup;
}

const regularNFormaterLookupTable = getNFormatterLookupTable(false);
const kBytesNFormaterLookupTable = getNFormatterLookupTable(true);
const nFormatterRegex: RegExp = /\.0+$|(\.[0-9]*[1-9])0+$/;

/**
 * Formats a number to a shortened string representation with SI unit prefixes.
 *
 * This function takes a number and formats it using appropriate SI unit
 * prefixes (K for thousands, M for millions, G for billions, T for trillions,
 * etc.) to make large numbers more readable. It supports both decimal (base
 * 1000) and binary (base 1024) units through the useKBytes parameter. It also
 * handles decimal precision and removes trailing zeros.
 *
 * @param num - The number to format
 * @param [useKBytes] - Use KBytes as a base (1024 instead of 1000). When true,
 * uses binary units (KiB, MiB, etc.); when false or undefined, uses decimal
 * units (KB, MB, etc.). Default is false.
 * @param digits - The number of digits after the decimal point (default: 1)
 * @returns A formatted string with SI unit suffix (K, M, G, T, P, E) or '0' if
 * the number is falsy
 *
 * @example
 * nFormatter(1000) // Returns '1K'
 * nFormatter(1500) // Returns '1.5K'
 * nFormatter(1000000) // Returns '1M'
 * nFormatter(1234567, 2) // Returns '1.23M'
 * nFormatter(0) // Returns '0'
 *
 * @example Using KBytes (base 1024) for binary units
 * nFormatter(1024, true) // Returns '1K' (1024 bytes = 1KB in binary)
 * nFormatter(2048, true) // Returns '2K' (2048 bytes = 2KB in binary)
 * nFormatter(1048576, true) // Returns '1M' (1024^2 bytes = 1MB in binary)
 * nFormatter(1024, true, 2) // Returns '1K' with 2 decimal places precision
 */
export function nFormatter(num: number, useKBytes?: boolean, digits?: number) {
  if (!num) {
    return '0';
  }
  const defaultDigits = 1;
  const lookup = useKBytes ? kBytesNFormaterLookupTable : regularNFormaterLookupTable;
  const item = lookup
    // .slice()
    // .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  return item
    ? (num / item.value)
        .toFixed(typeof digits === 'number' ? digits : defaultDigits)
        .replace(nFormatterRegex, '$1') + item.symbol
    : '0';
}
