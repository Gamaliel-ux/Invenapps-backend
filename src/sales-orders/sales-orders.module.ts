import { Module } from '@nestjs/common';
import { SalesOrdersService } from './sales-orders.service';
import { SalesOrdersController } from './sales-orders.controller';
import { ProductsModule } from '../products/products.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [ProductsModule, AuditLogsModule],
  controllers: [SalesOrdersController],
  providers: [SalesOrdersService],
  exports: [SalesOrdersService],
})
export class SalesOrdersModule {}
