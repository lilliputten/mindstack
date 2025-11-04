export function getRandomHashString(len: number = 4) {
  const randVal = Math.random();
  const hash = (randVal + 1).toString(36).substring(2, 2 + len);
  // console.log('getRandomHashString:', randVal, '->', hash);
  return hash;
}

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

export function ucFirst(str: string) {
  const c = str.substring(0, 1);
  const rest = str.substring(1);
  return c.toUpperCase() + rest;
}

export function nFormatter(num: number, digits?: number) {
  if (!num) {
    return '0';
  }
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
  return item ? (num / item.value).toFixed(digits || 1).replace(rx, '$1') + item.symbol : '0';
}

// TODO: Move to helpers/strings
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
