import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from 'typeorm';
import { ErrorCode } from '@common/errors/error-codes';
import { ProductsService } from '@products/products.service';
import {
  STOCK_REPOSITORY,
  StockRepositoryPort,
} from '@stocks/repositories/stock.repository.port';
import { StockService } from '@stocks/stock.service';

describe('StockService', () => {
  let service: StockService;
  let stockRepository: jest.Mocked<StockRepositoryPort>;
  let productsService: jest.Mocked<Pick<ProductsService, 'assertActiveProductExists'>>;

  const productId = '550e8400-e29b-41d4-a716-446655440000';
  const manager = {} as EntityManager;

  const stock = {
    id: '660e8400-e29b-41d4-a716-446655440001',
    productId,
    product: {} as never,
    quantity: 10,
    reservedQuantity: 0,
    minimumQuantity: 2,
    maximumQuantity: 100,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    stockRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByProductId: jest.fn(),
      findByProductIdForUpdate: jest.fn(),
      save: jest.fn(),
    };

    productsService = {
      assertActiveProductExists: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        { provide: STOCK_REPOSITORY, useValue: stockRepository },
        { provide: ProductsService, useValue: productsService },
      ],
    }).compile();

    service = module.get(StockService);
  });

  it('adjusts stock inward', async () => {
    productsService.assertActiveProductExists.mockResolvedValue(undefined);
    stockRepository.findByProductId.mockResolvedValue({ ...stock });
    stockRepository.save.mockResolvedValue({ ...stock, quantity: 15 });

    const result = await service.adjust(productId, {
      operation: 'IN',
      quantity: 5,
    });

    expect(productsService.assertActiveProductExists).toHaveBeenCalledWith(
      productId,
    );
    expect(result.quantity).toBe(15);
  });

  it('rejects outbound adjustment below zero', async () => {
    productsService.assertActiveProductExists.mockResolvedValue(undefined);
    stockRepository.findByProductId.mockResolvedValue({ ...stock, quantity: 3 });

    await expect(
      service.adjust(productId, { operation: 'OUT', quantity: 5 }),
    ).rejects.toMatchObject({ code: ErrorCode.INSUFFICIENT_STOCK });
  });

  it('throws STOCK_NOT_FOUND when stock does not exist', async () => {
    productsService.assertActiveProductExists.mockResolvedValue(undefined);
    stockRepository.findByProductId.mockResolvedValue(null);

    await expect(service.findByProductId(productId)).rejects.toMatchObject({
      code: ErrorCode.STOCK_NOT_FOUND,
    });
  });

  it('throws PRODUCT_NOT_FOUND when product is inactive', async () => {
    productsService.assertActiveProductExists.mockRejectedValue({
      code: ErrorCode.PRODUCT_NOT_FOUND,
    });

    await expect(service.findByProductId(productId)).rejects.toMatchObject({
      code: ErrorCode.PRODUCT_NOT_FOUND,
    });
  });

  it('creates stock through repository port inside transaction', async () => {
    stockRepository.findByProductId.mockResolvedValue(null);
    stockRepository.create.mockResolvedValue(stock);

    await service.createForProduct({
      productId,
      quantity: 10,
      minimumQuantity: 2,
      maximumQuantity: 100,
      manager,
    });

    expect(stockRepository.findByProductId).toHaveBeenCalledWith(
      productId,
      manager,
    );
    expect(stockRepository.create).toHaveBeenCalledWith(
      {
        productId,
        quantity: 10,
        minimumQuantity: 2,
        maximumQuantity: 100,
      },
      manager,
    );
    expect(productsService.assertActiveProductExists).not.toHaveBeenCalled();
  });

  it('reserves available stock for open sales', async () => {
    stockRepository.findByProductIdForUpdate.mockResolvedValue({ ...stock });
    stockRepository.save.mockImplementation(async (entity) => entity);

    await service.reserveForSale(productId, 4, manager);

    expect(stockRepository.findByProductIdForUpdate).toHaveBeenCalledWith(
      productId,
      manager,
    );
    expect(stockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ reservedQuantity: 4 }),
      manager,
    );
  });

  it('rejects reservation when available stock is insufficient', async () => {
    stockRepository.findByProductIdForUpdate.mockResolvedValue({
      ...stock,
      quantity: 5,
      reservedQuantity: 3,
    });

    await expect(
      service.reserveForSale(productId, 3, manager),
    ).rejects.toMatchObject({ code: ErrorCode.INSUFFICIENT_STOCK });
  });

  it('confirms sale reservation deducting quantity and releasing reserved amount', async () => {
    stockRepository.findByProductIdForUpdate.mockResolvedValue({
      ...stock,
      reservedQuantity: 4,
    });
    stockRepository.save.mockImplementation(async (entity) => entity);

    await service.confirmSaleReservation(productId, 4, manager);

    expect(stockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ quantity: 6, reservedQuantity: 0 }),
      manager,
    );
  });

  it('releases reservation on sale cancel', async () => {
    stockRepository.findByProductIdForUpdate.mockResolvedValue({
      ...stock,
      reservedQuantity: 4,
    });
    stockRepository.save.mockImplementation(async (entity) => entity);

    await service.releaseSaleReservation(productId, 4, manager);

    expect(stockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ reservedQuantity: 0 }),
      manager,
    );
  });
});
