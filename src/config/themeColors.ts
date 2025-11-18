// It's used in `tailwind.config.ts` to create generic theme configuration, and
// in `next.config.ts` to pass the variables to scss environment.
// See also the usage in: `styles/globals.scss`.

import colors from 'tailwindcss/colors';

export const primaryColor = '#48f'; //colors.blue['500']; // '#818';
export const primaryForegroundColor = '#fff';
export const secondaryColor = '#fa3';
export const secondaryForegroundColor = '#000';

export const darkBlueColor = '#224';

type TPredefinedColor = keyof typeof colors;
function getPredefinedColor(id: TPredefinedColor) {
  const colorSet = colors[id];
  if (typeof colorSet !== 'object' || !colorSet[500]) {
    throw new Error(`Undefined predefined color "${id}".`);
  }
  return colorSet[500];
}

export const defaultThemeColor: TThemeColorId = 'brand';
interface TThemeColorData {
  /* Initial color, for the default or `*-500` value */
  color: string;
  /** Percentage fix for the final color value adjustment, optional, default value is '0%' */
  fix?: number | string;
}
/* // OPTION 1: Define the types first
 * export const themeColorIds = ['brand', 'blue'] as const;
 * export type TThemeColorId = (typeof themeColorIds)[number];
 */
export const predefinedColors: TPredefinedColor[] = [
  // See for tailwind color definitions:
  // https://tailwindcss.com/docs/colors
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
  'slate',
  'gray',
  'zinc',
  'neutral',
  'stone',
] as const;
const predefinedColorsData = predefinedColors.reduce(
  (data, id) => {
    data[id] = { color: getPredefinedColor(id) };
    return data;
  },
  {} as Record<TPredefinedColor, TThemeColorData>,
);
export const themeColorData: Record<string, TThemeColorData> = {
  brand: {
    color: primaryColor,
    // fix: -10,
  },
  ...predefinedColorsData,
};
// Fixes for all the predefined colors
themeColorData.brand.fix = -10;
themeColorData.red.fix = -11;
themeColorData.orange.fix = -4;
themeColorData.lime.fix = 3;
themeColorData.green.fix = 3;
themeColorData.amber.fix = -4;
themeColorData.emerald.fix = 8;
themeColorData.teal.fix = 9;
themeColorData.cyan.fix = 6;
themeColorData.sky.fix = -1;
themeColorData.blue.fix = -11;
themeColorData.indigo.fix = -15;
themeColorData.violet.fix = -18;
themeColorData.purple.fix = -18;
themeColorData.fuchsia.fix = -13;
themeColorData.pink.fix = -13;
themeColorData.rose.fix = -12;
themeColorData.neutral.fix = 2;
themeColorData.stone.fix = 2;
// OPTION 2: Derive the types from the data
export type TThemeColorId = keyof typeof themeColorData;
export const themeColorIds = Object.keys(themeColorData) as TThemeColorId[];
