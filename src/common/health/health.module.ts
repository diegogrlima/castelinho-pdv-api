import { Module } from '@nestjs/common';
import { HealthController } from '@common/health/health.controller';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
