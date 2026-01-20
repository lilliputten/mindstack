import { TTranslator } from '@/i18n';

export type TContentLimitErrorCode =
  | 'UNAUTHORIZED'
  | 'GUEST_USERS_NOT_ALLOWED'
  | 'TOPICS_LIMIT_REACHED'
  | 'QUESTIONS_LIMIT_REACHED'
  | 'ANSWERS_LIMIT_REACHED'
  | 'UNKNOWN_ERROR';

export class ContentLimitError extends Error {
  public readonly code: TContentLimitErrorCode;
  public readonly userGrade?: string;

  constructor(code: TContentLimitErrorCode, message?: string, userGrade?: string) {
    super(message || code); // || getDefaultMessage(code));
    this.name = 'ContentLimitError';
    this.code = code;
    this.userGrade = userGrade;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ContentLimitError);
    }
  }
}

/* // UNUSED: getDefaultMessage
 * function getDefaultMessage(code: TContentLimitErrorCode): string {
 *   const messages: Record<TContentLimitErrorCode, string> = {
 *     UNAUTHORIZED: 'User not authenticated',
 *     GUEST_USERS_NOT_ALLOWED: 'Guest users are not allowed to create content',
 *     TOPICS_LIMIT_REACHED: 'Topic limit reached',
 *     QUESTIONS_LIMIT_REACHED: 'Question limit reached',
 *     ANSWERS_LIMIT_REACHED: 'Answer limit reached',
 *     UNKNOWN_ERROR: 'Unknown content limit error',
 *   };
 *   return messages[code];
 * }
 */

export function getLocalizedLimitError(errorCode?: TContentLimitErrorCode, t?: TTranslator) {
  const defaultResult: string = 'UnknownError';
  let result: string | undefined = errorCode ? 'LimitsError.' + errorCode : defaultResult;
  if (t) {
    result = t(result) || t(defaultResult);
  }
  return result;
}
