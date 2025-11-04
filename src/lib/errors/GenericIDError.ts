/** A generic error type which contains error id as a `message` field and error texts in a static `texts` property */
export abstract class GenericIDError<T extends Record<string, string>> extends Error {
  static texts: Record<string, string>;

  constructor(code: keyof T) {
    super(code as string);
    this.name = this.constructor.name;
  }
}
