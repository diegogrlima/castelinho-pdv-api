import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from '@products/products.controller';
import { ProductsService } from '@products/products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: jest.Mocked<
    Pick<ProductsService, 'create' | 'findAll' | 'findOne' | 'update' | 'remove'>
  >;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: service }],
    }).compile();

    controller = module.get(ProductsController);
  });

  it('maps update to PATCH handler', async () => {
    const dto = { price: 10 };
    service.update.mockResolvedValue({ id: '1', price: 10 } as never);

    await controller.update('550e8400-e29b-41d4-a716-446655440000', dto);

    expect(service.update).toHaveBeenCalledWith(
      '550e8400-e29b-41d4-a716-446655440000',
      dto,
    );
  });

  it('maps remove to DELETE handler', async () => {
    await controller.remove('550e8400-e29b-41d4-a716-446655440000');

    expect(service.remove).toHaveBeenCalledWith(
      '550e8400-e29b-41d4-a716-446655440000',
    );
  });
});
