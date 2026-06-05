import { ErrorCode } from '@common/errors/error-codes';
import {
  BadRequestAppException,
  NotFoundAppException,
} from '@common/errors/app.exception';

export const SaleErrors = {
  notFound: () =>
    new NotFoundAppException(
      ErrorCode.SALE_NOT_FOUND,
      'Venda não encontrada',
    ),

  invalidStatus: (message: string) =>
    new BadRequestAppException(ErrorCode.SALE_INVALID_STATUS, message),
};
