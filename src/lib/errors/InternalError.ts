export class InternalError extends Error {
  statusCode: string;
  constructor(message: string, statusCode: string) {
    super(message);
    this.name = 'InternalError';
    this.statusCode = statusCode;
  }
}
