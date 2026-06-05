import { Injectable, Inject } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SaleErrors } from '@common/errors/sale.errors';
import { ProductsService } from '@products/products.service';
import { CreateSaleDto } from '@sales/dto/create-sale.dto';
import { SaleResponseDto } from '@sales/dto/sale-response.dto';
import {
  computeItemSubtotal,
  computeSaleTotal,
  generateSaleCode,
} from '@sales/domain/sale-totals';
import { Sale, SaleStatus } from '@sales/entities/sale.entity';
import { toSaleResponse, toSaleResponseList } from '@sales/mappers/sale.mapper';
import {
  CreateSaleItemData,
  SALES_REPOSITORY,
  type SaleRepositoryPort,
} from '@sales/repositories/sale.repository.port';
import { StockService } from '@stocks/stock.service';

@Injectable()
export class SaleService {
  constructor(
    @Inject(SALES_REPOSITORY)
    private readonly salesRepository: SaleRepositoryPort,
    private readonly productsService: ProductsService,
    private readonly stockService: StockService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateSaleDto): Promise<SaleResponseDto> {
    const sale = await this.dataSource.transaction(async (manager) => {
      const items = await this.buildSaleItems(dto);

      for (const item of items) {
        await this.stockService.reserveForSale(
          item.productId,
          item.quantity,
          manager,
        );
      }

      return this.salesRepository.create(
        {
          code: generateSaleCode(),
          total: computeSaleTotal(items),
          status: SaleStatus.OPEN,
          items,
        },
        manager,
      );
    });

    return toSaleResponse(sale);
  }

  async findAll(): Promise<SaleResponseDto[]> {
    const sales = await this.salesRepository.findAll();
    return toSaleResponseList(sales);
  }

  async findOne(id: string): Promise<SaleResponseDto> {
    const sale = await this.findEntityOrFail(id);
    return toSaleResponse(sale);
  }

  async complete(id: string): Promise<SaleResponseDto> {
    const sale = await this.findEntityOrFail(id);
    this.assertOpenStatus(sale, 'Apenas vendas abertas podem ser concluídas');

    const completed = await this.dataSource.transaction(async (manager) => {
      for (const item of sale.items) {
        await this.productsService.assertActiveProductExists(item.productId);
        await this.stockService.confirmSaleReservation(
          item.productId,
          item.quantity,
          manager,
        );
      }

      sale.status = SaleStatus.COMPLETED;
      await this.salesRepository.save(sale, manager);

      const updated = await this.salesRepository.findById(sale.id, manager);
      if (!updated) {
        throw SaleErrors.notFound();
      }

      return updated;
    });

    return toSaleResponse(completed);
  }

  async cancel(id: string): Promise<SaleResponseDto> {
    const sale = await this.findEntityOrFail(id);
    this.assertOpenStatus(sale, 'Apenas vendas abertas podem ser canceladas');

    const cancelled = await this.dataSource.transaction(async (manager) => {
      for (const item of sale.items) {
        await this.stockService.releaseSaleReservation(
          item.productId,
          item.quantity,
          manager,
        );
      }

      sale.status = SaleStatus.CANCELLED;
      await this.salesRepository.save(sale, manager);

      const updated = await this.salesRepository.findById(sale.id, manager);
      if (!updated) {
        throw SaleErrors.notFound();
      }

      return updated;
    });

    return toSaleResponse(cancelled);
  }

  private async buildSaleItems(
    dto: CreateSaleDto,
  ): Promise<CreateSaleItemData[]> {
    const items: CreateSaleItemData[] = [];

    for (const item of dto.items) {
      const product = await this.productsService.findOne(item.productId);
      const unitPrice = product.price;
      const subtotal = computeItemSubtotal(item.quantity, unitPrice);

      items.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      });
    }

    return items;
  }

  private async findEntityOrFail(id: string): Promise<Sale> {
    const sale = await this.salesRepository.findById(id);
    if (!sale) {
      throw SaleErrors.notFound();
    }
    return sale;
  }

  private assertOpenStatus(sale: Sale, message: string): void {
    if (sale.status !== SaleStatus.OPEN) {
      throw SaleErrors.invalidStatus(message);
    }
  }
}
