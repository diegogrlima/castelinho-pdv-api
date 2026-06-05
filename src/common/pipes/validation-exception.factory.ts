import { ValidationError } from 'class-validator';
import { BadRequestAppException } from '@common/errors/app.exception';
import { ErrorCode } from '@common/errors/error-codes';

export function flattenValidationErrors(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => {
    if (error.constraints) {
      return Object.values(error.constraints);
    }
    if (error.children?.length) {
      return flattenValidationErrors(error.children);
    }
    return [];
  });
}

export function validationExceptionFactory(
  errors: ValidationError[],
): BadRequestAppException {
  return new BadRequestAppException(
    ErrorCode.VALIDATION_ERROR,
    'Dados inválidos',
    flattenValidationErrors(errors),
  );
}
