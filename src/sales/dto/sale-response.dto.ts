import { ApiProperty } from '@nestjs/swagger';
import { SaleStatus } from '@sales/entities/sale.entity';

export class SaleItemResponseDto {
  @ApiProperty({
    description: 'Identificador único do item (UUID)',
    example: '770e8400-e29b-41d4-a716-446655440002',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'UUID do produto vendido',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  productId: string;

  @ApiProperty({
    description: 'Nome do produto no momento da venda',
    example: 'Café Especial 250g',
  })
  productName: string;

  @ApiProperty({
    description: 'Quantidade vendida',
    example: 2,
  })
  quantity: number;

  @ApiProperty({
    description: 'Preço unitário registrado na venda',
    example: 29.9,
  })
  unitPrice: number;

  @ApiProperty({
    description: 'Subtotal do item (quantidade × preço unitário)',
    example: 59.8,
  })
  subtotal: number;
}

export class SaleResponseDto {
  @ApiProperty({
    description: 'Identificador único da venda (UUID)',
    example: '880e8400-e29b-41d4-a716-446655440003',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Código legível da venda',
    example: 'VND-M5K2ABCD',
  })
  code: string;

  @ApiProperty({
    description: 'Valor total da venda',
    example: 59.8,
  })
  total: number;

  @ApiProperty({
    description: 'Status atual da venda',
    enum: SaleStatus,
    example: SaleStatus.OPEN,
  })
  status: SaleStatus;

  @ApiProperty({
    description: 'Itens da venda',
    type: [SaleItemResponseDto],
  })
  items: SaleItemResponseDto[];

  @ApiProperty({
    description: 'Data de criação',
    example: '2024-06-01T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2024-06-01T10:05:00.000Z',
  })
  updatedAt: Date;
}
