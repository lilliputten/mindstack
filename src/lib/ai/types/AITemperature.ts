/** Default generation temperature.
 * Trying to use low temperatures in attempt to minify json hallucinations.
 */
import { GENERATION_TEMPERATURE } from '@/config/envServer';

export const defaultAiTemperature = GENERATION_TEMPERATURE || 0.1;
