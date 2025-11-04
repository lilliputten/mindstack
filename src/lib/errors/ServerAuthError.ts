import { GenericIDError } from './GenericIDError';

export const ServerAuthErrorTexts = {
  SUCCESS: 'No problems detected',
  UNATHORIZED: 'Authorized user is required',
  UNKNOWN_ERROR_OCCURRED: 'An error occurred while checking user generations',
} as const;

export type TServerAuthErrorCode = keyof typeof ServerAuthErrorTexts;

export class ServerAuthError extends GenericIDError<typeof ServerAuthErrorTexts> {
  static texts = ServerAuthErrorTexts;
  declare message: TServerAuthErrorCode;

  constructor(message: TServerAuthErrorCode) {
    super(message);
  }
}
