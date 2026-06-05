import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from '@products/dto/create-product.dto';

export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, [
    'initialQuantity',
    'minimumQuantity',
    'maximumQuantity',
  ] as const),
) {}
