import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateStockDto {
  @ApiPropertyOptional({
    description: 'Nova quantidade mínima para alerta de estoque baixo',
    example: 10,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  minimumQuantity?: number;

  @ApiPropertyOptional({
    description: 'Nova quantidade máxima permitida em estoque',
    example: 200,
    minimum: 0,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  maximumQuantity?: number;
}

export class SetStockQuantityDto {
  @ApiProperty({
    description: 'Quantidade absoluta a definir no estoque',
    example: 120,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  quantity: number;
}

export class AdjustStockDto {
  @ApiProperty({
    description:
      'Tipo de movimentação: IN (entrada) aumenta o saldo; OUT (saída) reduz',
    enum: ['IN', 'OUT'],
    example: 'IN',
  })
  @IsIn(['IN', 'OUT'])
  operation: 'IN' | 'OUT';

  @ApiProperty({
    description: 'Quantidade movimentada (sempre positiva)',
    example: 15,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number;
}
