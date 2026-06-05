import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCodeValue } from '@common/errors/error-codes';

export class AppException extends HttpException {
  readonly code: ErrorCodeValue;
  readonly clientMessage: string;
  readonly fieldErrors?: string[];

  constructor(
    code: ErrorCodeValue,
    message: string,
    status: HttpStatus,
    fieldErrors?: string[],
  ) {
    super({ code, message, fieldErrors }, status);
    this.code = code;
    this.clientMessage = message;
    this.fieldErrors = fieldErrors;
  }
}

export class NotFoundAppException extends AppException {
  constructor(code: ErrorCodeValue, message: string) {
    super(code, message, HttpStatus.NOT_FOUND);
  }
}

export class BadRequestAppException extends AppException {
  constructor(
    code: ErrorCodeValue,
    message: string,
    fieldErrors?: string[],
  ) {
    super(code, message, HttpStatus.BAD_REQUEST, fieldErrors);
  }
}

export class ConflictAppException extends AppException {
  constructor(code: ErrorCodeValue, message: string) {
    super(code, message, HttpStatus.CONFLICT);
  }
}
