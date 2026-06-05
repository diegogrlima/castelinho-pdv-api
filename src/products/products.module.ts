import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '@products/entities/product.entity';
import { ProductsController } from '@products/products.controller';
import { ProductsService } from '@products/products.service';
import { PRODUCTS_REPOSITORY } from '@products/repositories/products.repository.port';
import { TypeOrmProductsRepository } from '@products/repositories/typeorm-products.repository';
import { StockModule } from '@stocks/stock.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    forwardRef(() => StockModule),
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    {
      provide: PRODUCTS_REPOSITORY,
      useClass: TypeOrmProductsRepository,
    },
  ],
  exports: [ProductsService],
})
export class ProductsModule {}
