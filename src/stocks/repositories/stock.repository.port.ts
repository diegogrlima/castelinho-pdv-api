import { EntityManager } from 'typeorm';
import { Stock } from '@stocks/entities/stock.entity';

export interface CreateStockData {
  productId: string;
  quantity: number;
  minimumQuantity?: number;
  maximumQuantity?: number | null;
}

export interface CreateStockForProductInput {
  productId: string;
  quantity?: number;
  minimumQuantity?: number;
  maximumQuantity?: number | null;
  manager?: EntityManager;
}

export interface StockRepositoryPort {
  create(data: CreateStockData, manager?: EntityManager): Promise<Stock>;

  findAll(): Promise<Stock[]>;

  findByProductId(
    productId: string,
    manager?: EntityManager,
  ): Promise<Stock | null>;

  save(stock: Stock, manager?: EntityManager): Promise<Stock>;
}

export const STOCK_REPOSITORY = Symbol('STOCK_REPOSITORY');
