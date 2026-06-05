import { Test, TestingModule } from '@nestjs/testing';
import { StockController } from '@stocks/stock.controller';
import { StockService } from '@stocks/stock.service';

describe('StockController', () => {
  let controller: StockController;
  let service: jest.Mocked<
    Pick<
      StockService,
      'findAll' | 'findByProductId' | 'updateLimits' | 'setQuantity' | 'adjust'
    >
  >;

  const productId = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findByProductId: jest.fn(),
      updateLimits: jest.fn(),
      setQuantity: jest.fn(),
      adjust: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockController],
      providers: [{ provide: StockService, useValue: service }],
    }).compile();

    controller = module.get(StockController);
  });

  it('delegates findByProduct to service', async () => {
    service.findByProductId.mockResolvedValue({ id: '1' } as never);

    await controller.findByProduct(productId);

    expect(service.findByProductId).toHaveBeenCalledWith(productId);
  });

  it('delegates adjust to service', async () => {
    const dto = { operation: 'IN' as const, quantity: 5 };
    service.adjust.mockResolvedValue({ quantity: 15 } as never);

    await controller.adjust(productId, dto);

    expect(service.adjust).toHaveBeenCalledWith(productId, dto);
  });

  it('delegates setQuantity to service', async () => {
    const dto = { quantity: 20 };
    service.setQuantity.mockResolvedValue({ quantity: 20 } as never);

    await controller.setQuantity(productId, dto);

    expect(service.setQuantity).toHaveBeenCalledWith(productId, dto);
  });
});
