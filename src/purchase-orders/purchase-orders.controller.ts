import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePOStatusDto } from './dto/update-po-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('purchase-orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.STAFF)
  async create(@Body() dto: CreatePurchaseOrderDto, @Request() req: any) {
    return this.purchaseOrdersService.create(dto, req.user);
  }

  @Get()
  async findAll() {
    return this.purchaseOrdersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.purchaseOrdersService.findOne(id);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.MANAGER, Role.STAFF)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePOStatusDto,
    @Request() req: any,
  ) {
    return this.purchaseOrdersService.updateStatus(id, dto, req.user);
  }
}
