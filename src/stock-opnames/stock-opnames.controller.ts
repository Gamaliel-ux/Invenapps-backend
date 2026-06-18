import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { StockOpnamesService } from './stock-opnames.service';
import { CreateStockOpnameDto } from './dto/create-stock-opname.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('stock-opnames')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stock-opnames')
export class StockOpnamesController {
  constructor(private readonly stockOpnamesService: StockOpnamesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  async create(@Body() dto: CreateStockOpnameDto, @Request() req: any) {
    return this.stockOpnamesService.create(dto, req.user);
  }

  @Get()
  async findAll() {
    return this.stockOpnamesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.stockOpnamesService.findOne(id);
  }

  @Post(':id/adjust')
  @Roles(Role.ADMIN, Role.MANAGER)
  async adjust(@Param('id') id: string, @Request() req: any) {
    return this.stockOpnamesService.adjust(id, req.user);
  }
}
