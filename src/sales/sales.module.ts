import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from '@products/products.module';
import { SaleController } from '@sales/sale.controller';
import { SaleService } from '@sales/sale.service';
import { Sale } from '@sales/entities/sale.entity';
import { SALES_REPOSITORY } from '@sales/repositories/sale.repository.port';
import { TypeOrmSaleRepository } from '@sales/repositories/typeorm-sale.repository';
import { StockModule } from '@stocks/stock.module';
import { SaleItem } from './entities/sale-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sale, SaleItem]),
    ProductsModule,
    StockModule,
  ],
  controllers: [SaleController],
  providers: [
    SaleService,
    {
      provide: SALES_REPOSITORY,
      useClass: TypeOrmSaleRepository,
    },
  ],
})
export class SalesModule {}
