import { EntityManager } from 'typeorm';
import { Product } from '@products/entities/product.entity';

export interface CreateProductData {
  name: string;
  description: string | null;
  price: number;
  active: boolean;
}

export interface ProductsRepositoryPort {
  create(data: CreateProductData, manager?: EntityManager): Promise<Product>;

  findAllActive(): Promise<Product[]>;

  findById(id: string, manager?: EntityManager): Promise<Product | null>;

  save(product: Product, manager?: EntityManager): Promise<Product>;
}

export const PRODUCTS_REPOSITORY = Symbol('PRODUCTS_REPOSITORY');
