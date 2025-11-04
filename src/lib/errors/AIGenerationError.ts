import { GenericIDError } from './GenericIDError';

export const AIGenerationErrorTexts = {
  SUCCESS: 'No problems detected',
  UNKNOWN_USER_GRADE: 'User grade is unlnown',
  UNATHORIZED: 'Authorized user is required',
  GUEST_USERS_ARE_NOT_ALLOWED_TO_GENERATE: 'Guest users are not allowed to perform generations',
  BASIC_USER_HAS_EXCEEDED_GENERATION_LIMIT: 'Basic user has exceeded the total generation limit',
  PRO_USER_HAS_EXCEEDED_GENERATION_LIMIT: 'Pro user has exceeded the monthly generation limit',
  UNKNOWN_ERROR_OCCURRED: 'An error occurred while checking user generations',
} as const;

export type TAIGenerationErrorCode = keyof typeof AIGenerationErrorTexts;

export class AIGenerationError extends GenericIDError<typeof AIGenerationErrorTexts> {
  static texts = AIGenerationErrorTexts;

  constructor(code: TAIGenerationErrorCode) {
    super(code);
  }
}
