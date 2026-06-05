import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from '@products/products.module';
import { Stock } from '@stocks/entities/stock.entity';
import { STOCK_REPOSITORY } from '@stocks/repositories/stock.repository.port';
import { TypeOrmStockRepository } from '@stocks/repositories/typeorm-stock.repository';
import { StockController } from '@stocks/stock.controller';
import { StockService } from '@stocks/stock.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Stock]),
    forwardRef(() => ProductsModule),
  ],
  controllers: [StockController],
  providers: [
    StockService,
    {
      provide: STOCK_REPOSITORY,
      useClass: TypeOrmStockRepository,
    },
  ],
  exports: [StockService],
})
export class StockModule {}
