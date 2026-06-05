import { ErrorCode } from '@common/errors/error-codes';
import {
  BadRequestAppException,
  ConflictAppException,
  NotFoundAppException,
} from '@common/errors/app.exception';

export const StockErrors = {
  notFound: () =>
    new NotFoundAppException(
      ErrorCode.STOCK_NOT_FOUND,
      'Estoque não encontrado para este produto',
    ),

  alreadyExists: () =>
    new ConflictAppException(
      ErrorCode.STOCK_ALREADY_EXISTS,
      'Estoque já existe para este produto',
    ),

  insufficientQuantity: () =>
    new BadRequestAppException(
      ErrorCode.INSUFFICIENT_STOCK,
      'Quantidade insuficiente em estoque',
    ),

  invalidLimits: (message: string) =>
    new BadRequestAppException(ErrorCode.INVALID_STOCK_LIMITS, message),
};
