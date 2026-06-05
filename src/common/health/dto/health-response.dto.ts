import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({
    description: 'Indica se a API está respondendo',
    example: 'ok',
    enum: ['ok'],
  })
  status: string;
}
