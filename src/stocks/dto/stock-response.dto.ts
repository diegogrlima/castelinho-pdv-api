import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StockResponseDto {
  @ApiProperty({
    description: 'Identificador único do registro de estoque (UUID)',
    example: '660e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Identificador do produto vinculado (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  productId: string;

  @ApiProperty({
    description: 'Quantidade atual em estoque',
    example: 48,
    minimum: 0,
  })
  quantity: number;

  @ApiProperty({
    description: 'Quantidade mínima configurada (alerta de estoque baixo)',
    example: 10,
    minimum: 0,
  })
  minimumQuantity: number;

  @ApiPropertyOptional({
    description:
      'Quantidade máxima permitida; null quando não há teto configurado',
    example: 200,
    nullable: true,
    minimum: 0,
  })
  maximumQuantity: number | null;

  @ApiProperty({
    description:
      'Indica se a quantidade atual está abaixo ou igual ao mínimo configurado',
    example: false,
  })
  lowStock: boolean;

  @ApiProperty({
    description: 'Data de criação do registro de estoque',
    example: '2024-06-01T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última alteração de estoque',
    example: '2024-06-15T14:30:00.000Z',
  })
  updatedAt: Date;
}
