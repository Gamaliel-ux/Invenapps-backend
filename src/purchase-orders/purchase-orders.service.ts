import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePOStatusDto } from './dto/update-po-status.dto';
import { ProductsService } from '../products/products.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { POStatus, MovementType, NotificationType, Prisma } from '@prisma/client';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
    private notifications: NotificationsService,
    private auditLogs: AuditLogsService,
  ) { }

  async create(dto: CreatePurchaseOrderDto, reqUser: any) {
    const existing = await this.prisma.purchaseOrder.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Purchase Order code "${dto.code}" already exists`);
    }

    // Calculate total value
    const totalValue = dto.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create PO
    const status = dto.status || POStatus.DRAFT;
    const po = await this.prisma.purchaseOrder.create({
      data: {
        code: dto.code,
        supplierId: dto.supplierId,
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
      action: 'CREATE_PO',
      module: 'Purchase Orders',
      detail: `Created Purchase Order ${po.code} with status: ${status}. Total: ${totalValue}`,
    });

    // Notify if awaits approval
    if (status === POStatus.PENDING_APPROVAL) {
      await this.notifications.create(
        NotificationType.PENDING_APPROVAL,
        `New Purchase Order ${po.code} awaits your approval.`,
      );
    }

    return po;
  }

  async findAll() {
    return this.prisma.purchaseOrder.findMany({
      include: {
        supplier: { select: { name: true } },
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
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    if (!po) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    }
    return po;
  }

  async updateStatus(id: string, dto: UpdatePOStatusDto, reqUser: any) {
    const po = await this.findOne(id);

    if (po.status === POStatus.RECEIVED) {
      throw new BadRequestException('Cannot change status of an already RECEIVED Purchase Order');
    }

    const { status, notes } = dto;
    let approvedBy = po.approvedBy;
    let receivedBy = po.receivedBy;

    if (status === POStatus.APPROVED) {
      approvedBy = reqUser.username;
    }

    if (status === POStatus.RECEIVED) {
      if (po.status !== POStatus.APPROVED && po.status !== POStatus.PENDING_APPROVAL) {
        throw new BadRequestException('Purchase Order must be APPROVED or PENDING_APPROVAL before it can be RECEIVED');
      }
      receivedBy = reqUser.username;

      // Update product stock and log stock movements in a transaction
      await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Update PO Status
        await tx.purchaseOrder.update({
          where: { id },
          data: {
            status,
            approvedBy: approvedBy || reqUser.username, // Auto approve if direct receive
            receivedBy,
            notes: notes !== undefined ? notes : po.notes,
          },
        });

        // For each item, update product stock and create movement
        for (const item of po.items) {
          // Increase stock
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity },
            },
          });

          // Log stock movement
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              type: MovementType.IN,
              quantity: item.quantity,
              user: reqUser.username,
              notes: `Received via PO ${po.code}`,
            },
          });
        }
      });

      // Post-transaction check stock levels for low stock alerts
      for (const item of po.items) {
        await this.productsService.checkStockLevels(item.productId);
      }

      await this.auditLogs.create({
        userId: reqUser.id,
        username: reqUser.username,
        action: 'RECEIVE_PO',
        module: 'Purchase Orders',
        detail: `Received Purchase Order ${po.code}. Added stock to items.`,
      });

      return this.findOne(id);
    }

    // Standard updates for status OTHER than RECEIVED
    const updated = await this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        status,
        approvedBy,
        notes: notes !== undefined ? notes : po.notes,
      },
    });

    await this.auditLogs.create({
      userId: reqUser.id,
      username: reqUser.username,
      action: status === POStatus.APPROVED ? 'APPROVE_PO' : 'UPDATE_PO_STATUS',
      module: 'Purchase Orders',
      detail: `Updated Purchase Order ${po.code} status to ${status}`,
    });

    if (status === POStatus.PENDING_APPROVAL) {
      await this.notifications.create(
        NotificationType.PENDING_APPROVAL,
        `New Purchase Order ${po.code} awaits your approval.`,
      );
    }

    return this.findOne(id);
  }
}
