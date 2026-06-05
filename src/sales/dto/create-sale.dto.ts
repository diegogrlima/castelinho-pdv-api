import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateSaleItemDto {
  @ApiProperty({
    description: 'UUID do produto vendido',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Quantidade vendida',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateSaleDto {
  @ApiProperty({
    description: 'Itens da venda (ao menos um produto)',
    type: [CreateSaleItemDto],
    example: [
      { productId: '550e8400-e29b-41d4-a716-446655440000', quantity: 2 },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];
}
