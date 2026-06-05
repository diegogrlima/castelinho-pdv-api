import { EntityManager } from 'typeorm';
import { Sale, SaleStatus } from '@sales/entities/sale.entity';

export interface CreateSaleItemData {
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CreateSaleData {
  code: string;
  total: number;
  status: SaleStatus;
  items: CreateSaleItemData[];
}

export interface SaleRepositoryPort {
  create(data: CreateSaleData, manager?: EntityManager): Promise<Sale>;

  findAll(): Promise<Sale[]>;

  findById(id: string, manager?: EntityManager): Promise<Sale | null>;

  save(sale: Sale, manager?: EntityManager): Promise<Sale>;
}

export const SALES_REPOSITORY = Symbol('SALES_REPOSITORY');
