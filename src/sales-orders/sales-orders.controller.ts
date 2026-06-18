import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SalesOrdersService } from './sales-orders.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSOStatusDto } from './dto/update-so-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('sales-orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sales-orders')
export class SalesOrdersController {
  constructor(private readonly salesOrdersService: SalesOrdersService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.STAFF)
  async create(@Body() dto: CreateSalesOrderDto, @Request() req: any) {
    return this.salesOrdersService.create(dto, req.user);
  }

  @Get()
  async findAll() {
    return this.salesOrdersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.salesOrdersService.findOne(id);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.MANAGER, Role.STAFF)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSOStatusDto,
    @Request() req: any,
  ) {
    return this.salesOrdersService.updateStatus(id, dto, req.user);
  }
}
