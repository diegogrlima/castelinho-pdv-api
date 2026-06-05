import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ErrorCode } from '@common/errors/error-codes';
import { ProductsService } from '@products/products.service';
import { CreateSaleDto } from '@sales/dto/create-sale.dto';
import { Sale, SaleStatus } from '@sales/entities/sale.entity';
import {
  SALES_REPOSITORY,
  SaleRepositoryPort,
} from '@sales/repositories/sale.repository.port';
import { SaleService } from '@sales/sale.service';
import { StockService } from '@stocks/stock.service';

describe('SaleService', () => {
  let service: SaleService;
  let salesRepository: jest.Mocked<SaleRepositoryPort>;
  let productsService: jest.Mocked<Pick<ProductsService, 'findOne'>>;
  let stockService: jest.Mocked<Pick<StockService, 'deductQuantity'>>;
  let dataSource: { transaction: jest.Mock };

  const productId = '550e8400-e29b-41d4-a716-446655440000';
  const saleId = '880e8400-e29b-41d4-a716-446655440003';

  const buildOpenSale = (): Sale => ({
    id: saleId,
    code: 'VND-TEST',
    total: 59.8,
    status: SaleStatus.OPEN,
    items: [
      {
        id: '770e8400-e29b-41d4-a716-446655440002',
        saleId,
        productId,
        product: { name: 'Café Especial 250g' } as never,
        quantity: 2,
        unitPrice: 29.9,
        subtotal: 59.8,
        sale: {} as never,
      },
    ],
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });

  beforeEach(async () => {
    salesRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
    };

    productsService = {
      findOne: jest.fn(),
    };

    stockService = {
      deductQuantity: jest.fn(),
    };

    dataSource = {
      transaction: jest.fn(async (callback) => {
        const manager = {} as EntityManager;
        return callback(manager);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaleService,
        { provide: SALES_REPOSITORY, useValue: salesRepository },
        { provide: ProductsService, useValue: productsService },
        { provide: StockService, useValue: stockService },
        { provide: getDataSourceToken(), useValue: dataSource },
      ],
    }).compile();

    service = module.get(SaleService);
  });

  it('creates a sale with product prices and computed total', async () => {
    const dto: CreateSaleDto = {
      items: [{ productId, quantity: 2 }],
    };

    productsService.findOne.mockResolvedValue({
      id: productId,
      name: 'Café Especial 250g',
      description: null,
      price: 29.9,
      active: true,
      createdAt: buildOpenSale().createdAt,
      updatedAt: buildOpenSale().updatedAt,
    });

    salesRepository.create.mockResolvedValue(buildOpenSale());

    const result = await service.create(dto);

    expect(productsService.findOne).toHaveBeenCalledWith(productId);
    expect(salesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        total: 59.8,
        status: SaleStatus.OPEN,
        items: [
          {
            productId,
            quantity: 2,
            unitPrice: 29.9,
            subtotal: 59.8,
          },
        ],
      }),
    );
    expect(result.id).toBe(saleId);
    expect(result.status).toBe(SaleStatus.OPEN);
    expect(result.items[0].productName).toBe('Café Especial 250g');
  });

  it('throws PRODUCT_NOT_FOUND when product does not exist on create', async () => {
    productsService.findOne.mockRejectedValue({
      code: ErrorCode.PRODUCT_NOT_FOUND,
    });

    await expect(
      service.create({ items: [{ productId, quantity: 1 }] }),
    ).rejects.toMatchObject({ code: ErrorCode.PRODUCT_NOT_FOUND });
  });

  it('returns all sales from repository', async () => {
    salesRepository.findAll.mockResolvedValue([buildOpenSale()]);

    const result = await service.findAll();

    expect(salesRepository.findAll).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0].code).toBe('VND-TEST');
  });

  it('throws SALE_NOT_FOUND when sale does not exist', async () => {
    salesRepository.findById.mockResolvedValue(null);

    await expect(service.findOne(saleId)).rejects.toMatchObject({
      code: ErrorCode.SALE_NOT_FOUND,
    });
  });

  it('completes an open sale and deducts stock in a transaction', async () => {
    const openSale = buildOpenSale();
    const completedSale = { ...openSale, status: SaleStatus.COMPLETED };

    salesRepository.findById
      .mockResolvedValueOnce(openSale)
      .mockResolvedValueOnce(completedSale);
    salesRepository.save.mockResolvedValue(completedSale);
    stockService.deductQuantity.mockResolvedValue(undefined);

    const result = await service.complete(saleId);

    expect(dataSource.transaction).toHaveBeenCalled();
    expect(stockService.deductQuantity).toHaveBeenCalledWith(
      productId,
      2,
      expect.anything(),
    );
    expect(salesRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: SaleStatus.COMPLETED }),
      expect.anything(),
    );
    expect(result.status).toBe(SaleStatus.COMPLETED);
  });

  it('rejects completing a sale that is not open', async () => {
    salesRepository.findById.mockResolvedValue({
      ...buildOpenSale(),
      status: SaleStatus.COMPLETED,
    });

    await expect(service.complete(saleId)).rejects.toMatchObject({
      code: ErrorCode.SALE_INVALID_STATUS,
    });
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('cancels an open sale without touching stock', async () => {
    const openSale = buildOpenSale();
    const cancelledSale = { ...openSale, status: SaleStatus.CANCELLED };

    salesRepository.findById.mockResolvedValue(openSale);
    salesRepository.save.mockResolvedValue(cancelledSale);

    const result = await service.cancel(saleId);

    expect(stockService.deductQuantity).not.toHaveBeenCalled();
    expect(salesRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: SaleStatus.CANCELLED }),
    );
    expect(result.status).toBe(SaleStatus.CANCELLED);
  });

  it('rejects cancelling a sale that is not open', async () => {
    salesRepository.findById.mockResolvedValue({
      ...buildOpenSale(),
      status: SaleStatus.CANCELLED,
    });

    await expect(service.cancel(saleId)).rejects.toMatchObject({
      code: ErrorCode.SALE_INVALID_STATUS,
    });
  });
});
