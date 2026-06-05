import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({
    description: 'Identificador único do produto (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Nome do produto',
    example: 'Café Especial 250g',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Descrição do produto',
    example: 'Grãos torrados e moídos na hora',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Preço de venda',
    example: 29.9,
  })
  price: number;

  @ApiProperty({
    description: 'Indica se o produto está ativo no catálogo',
    example: true,
  })
  active: boolean;

  @ApiProperty({
    description: 'Data de criação do registro',
    example: '2024-06-01T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2024-06-15T14:30:00.000Z',
  })
  updatedAt: Date;
}
