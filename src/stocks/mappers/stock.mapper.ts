import { StockResponseDto } from '@stocks/dto/stock-response.dto';
import { Stock } from '@stocks/entities/stock.entity';

export function toStockResponse(stock: Stock): StockResponseDto {
  return {
    id: stock.id,
    productId: stock.productId,
    quantity: stock.quantity,
    minimumQuantity: stock.minimumQuantity,
    maximumQuantity: stock.maximumQuantity,
    lowStock: stock.quantity <= stock.minimumQuantity,
    createdAt: stock.createdAt,
    updatedAt: stock.updatedAt,
  };
}

export function toStockResponseList(stocks: Stock[]): StockResponseDto[] {
  return stocks.map(toStockResponse);
}
