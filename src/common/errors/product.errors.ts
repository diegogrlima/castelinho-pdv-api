import { NotFoundAppException } from '@common/errors/app.exception';
import { ErrorCode } from '@common/errors/error-codes';

export const ProductErrors = {
  notFound: () =>
    new NotFoundAppException(
      ErrorCode.PRODUCT_NOT_FOUND,
      'Produto não encontrado',
    ),
};
