export function jaroWinklerSimilarity(str1: string, str2: string, locale: string = 'en') {
  // Normalize strings for locale
  const normalize = (str: string) => {
    return str
      .normalize('NFKD') // Decompose accents
      .toLocaleLowerCase(locale)
      .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
  };

  const s1 = normalize(str1);
  const s2 = normalize(str2);
  // console.log('[jaroWinklerSimilarity]', str1, '->', s1)
  // console.log('[jaroWinklerSimilarity]', str2, '->', s2)
  // Examples:
  // [jaroWinklerSimilarity] HOLA MUNDO -> hola mundo
  // [jaroWinklerSimilarity] ёлка -> елка
  // [jaroWinklerSimilarity] Hello  world -> hello  world

  // Jaro similarity implementation
  if (s1 === s2) return 1.0;

  // const m = Math.min(s1.length, s2.length);
  let matches = 0;
  const range = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
  const s1Matches = new Array(s1.length).fill(false);
  const s2Matches = new Array(s2.length).fill(false);

  // Count matches
  for (let i = 0; i < s1.length; i++) {
    const start = Math.max(0, i - range);
    const end = Math.min(i + range + 1, s2.length);

    for (let j = start; j < end; j++) {
      if (!s2Matches[j] && s1[i] === s2[j]) {
        s1Matches[i] = s2Matches[j] = true;
        matches++;
        break;
      }
    }
  }

  if (matches === 0) return 0.0;

  // Count transpositions
  let k = 0;
  let transpositions = 0;
  for (let i = 0; i < s1.length; i++) {
    if (s1Matches[i]) {
      while (!s2Matches[k]) k++;
      if (s1[i] !== s2[k]) transpositions++;
      k++;
    }
  }

  // Jaro distance
  const jaro =
    // 01
    (matches / s1.length +
      // 02
      matches / s2.length +
      // 03
      (matches - transpositions / 2) / matches) /
    3.0;

  // Winkler modification for common prefix
  const prefixLength = Math.min(
    4,
    Array.from(s1).findIndex((c, i) => c !== s2[i]),
  );
  const winkler = jaro + prefixLength * 0.1 * (1 - jaro);

  return winkler;
}
