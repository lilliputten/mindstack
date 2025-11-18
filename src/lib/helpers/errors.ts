import { GenericIDError } from '@/lib/errors/GenericIDError';

import { AIGenerationError, ServerAuthError } from '../errors';

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
  // if (err instanceof APIError) {
  //   return err.details;
  // }
  const isError = err instanceof Error;
  let errorText: string | undefined;
  if (isErrorInstance(err, AIGenerationError)) {
    errorText = getGenericIDErrorText(err, AIGenerationError);
  } else if (isErrorInstance(err, ServerAuthError)) {
    errorText = getGenericIDErrorText(err, ServerAuthError);
  } else if (isError) {
    errorText = err.message;
  } else if (err instanceof Object && Object.prototype.hasOwnProperty.call(err, 'digest')) {
    errorText = String((err as { digest: string }).digest);
  }
  if (errorText) {
    const errorName = isError && err.name;
    return [
      // Prepare combined error text
      !opts.omitErrorName && errorName,
      errorText,
    ]
      .filter(Boolean)
      .join(': ');
  }
  // An object with the `digest` property
  return String(err);
}
