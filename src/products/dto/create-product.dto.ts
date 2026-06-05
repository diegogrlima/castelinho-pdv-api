import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Nome comercial do produto',
    example: 'Café Especial 250g',
    maxLength: 120,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional({
    description: 'Descrição detalhada exibida no catálogo',
    example: 'Grãos torrados e moídos na hora',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Preço de venda unitário (até 2 casas decimais)',
    example: 29.9,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description:
      'Quantidade inicial em estoque ao criar o produto (padrão: 0)',
    example: 50,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  initialQuantity?: number;

  @ApiPropertyOptional({
    description:
      'Quantidade mínima de alerta de estoque baixo (padrão: 0)',
    example: 10,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  minimumQuantity?: number;

  @ApiPropertyOptional({
    description: 'Quantidade máxima permitida em estoque',
    example: 500,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  maximumQuantity?: number;
}
