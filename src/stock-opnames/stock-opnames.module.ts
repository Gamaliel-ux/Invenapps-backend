import { Module } from '@nestjs/common';
import { StockOpnamesService } from './stock-opnames.service';
import { StockOpnamesController } from './stock-opnames.controller';
import { ProductsModule } from '../products/products.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [ProductsModule, AuditLogsModule],
  controllers: [StockOpnamesController],
  providers: [StockOpnamesService],
  exports: [StockOpnamesService],
})
export class StockOpnamesModule {}
