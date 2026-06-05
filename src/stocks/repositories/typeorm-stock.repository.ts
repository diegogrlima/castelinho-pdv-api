import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Stock } from '@stocks/entities/stock.entity';
import {
  CreateStockData,
  StockRepositoryPort,
} from '@stocks/repositories/stock.repository.port';

@Injectable()
export class TypeOrmStockRepository implements StockRepositoryPort {
  constructor(
    @InjectRepository(Stock)
    private readonly repository: Repository<Stock>,
  ) {}

  create(data: CreateStockData, manager?: EntityManager): Promise<Stock> {
    const repo = this.resolveRepository(manager);
    const stock = repo.create({
      productId: data.productId,
      quantity: data.quantity,
      minimumQuantity: data.minimumQuantity ?? 0,
      maximumQuantity: data.maximumQuantity ?? null,
    });
    return repo.save(stock);
  }

  findAll(): Promise<Stock[]> {
    return this.repository.find({ order: { updatedAt: 'DESC' } });
  }

  findByProductId(
    productId: string,
    manager?: EntityManager,
  ): Promise<Stock | null> {
    return this.resolveRepository(manager).findOne({ where: { productId } });
  }

  findByProductIdForUpdate(
    productId: string,
    manager: EntityManager,
  ): Promise<Stock | null> {
    return manager.getRepository(Stock).findOne({
      where: { productId },
      lock: { mode: 'pessimistic_write' },
    });
  }

  save(stock: Stock, manager?: EntityManager): Promise<Stock> {
    return this.resolveRepository(manager).save(stock);
  }

  private resolveRepository(manager?: EntityManager): Repository<Stock> {
    return manager ? manager.getRepository(Stock) : this.repository;
  }
}
