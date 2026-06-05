import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Product } from '@products/entities/product.entity';
import {
  CreateProductData,
  ProductsRepositoryPort,
} from '@products/repositories/products.repository.port';

@Injectable()
export class TypeOrmProductsRepository implements ProductsRepositoryPort {
  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
  ) {}

  create(data: CreateProductData, manager?: EntityManager): Promise<Product> {
    const repo = this.resolveRepository(manager);
    const product = repo.create(data);
    return repo.save(product);
  }

  findAllActive(): Promise<Product[]> {
    return this.repository.find({
      where: { active: true },
      order: { createdAt: 'DESC' },
    });
  }

  findById(id: string, manager?: EntityManager): Promise<Product | null> {
    return this.resolveRepository(manager).findOne({ where: { id } });
  }

  save(product: Product, manager?: EntityManager): Promise<Product> {
    return this.resolveRepository(manager).save(product);
  }

  private resolveRepository(manager?: EntityManager): Repository<Product> {
    return manager ? manager.getRepository(Product) : this.repository;
  }
}
