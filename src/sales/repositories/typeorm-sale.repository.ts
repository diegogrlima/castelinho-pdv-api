import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Sale } from '@sales/entities/sale.entity';
import { SaleItem } from '@sales/entities/sale-item.entity';
import {
  CreateSaleData,
  SaleRepositoryPort,
} from '@sales/repositories/sale.repository.port';

@Injectable()
export class TypeOrmSaleRepository implements SaleRepositoryPort {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private readonly saleItemRepository: Repository<SaleItem>,
  ) {}

  async create(data: CreateSaleData, manager?: EntityManager): Promise<Sale> {
    const saleRepo = this.resolveSaleRepository(manager);
    const itemRepo = this.resolveSaleItemRepository(manager);

    const sale = saleRepo.create({
      code: data.code,
      total: data.total,
      status: data.status,
    });
    const savedSale = await saleRepo.save(sale);

    const items = data.items.map((item) =>
      itemRepo.create({
        saleId: savedSale.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      }),
    );
    await itemRepo.save(items);

    const saleWithItems = await this.findById(savedSale.id, manager);
    if (!saleWithItems) {
      throw new Error('Falha ao recarregar venda após criação');
    }

    return saleWithItems;
  }

  findAll(): Promise<Sale[]> {
    return this.saleRepository.find({
      relations: {
        items: {
          product: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  findById(id: string, manager?: EntityManager): Promise<Sale | null> {
    return this.resolveSaleRepository(manager).findOne({
      where: { id },
      relations: {
        items: {
          product: true,
        },
      },
    });
  }

  save(sale: Sale, manager?: EntityManager): Promise<Sale> {
    return this.resolveSaleRepository(manager).save(sale);
  }

  private resolveSaleRepository(manager?: EntityManager): Repository<Sale> {
    return manager ? manager.getRepository(Sale) : this.saleRepository;
  }

  private resolveSaleItemRepository(
    manager?: EntityManager,
  ): Repository<SaleItem> {
    return manager ? manager.getRepository(SaleItem) : this.saleItemRepository;
  }
}
