import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { StockErrors } from '@common/errors/stock.errors';
import { ProductsService } from '@products/products.service';
import {
  computeAdjustedQuantity,
  isNegativeQuantity,
} from '@stocks/domain/stock-adjustment';
import {
  stockLimitViolationMessage,
  validateStockQuantityLimits,
} from '@stocks/domain/stock-quantity.policy';
import { StockResponseDto } from '@stocks/dto/stock-response.dto';
import {
  AdjustStockDto,
  SetStockQuantityDto,
  UpdateStockDto,
} from '@stocks/dto/stock.dto';
import { Stock } from '@stocks/entities/stock.entity';
import { toStockResponse, toStockResponseList } from '@stocks/mappers/stock.mapper';
import {
  CreateStockForProductInput,
  STOCK_REPOSITORY,
  type StockRepositoryPort,
} from '@stocks/repositories/stock.repository.port';

@Injectable()
export class StockService {
  constructor(
    @Inject(STOCK_REPOSITORY)
    private readonly stockRepository: StockRepositoryPort,
    @Inject(forwardRef(() => ProductsService))
    private readonly productsService: ProductsService,
  ) {}

  async createForProduct(
    input: CreateStockForProductInput,
  ): Promise<StockResponseDto> {
    const quantity = input.quantity ?? 0;
    const minimumQuantity = input.minimumQuantity ?? 0;
    const maximumQuantity = input.maximumQuantity;

    if (!input.manager) {
      await this.productsService.assertActiveProductExists(input.productId);
    }

    const existing = await this.stockRepository.findByProductId(
      input.productId,
      input.manager,
    );

    if (existing) {
      throw StockErrors.alreadyExists();
    }

    this.assertValidQuantityLimits(quantity, minimumQuantity, maximumQuantity);

    const stock = await this.stockRepository.create(
      {
        productId: input.productId,
        quantity,
        minimumQuantity,
        maximumQuantity: maximumQuantity ?? null,
      },
      input.manager,
    );

    return toStockResponse(stock);
  }

  async findAll(): Promise<StockResponseDto[]> {
    const stocks = await this.stockRepository.findAll();
    return toStockResponseList(stocks);
  }

  async findByProductId(productId: string): Promise<StockResponseDto> {
    const stock = await this.findEntityByProductIdOrFail(productId);
    return toStockResponse(stock);
  }

  async updateLimits(
    productId: string,
    dto: UpdateStockDto,
  ): Promise<StockResponseDto> {
    const stock = await this.findEntityByProductIdOrFail(productId);

    const minimumQuantity =
      dto.minimumQuantity !== undefined
        ? dto.minimumQuantity
        : stock.minimumQuantity;
    const maximumQuantity =
      dto.maximumQuantity !== undefined
        ? dto.maximumQuantity
        : stock.maximumQuantity;

    this.assertValidQuantityLimits(
      stock.quantity,
      minimumQuantity,
      maximumQuantity,
    );

    stock.minimumQuantity = minimumQuantity;
    stock.maximumQuantity = maximumQuantity;

    return this.persistStock(stock);
  }

  async setQuantity(
    productId: string,
    dto: SetStockQuantityDto,
  ): Promise<StockResponseDto> {
    const stock = await this.findEntityByProductIdOrFail(productId);

    this.assertValidQuantityLimits(
      dto.quantity,
      stock.minimumQuantity,
      stock.maximumQuantity,
    );

    stock.quantity = dto.quantity;
    return this.persistStock(stock);
  }

  async adjust(
    productId: string,
    dto: AdjustStockDto,
  ): Promise<StockResponseDto> {
    const stock = await this.findEntityByProductIdOrFail(productId);
    const newQuantity = computeAdjustedQuantity(
      stock.quantity,
      dto.operation,
      dto.quantity,
    );

    if (isNegativeQuantity(newQuantity)) {
      throw StockErrors.insufficientQuantity();
    }

    this.assertValidQuantityLimits(
      newQuantity,
      stock.minimumQuantity,
      stock.maximumQuantity,
    );

    stock.quantity = newQuantity;
    return this.persistStock(stock);
  }

  private async findEntityByProductIdOrFail(productId: string): Promise<Stock> {
    await this.productsService.assertActiveProductExists(productId);

    const stock = await this.stockRepository.findByProductId(productId);
    if (!stock) {
      throw StockErrors.notFound();
    }

    return stock;
  }

  private async persistStock(stock: Stock): Promise<StockResponseDto> {
    const saved = await this.stockRepository.save(stock);
    return toStockResponse(saved);
  }

  private assertValidQuantityLimits(
    quantity: number,
    minimumQuantity: number,
    maximumQuantity?: number | null,
  ): void {
    const violation = validateStockQuantityLimits(
      quantity,
      minimumQuantity,
      maximumQuantity,
    );

    if (violation) {
      throw StockErrors.invalidLimits(stockLimitViolationMessage(violation));
    }
  }
}
