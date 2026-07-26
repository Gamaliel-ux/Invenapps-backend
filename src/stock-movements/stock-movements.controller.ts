import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
// Import Role enum from generated Prisma Client
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('stock-movements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.STAFF)
  async create(@Body() dto: CreateStockMovementDto, @Request() req: any) {
    return this.stockMovementsService.create(dto, req.user);
  }

  @Get()
  async findAll() {
    return this.stockMovementsService.findAll();
  }

  @Get('product/:productId')
  async findByProduct(@Param('productId') productId: string) {
    return this.stockMovementsService.findByProduct(productId);
  }
}
