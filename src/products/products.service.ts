import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType, MovementType, Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
    private notifications: NotificationsService,
  ) {}

  async checkStockLevels(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) return;

    if (product.stock === 0) {
      await this.notifications.create(
        NotificationType.OUT_OF_STOCK,
        `${product.name} is out of stock! (0 left, min ${product.minStock} ${product.unit})`,
      );
    } else if (product.stock <= product.minStock) {
      await this.notifications.create(
        NotificationType.LOW_STOCK,
        `${product.name} is under minimum stock level! (${product.stock} left, min ${product.minStock} ${product.unit})`,
      );
    }
  }

  async create(dto: CreateProductDto, reqUser: any) {
    const existingSku = await this.prisma.product.findUnique({
      where: { sku: dto.sku },
    });
    if (existingSku) {
      throw new ConflictException(`SKU "${dto.sku}" already exists`);
    }

    const existingBarcode = await this.prisma.product.findUnique({
      where: { barcode: dto.barcode },
    });
    if (existingBarcode) {
      throw new ConflictException(`Barcode "${dto.barcode}" already exists`);
    }

    const product = await this.prisma.product.create({
      data: {
        sku: dto.sku,
        barcode: dto.barcode,
        name: dto.name,
        description: dto.description || '',
        categoryId: dto.categoryId,
        supplierId: dto.supplierId || null,
        purchasePrice: dto.purchasePrice,
        sellingPrice: dto.sellingPrice,
        stock: dto.stock,
        minStock: dto.minStock,
        unit: dto.unit,
      },
    });

    await this.auditLogs.create({
      userId: reqUser.id,
      username: reqUser.username,
      action: 'CREATE_PRODUCT',
      module: 'Products',
      detail: `Created product: ${product.name} (SKU: ${product.sku}) with stock: ${product.stock}`,
    });

    await this.checkStockLevels(product.id);

    return product;
  }

  async findAll(includeDeleted = false) {
    return this.prisma.product.findMany({
      where: includeDeleted ? {} : { isDeleted: false },
      include: {
        category: { select: { name: true } },
        supplier: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, isDeleted: false },
      include: {
        category: true,
        supplier: true,
      },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: string, dto: UpdateProductDto, reqUser: any) {
    const product = await this.findOne(id);

    if (dto.sku !== undefined) {
      const existingSku = await this.prisma.product.findFirst({
        where: { sku: dto.sku, id: { not: id } },
      });
      if (existingSku) {
        throw new ConflictException(`SKU "${dto.sku}" is already in use by another product`);
      }
    }

    if (dto.barcode !== undefined) {
      const existingBarcode = await this.prisma.product.findFirst({
        where: { barcode: dto.barcode, id: { not: id } },
      });
      if (existingBarcode) {
        throw new ConflictException(`Barcode "${dto.barcode}" is already in use by another product`);
      }
    }

    const isStockChanged = dto.stock !== undefined && dto.stock !== product.stock;
    const difference = isStockChanged ? dto.stock! - product.stock : 0;

    const updated = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const result = await tx.product.update({
        where: { id },
        data: {
          sku: dto.sku !== undefined ? dto.sku : product.sku,
          barcode: dto.barcode !== undefined ? dto.barcode : product.barcode,
          name: dto.name !== undefined ? dto.name : product.name,
          description: dto.description !== undefined ? dto.description : product.description,
          categoryId: dto.categoryId !== undefined ? dto.categoryId : product.categoryId,
          supplierId: dto.supplierId !== undefined ? (dto.supplierId || null) : product.supplierId,
          purchasePrice: dto.purchasePrice !== undefined ? dto.purchasePrice : product.purchasePrice,
          sellingPrice: dto.sellingPrice !== undefined ? dto.sellingPrice : product.sellingPrice,
          stock: dto.stock !== undefined ? dto.stock : product.stock,
          minStock: dto.minStock !== undefined ? dto.minStock : product.minStock,
          unit: dto.unit !== undefined ? dto.unit : product.unit,
        },
      });

      if (isStockChanged) {
        await tx.stockMovement.create({
          data: {
            productId: id,
            type: MovementType.ADJUSTMENT,
            quantity: difference,
            user: reqUser.username,
            notes: 'Manual inventory adjustment override',
          },
        });
      }

      return result;
    });

    await this.auditLogs.create({
      userId: reqUser.id,
      username: reqUser.username,
      action: 'UPDATE_PRODUCT',
      module: 'Products',
      detail: `Updated product ID ${id}: ${updated.name}. Stock changed: ${isStockChanged ? `${product.stock} -> ${updated.stock}` : 'No'}`,
    });

    if (isStockChanged) {
      await this.checkStockLevels(updated.id);
    }

    return updated;
  }

  async remove(id: string, reqUser: any) {
    const product = await this.findOne(id);
    
    await this.prisma.product.update({
      where: { id },
      data: { isDeleted: true },
    });

    await this.auditLogs.create({
      userId: reqUser.id,
      username: reqUser.username,
      action: 'DELETE_PRODUCT',
      module: 'Products',
      detail: `Soft-deleted product: ${product.name} (SKU: ${product.sku})`,
    });

    return { success: true };
  }
}
