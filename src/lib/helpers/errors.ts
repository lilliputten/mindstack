import { ZodError } from 'zod';

import { GenericIDError } from '@/lib/errors/GenericIDError';

import { AIGenerationError, ErrorPlainOnject, InternalError, ServerAuthError } from '../errors';

interface TGetErrorTextOpts {
  omitErrorName?: boolean;
}

export function isErrorInstance<T extends Error>(
  err: unknown,
  ErrClass: new (...args: never[]) => T,
): err is T {
  if (!(err instanceof Error)) {
    return false;
  }
  return err instanceof ErrClass || err.name === ErrClass.name;
}

export function getGenericIDErrorText<T extends Record<string, string>>(
  err: GenericIDError<T>,
  ErrClass: typeof GenericIDError & { texts: T },
): string {
  // const texts = (err.constructor as typeof GenericIDError & { texts: T }).texts;
  return ErrClass.texts[err.message as keyof T] || err.message;
}

export function getErrorText(err: unknown, opts: TGetErrorTextOpts = {}): string {
  if (!err) {
    return '';
  }
  /* // TODO: APIError?
   * if (err instanceof APIError) {
   *   return err.details;
   * }
   */
  const isError = err instanceof Error;
  let errorText: string | undefined;
  if (err instanceof Event && (err.target instanceof AbortSignal || err.type === 'abort')) {
    errorText = 'AbortEvent';
  } else if (err instanceof AbortSignal) {
    errorText = 'AbortSignal';
  } else if (isErrorInstance(err, AIGenerationError)) {
    errorText = getGenericIDErrorText(err, AIGenerationError);
  } else if (isErrorInstance(err, ServerAuthError)) {
    errorText = getGenericIDErrorText(err, ServerAuthError);
  } else if (isErrorInstance(err, InternalError)) {
    errorText = `${err.message} (${err.statusCode})`;
  } else if (err instanceof ZodError) {
    const issues = err.issues.map((issue) => {
      const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
      return `${path}${issue.message}`;
    });
    errorText = issues.join('; ');
  } else if ((isError && err.message) || (err as ErrorPlainOnject).message) {
    errorText = (err as ErrorPlainOnject).message;
  } else if (err instanceof Object && Object.prototype.hasOwnProperty.call(err, 'digest')) {
    errorText = String((err as { digest: string }).digest);
  }
  if (errorText) {
    const errorName =
      ((isError && err.name) || (err as ErrorPlainOnject).name) && (err as ErrorPlainOnject).name;
    return [
      // Prepare combined error text
      !opts.omitErrorName && errorName !== 'Error' && errorName,
      errorText,
    ]
      .filter(Boolean)
      .join(': ');
  }
  // An object with the `digest` property
  return String(err);
}
