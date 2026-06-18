import { Module } from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service';
import { StockMovementsController } from './stock-movements.controller';
import { ProductsModule } from '../products/products.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [ProductsModule, AuditLogsModule],
  controllers: [StockMovementsController],
  providers: [StockMovementsService],
  exports: [StockMovementsService],
})
export class StockMovementsModule {}
