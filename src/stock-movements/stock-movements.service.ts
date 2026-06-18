import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { ProductsService } from '../products/products.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { MovementType } from '@prisma/client';

@Injectable()
export class StockMovementsService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
    private auditLogs: AuditLogsService,
  ) {}

  async create(dto: CreateStockMovementDto, reqUser: any) {
    // Validate product exists
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, isDeleted: false },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${dto.productId} not found`);
    }

    // Update product stock based on movement type
    if (dto.type === MovementType.IN || dto.type === MovementType.RETURN) {
      await this.prisma.product.update({
        where: { id: dto.productId },
        data: { stock: { increment: dto.quantity } },
      });
    } else if (dto.type === MovementType.OUT) {
      await this.prisma.product.update({
        where: { id: dto.productId },
        data: { stock: { decrement: dto.quantity } },
      });
    }

    // Create stock movement record
    const movement = await this.prisma.stockMovement.create({
      data: {
        productId: dto.productId,
        type: dto.type,
        quantity: dto.quantity,
        user: reqUser.username,
        notes: dto.notes || '',
      },
      include: {
        product: { select: { name: true, sku: true, unit: true } },
      },
    });

    await this.auditLogs.create({
      userId: reqUser.id,
      username: reqUser.username,
      action: 'CREATE_MOVEMENT',
      module: 'Stock Movements',
      detail: `Created ${dto.type} movement for product "${product.name}" (qty: ${dto.quantity})`,
    });

    // Check stock levels after movement
    await this.productsService.checkStockLevels(dto.productId);

    return movement;
  }

  async findAll() {
    return this.prisma.stockMovement.findMany({
      include: {
        product: { select: { name: true, sku: true, unit: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByProduct(productId: string) {
    return this.prisma.stockMovement.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
