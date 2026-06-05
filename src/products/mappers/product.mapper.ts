import { ProductResponseDto } from '@products/dto/product-response.dto';
import { Product } from '@products/entities/product.entity';

export function toProductResponse(product: Product): ProductResponseDto {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    active: product.active,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export function toProductResponseList(products: Product[]): ProductResponseDto[] {
  return products.map(toProductResponse);
}
