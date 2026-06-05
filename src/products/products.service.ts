import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ProductErrors } from '@common/errors/product.errors';
import { CreateProductDto } from '@products/dto/create-product.dto';
import { ProductResponseDto } from '@products/dto/product-response.dto';
import { UpdateProductDto } from '@products/dto/update-product.dto';
import { Product } from '@products/entities/product.entity';
import {
  toProductResponse,
  toProductResponseList,
} from '@products/mappers/product.mapper';
import {
  PRODUCTS_REPOSITORY,
  type ProductsRepositoryPort,
} from '@products/repositories/products.repository.port';
import { StockService } from '@stocks/stock.service';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(PRODUCTS_REPOSITORY)
    private readonly productsRepository: ProductsRepositoryPort,
    @Inject(forwardRef(() => StockService))
    private readonly stockService: StockService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    const product = await this.dataSource.transaction(async (manager) => {
      const saved = await this.productsRepository.create(
        {
          name: dto.name,
          description: dto.description ?? null,
          price: dto.price,
          active: true,
        },
        manager,
      );

      await this.stockService.createForProduct({
        productId: saved.id,
        quantity: dto.initialQuantity ?? 0,
        minimumQuantity: dto.minimumQuantity ?? 0,
        maximumQuantity: dto.maximumQuantity,
        manager,
      });

      return saved;
    });

    return toProductResponse(product);
  }

  async findAll(): Promise<ProductResponseDto[]> {
    const products = await this.productsRepository.findAllActive();
    return toProductResponseList(products);
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.findActiveEntityOrFail(id);
    return toProductResponse(product);
  }

  async update(
    id: string,
    dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.findActiveEntityOrFail(id);
    this.applyProductUpdate(product, dto);

    const saved = await this.productsRepository.save(product);
    return toProductResponse(saved);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findEntityOrFail(id);
    if (!product.active) {
      return;
    }
    await this.productsRepository.save({ ...product, active: false });
  }

  async assertActiveProductExists(id: string): Promise<void> {
    await this.findActiveEntityOrFail(id);
  }

  private applyProductUpdate(product: Product, dto: UpdateProductDto): void {
    if (dto.name !== undefined) {
      product.name = dto.name;
    }
    if (dto.description !== undefined) {
      product.description = dto.description ?? null;
    }
    if (dto.price !== undefined) {
      product.price = dto.price;
    }
  }

  private async findActiveEntityOrFail(id: string): Promise<Product> {
    const product = await this.findEntityOrFail(id);
    if (!product.active) {
      throw ProductErrors.notFound();
    }
    return product;
  }

  private async findEntityOrFail(id: string): Promise<Product> {
    const product = await this.productsRepository.findById(id);
    if (!product) {
      throw ProductErrors.notFound();
    }
    return product;
  }
}
