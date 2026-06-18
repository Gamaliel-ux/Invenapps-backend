import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSOStatusDto } from './dto/update-so-status.dto';
import { ProductsService } from '../products/products.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { SOStatus, MovementType, Prisma } from '@prisma/client';

@Injectable()
export class SalesOrdersService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
    private auditLogs: AuditLogsService,
  ) {}

  async create(dto: CreateSalesOrderDto, reqUser: any) {
    const existing = await this.prisma.salesOrder.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Sales Order code "${dto.code}" already exists`);
    }

    const totalValue = dto.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const status = dto.status || SOStatus.DRAFT;

    // If directly created as PAID or COMPLETED, validate and deduct stock
    if (status === SOStatus.PAID || status === SOStatus.COMPLETED) {
      await this.validateAndDeductStock(dto.items, reqUser.username, dto.code);
    }

    // Create SO
    const so = await this.prisma.salesOrder.create({
      data: {
        code: dto.code,
        customerId: dto.customerId,
        totalValue,
        status,
        notes: dto.notes || '',
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    await this.auditLogs.create({
      userId: reqUser.id,
      username: reqUser.username,
      action: 'CREATE_SO',
      module: 'Sales Orders',
      detail: `Created Sales Order ${so.code} with status: ${status}. Total: ${totalValue}`,
    });

    // Check stock alerts for all items
    if (status === SOStatus.PAID || status === SOStatus.COMPLETED) {
      for (const item of dto.items) {
        await this.productsService.checkStockLevels(item.productId);
      }
    }

    return so;
  }

  private async validateAndDeductStock(items: any[], username: string, code: string) {
    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product || product.isDeleted) {
          throw new NotFoundException(`Product with ID ${item.productId} not found`);
        }
        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product "${product.name}" (SKU: ${product.sku}). Required: ${item.quantity}, Available: ${product.stock}`,
          );
        }

        // Deduct
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        // Log movement
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: MovementType.OUT,
            quantity: item.quantity,
            user: username,
            notes: `Sold via SO ${code}`,
          },
        });
      }
    });
  }

  private async refundStock(items: any[], username: string, code: string) {
    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      for (const item of items) {
        // Increment stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
          },
        });

        // Log movement
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: MovementType.RETURN,
            quantity: item.quantity,
            user: username,
            notes: `Restored stock due to cancelled SO ${code}`,
          },
        });
      }
    });
  }

  async findAll() {
    return this.prisma.salesOrder.findMany({
      include: {
        customer: { select: { name: true } },
        items: {
          include: {
            product: { select: { name: true, sku: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const so = await this.prisma.salesOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    if (!so) {
      throw new NotFoundException(`Sales Order with ID ${id} not found`);
    }
    return so;
  }

  async updateStatus(id: string, dto: UpdateSOStatusDto, reqUser: any) {
    const so = await this.findOne(id);

    if (so.status === SOStatus.CANCELLED) {
      throw new BadRequestException('Cannot change status of a CANCELLED Sales Order');
    }

    const { status, notes } = dto;
    const oldStatus = so.status;

    // Deduct stock if transitioning from DRAFT to PAID/COMPLETED
    const needsDeduction =
      (oldStatus === SOStatus.DRAFT) &&
      (status === SOStatus.PAID || status === SOStatus.COMPLETED);

    // Refund stock if transitioning from PAID/COMPLETED to CANCELLED
    const needsRefund =
      (oldStatus === SOStatus.PAID || oldStatus === SOStatus.COMPLETED) &&
      status === SOStatus.CANCELLED;

    if (needsDeduction) {
      await this.validateAndDeductStock(so.items, reqUser.username, so.code);
    } else if (needsRefund) {
      await this.refundStock(so.items, reqUser.username, so.code);
    }

    const updated = await this.prisma.salesOrder.update({
      where: { id },
      data: {
        status,
        notes: notes !== undefined ? notes : so.notes,
      },
    });

    await this.auditLogs.create({
      userId: reqUser.id,
      username: reqUser.username,
      action: 'UPDATE_SO_STATUS',
      module: 'Sales Orders',
      detail: `Updated Sales Order ${so.code} status from ${oldStatus} to ${status}`,
    });

    // Check stock level alerts
    for (const item of so.items) {
      await this.productsService.checkStockLevels(item.productId);
    }

    return this.findOne(id);
  }
}
