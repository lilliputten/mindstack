import { TLanguageId } from '@/lib/types/language';
import { localesList } from '@/i18n';

import jsonLanguages from './ISO-639-1-language.json';

const allLanguageCodes = jsonLanguages.map(({ code }) => code as TLanguageId);
const allPossibleLanguageCodesNonUniqueList = [...allLanguageCodes, ...localesList];
export const allPossibleLanguageCodesSet = new Set(allPossibleLanguageCodesNonUniqueList);
