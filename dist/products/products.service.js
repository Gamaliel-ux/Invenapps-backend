"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
const notifications_service_1 = require("../notifications/notifications.service");
const client_1 = require("@prisma/client");
let ProductsService = class ProductsService {
    prisma;
    auditLogs;
    notifications;
    constructor(prisma, auditLogs, notifications) {
        this.prisma = prisma;
        this.auditLogs = auditLogs;
        this.notifications = notifications;
    }
    async checkStockLevels(productId) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product)
            return;
        if (product.stock === 0) {
            await this.notifications.create(client_1.NotificationType.OUT_OF_STOCK, `${product.name} is out of stock! (0 left, min ${product.minStock} ${product.unit})`);
        }
        else if (product.stock <= product.minStock) {
            await this.notifications.create(client_1.NotificationType.LOW_STOCK, `${product.name} is under minimum stock level! (${product.stock} left, min ${product.minStock} ${product.unit})`);
        }
    }
    async create(dto, reqUser) {
        const existingSku = await this.prisma.product.findUnique({
            where: { sku: dto.sku },
        });
        if (existingSku) {
            throw new common_1.ConflictException(`SKU "${dto.sku}" already exists`);
        }
        const existingBarcode = await this.prisma.product.findUnique({
            where: { barcode: dto.barcode },
        });
        if (existingBarcode) {
            throw new common_1.ConflictException(`Barcode "${dto.barcode}" already exists`);
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
    async findOne(id) {
        const product = await this.prisma.product.findFirst({
            where: { id, isDeleted: false },
            include: {
                category: true,
                supplier: true,
            },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        return product;
    }
    async update(id, dto, reqUser) {
        const product = await this.findOne(id);
        if (dto.sku !== undefined) {
            const existingSku = await this.prisma.product.findFirst({
                where: { sku: dto.sku, id: { not: id } },
            });
            if (existingSku) {
                throw new common_1.ConflictException(`SKU "${dto.sku}" is already in use by another product`);
            }
        }
        if (dto.barcode !== undefined) {
            const existingBarcode = await this.prisma.product.findFirst({
                where: { barcode: dto.barcode, id: { not: id } },
            });
            if (existingBarcode) {
                throw new common_1.ConflictException(`Barcode "${dto.barcode}" is already in use by another product`);
            }
        }
        const isStockChanged = dto.stock !== undefined && dto.stock !== product.stock;
        const difference = isStockChanged ? dto.stock - product.stock : 0;
        const updated = await this.prisma.$transaction(async (tx) => {
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
                        type: client_1.MovementType.ADJUSTMENT,
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
    async remove(id, reqUser) {
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
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_logs_service_1.AuditLogsService,
        notifications_service_1.NotificationsService])
], ProductsService);
//# sourceMappingURL=products.service.js.map