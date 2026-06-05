import { Test, TestingModule } from '@nestjs/testing';
import { SaleController } from '@sales/sale.controller';
import { SaleService } from '@sales/sale.service';

describe('SaleController', () => {
  let controller: SaleController;
  let service: jest.Mocked<
    Pick<SaleService, 'create' | 'findAll' | 'findOne' | 'complete' | 'cancel'>
  >;

  const saleId = '880e8400-e29b-41d4-a716-446655440003';

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      complete: jest.fn(),
      cancel: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SaleController],
      providers: [{ provide: SaleService, useValue: service }],
    }).compile();

    controller = module.get(SaleController);
  });

  it('delegates create to service', async () => {
    const dto = { items: [{ productId: saleId, quantity: 2 }] };
    service.create.mockResolvedValue({ id: saleId } as never);

    await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('delegates findAll to service', async () => {
    service.findAll.mockResolvedValue([]);

    await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
  });

  it('delegates findOne to service', async () => {
    service.findOne.mockResolvedValue({ id: saleId } as never);

    await controller.findOne(saleId);

    expect(service.findOne).toHaveBeenCalledWith(saleId);
  });

  it('delegates complete to service', async () => {
    service.complete.mockResolvedValue({ id: saleId, status: 'COMPLETED' } as never);

    await controller.complete(saleId);

    expect(service.complete).toHaveBeenCalledWith(saleId);
  });

  it('delegates cancel to service', async () => {
    service.cancel.mockResolvedValue({ id: saleId, status: 'CANCELLED' } as never);

    await controller.cancel(saleId);

    expect(service.cancel).toHaveBeenCalledWith(saleId);
  });
});
