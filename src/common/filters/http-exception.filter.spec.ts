import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { HttpExceptionFilter } from '@common/filters/http-exception.filter';
import { AppException } from '@common/errors/app.exception';
import { ErrorCode } from '@common/errors/error-codes';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let logger: jest.Mocked<Pick<PinoLogger, 'warn' | 'error'>>;
  let json: jest.Mock;
  let status: jest.Mock;
  let host: ArgumentsHost;

  beforeEach(() => {
    logger = {
      warn: jest.fn(),
      error: jest.fn(),
    };

    filter = new HttpExceptionFilter(logger as unknown as PinoLogger);
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => ({ method: 'GET', url: '/v1/products/1' }),
      }),
    } as ArgumentsHost;
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
    expect(logger.warn).toHaveBeenCalled();
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
    expect(logger.error).toHaveBeenCalled();
  });
});
