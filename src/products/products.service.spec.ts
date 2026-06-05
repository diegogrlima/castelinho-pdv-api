import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ErrorCode } from '@common/errors/error-codes';
import { CreateProductDto } from '@products/dto/create-product.dto';
import { Product } from '@products/entities/product.entity';
import { ProductsService } from '@products/products.service';
import {
  PRODUCTS_REPOSITORY,
  ProductsRepositoryPort,
} from '@products/repositories/products.repository.port';
import { StockService } from '@stocks/stock.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: jest.Mocked<ProductsRepositoryPort>;
  let stockService: jest.Mocked<Pick<StockService, 'createForProduct'>>;
  let dataSource: { transaction: jest.Mock };

  const product: Product = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Coca-Cola',
    description: 'Refrigerante 2L',
    price: 5.5,
    active: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findAllActive: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
    };

    stockService = {
      createForProduct: jest.fn(),
    };

    dataSource = {
      transaction: jest.fn(async (callback) => {
        const manager = {} as EntityManager;
        return callback(manager);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PRODUCTS_REPOSITORY, useValue: repository },
        { provide: StockService, useValue: stockService },
        { provide: getDataSourceToken(), useValue: dataSource },
      ],
    }).compile();

    service = module.get(ProductsService);
  });

  it('creates a product and stock inside a transaction', async () => {
    const dto: CreateProductDto = {
      name: 'Coca-Cola',
      description: 'Refrigerante 2L',
      price: 5.5,
      initialQuantity: 20,
    };
    repository.create.mockResolvedValue(product);
    stockService.createForProduct.mockResolvedValue({
      id: 'stock-id',
      productId: product.id,
      quantity: 20,
      minimumQuantity: 0,
      maximumQuantity: null,
      lowStock: false,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });

    const result = await service.create(dto);

    expect(dataSource.transaction).toHaveBeenCalled();
    expect(repository.create).toHaveBeenCalledWith(
      {
        name: dto.name,
        description: dto.description ?? null,
        price: dto.price,
        active: true,
      },
      expect.any(Object),
    );
    expect(stockService.createForProduct).toHaveBeenCalledWith({
      productId: product.id,
      quantity: 20,
      minimumQuantity: 0,
      maximumQuantity: undefined,
      manager: expect.any(Object),
    });
    expect(result).toEqual({
      id: product.id,
      name: product.name,
      description: product.description,
      price: 5.5,
      active: product.active,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
  });

  it('lists only active products', async () => {
    repository.findAllActive.mockResolvedValue([product]);

    const result = await service.findAll();

    expect(repository.findAllActive).toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });

  it('throws PRODUCT_NOT_FOUND when product does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.findOne(product.id)).rejects.toMatchObject({
      code: ErrorCode.PRODUCT_NOT_FOUND,
    });
  });

  it('throws PRODUCT_NOT_FOUND when product is inactive', async () => {
    repository.findById.mockResolvedValue({ ...product, active: false });

    await expect(service.findOne(product.id)).rejects.toMatchObject({
      code: ErrorCode.PRODUCT_NOT_FOUND,
    });
  });

  it('assertActiveProductExists throws when product is inactive', async () => {
    repository.findById.mockResolvedValue({ ...product, active: false });

    await expect(service.assertActiveProductExists(product.id)).rejects.toMatchObject(
      { code: ErrorCode.PRODUCT_NOT_FOUND },
    );
  });

  it('updates only provided fields', async () => {
    repository.findById.mockResolvedValue({ ...product });
    repository.save.mockResolvedValue({ ...product, price: 6 });

    const result = await service.update(product.id, { price: 6 });

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ price: 6, name: product.name }),
    );
    expect(result.price).toBe(6);
  });

  it('deactivates an existing product', async () => {
    repository.findById.mockResolvedValue(product);

    await service.remove(product.id);

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ active: false }),
    );
  });
});
