import { RequestMethod } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Params } from 'nestjs-pino';

export const loggerConfig = (configService: ConfigService): Params => {
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const isProduction = nodeEnv === 'production';
  const level = configService.get<string>(
    'LOG_LEVEL',
    isProduction ? 'info' : 'debug',
  );

  return {
    pinoHttp: {
      level,
      transport: isProduction
        ? undefined
        : {
            target: 'pino-pretty',
            options: {
              colorize: true,
              singleLine: true,
            },
          },
      autoLogging: {
        ignore: (req) =>
          req.url === '/health' || (req.url?.startsWith('/docs') ?? false),
      },
    },
    exclude: [{ method: RequestMethod.ALL, path: 'health' }],
  };
};
