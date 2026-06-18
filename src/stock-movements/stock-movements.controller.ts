import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('stock-movements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Get()
  async findAll() {
    return this.stockMovementsService.findAll();
  }

  @Get('product/:productId')
  async findByProduct(@Param('productId') productId: string) {
    return this.stockMovementsService.findByProduct(productId);
  }
}
