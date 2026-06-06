import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ApiErrorResponse } from '@common/dto/api-error.response';
import { AppException } from '@common/errors/app.exception';
import { ErrorCode } from '@common/errors/error-codes';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    @InjectPinoLogger(HttpExceptionFilter.name)
    private readonly logger: PinoLogger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const path = request.url;

    if (exception instanceof AppException) {
      this.logException(request, exception.getStatus(), exception.code);
      response
        .status(exception.getStatus())
        .json(
          new ApiErrorResponse({
            statusCode: exception.getStatus(),
            code: exception.code,
            message: exception.clientMessage,
            path,
            fieldErrors: exception.fieldErrors,
          }),
        );
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const { code, message, fieldErrors } = this.resolveHttpException(
        status,
        body,
      );

      this.logException(request, status, code, exception.stack, status >= 500);

      response.status(status).json(
        new ApiErrorResponse({
          statusCode: status,
          code,
          message,
          path,
          fieldErrors,
        }),
      );
      return;
    }

    this.logger.error(
      {
        method: request.method,
        path,
        err: exception,
      },
      'unexpected error',
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      new ApiErrorResponse({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Não foi possível processar a solicitação',
        path,
      }),
    );
  }

  private resolveHttpException(
    status: number,
    body: string | object,
  ): { code: string; message: string; fieldErrors?: string[] } {
    if (typeof body === 'string') {
      return { code: this.codeFromStatus(status), message: body };
    }

    const payload = body as Record<string, unknown>;

    if (payload.code && typeof payload.code === 'string') {
      return {
        code: payload.code,
        message:
          typeof payload.message === 'string'
            ? payload.message
            : 'Não foi possível processar a solicitação',
        fieldErrors: Array.isArray(payload.fieldErrors)
          ? payload.fieldErrors.map(String)
          : undefined,
      };
    }

    const rawMessage = payload.message;

    if (status === HttpStatus.BAD_REQUEST && Array.isArray(rawMessage)) {
      return {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Dados inválidos',
        fieldErrors: rawMessage.map(String),
      };
    }

    const message =
      typeof rawMessage === 'string'
        ? rawMessage
        : 'Não foi possível processar a solicitação';

    return { code: this.codeFromStatus(status), message };
  }

  private codeFromStatus(status: number): string {
    const codes: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: ErrorCode.BAD_REQUEST,
      [HttpStatus.NOT_FOUND]: ErrorCode.NOT_FOUND,
      [HttpStatus.CONFLICT]: ErrorCode.STOCK_ALREADY_EXISTS,
      [HttpStatus.UNAUTHORIZED]: ErrorCode.UNAUTHORIZED,
      [HttpStatus.FORBIDDEN]: ErrorCode.FORBIDDEN,
    };

    return codes[status] ?? ErrorCode.HTTP_ERROR;
  }

  private logException(
    request: Request,
    status: number,
    code: string,
    stack?: string,
    forceError = false,
  ): void {
    const payload = {
      method: request.method,
      path: request.url,
      code,
      status,
      ...(stack ? { stack } : {}),
    };

    if (forceError || status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(payload, 'request failed');
      return;
    }

    this.logger.warn(payload, 'request rejected');
  }
}
