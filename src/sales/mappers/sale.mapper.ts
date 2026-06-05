import { SaleItemResponseDto, SaleResponseDto } from '@sales/dto/sale-response.dto';
import { Sale } from '@sales/entities/sale.entity';

function toSaleItemResponse(item: Sale['items'][number]): SaleItemResponseDto {
  return {
    id: item.id,
    productId: item.productId,
    productName: item.product?.name ?? '',
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    subtotal: Number(item.subtotal),
  };
}

export function toSaleResponse(sale: Sale): SaleResponseDto {
  return {
    id: sale.id,
    code: sale.code,
    total: Number(sale.total),
    status: sale.status,
    items: (sale.items ?? []).map(toSaleItemResponse),
    createdAt: sale.createdAt,
    updatedAt: sale.updatedAt,
  };
}

export function toSaleResponseList(sales: Sale[]): SaleResponseDto[] {
  return sales.map(toSaleResponse);
}
