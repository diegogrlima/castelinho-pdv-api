import { ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { HttpExceptionFilter } from '@common/filters/http-exception.filter';
import { AppException } from '@common/errors/app.exception';
import { ErrorCode } from '@common/errors/error-codes';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let json: jest.Mock;
  let status: jest.Mock;
  let host: ArgumentsHost;

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    filter = new HttpExceptionFilter();
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => ({ method: 'GET', url: '/v1/products/1' }),
      }),
    } as ArgumentsHost;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('maps AppException to ApiErrorResponse envelope', () => {
    const exception = new AppException(
      ErrorCode.PRODUCT_NOT_FOUND,
      'Produto não encontrado',
      HttpStatus.NOT_FOUND,
    );

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        code: ErrorCode.PRODUCT_NOT_FOUND,
        message: 'Produto não encontrado',
        path: '/v1/products/1',
        timestamp: expect.any(String),
      }),
    );
  });

  it('maps unknown errors to INTERNAL_ERROR', () => {
    filter.catch(new Error('db connection failed'), host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Não foi possível processar a solicitação',
      }),
    );
  });
});
