import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from '@/app.module';
import { validationExceptionFactory } from '@common/pipes/validation-exception.factory';
import { setupSwagger } from '@common/swagger/swagger.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  const logger = app.get(Logger);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  setupSwagger(app);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: validationExceptionFactory,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`API available at http://localhost:${port}`, 'Bootstrap');
  logger.log(`documentation available at http://localhost:${port}/docs`, 'Bootstrap');
}
bootstrap();
