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
exports.SalesOrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const products_service_1 = require("../products/products.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
const client_1 = require("@prisma/client");
let SalesOrdersService = class SalesOrdersService {
    prisma;
    productsService;
    auditLogs;
    constructor(prisma, productsService, auditLogs) {
        this.prisma = prisma;
        this.productsService = productsService;
        this.auditLogs = auditLogs;
    }
    async create(dto, reqUser) {
        const existing = await this.prisma.salesOrder.findUnique({
            where: { code: dto.code },
        });
        if (existing) {
            throw new common_1.ConflictException(`Sales Order code "${dto.code}" already exists`);
        }
        const totalValue = dto.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const status = dto.status || client_1.SOStatus.DRAFT;
        if (status === client_1.SOStatus.PAID || status === client_1.SOStatus.COMPLETED) {
            await this.validateAndDeductStock(dto.items, reqUser.username, dto.code);
        }
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
        if (status === client_1.SOStatus.PAID || status === client_1.SOStatus.COMPLETED) {
            for (const item of dto.items) {
                await this.productsService.checkStockLevels(item.productId);
            }
        }
        return so;
    }
    async validateAndDeductStock(items, username, code) {
        await this.prisma.$transaction(async (tx) => {
            for (const item of items) {
                const product = await tx.product.findUnique({ where: { id: item.productId } });
                if (!product || product.isDeleted) {
                    throw new common_1.NotFoundException(`Product with ID ${item.productId} not found`);
                }
                if (product.stock < item.quantity) {
                    throw new common_1.BadRequestException(`Insufficient stock for product "${product.name}" (SKU: ${product.sku}). Required: ${item.quantity}, Available: ${product.stock}`);
                }
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: { decrement: item.quantity },
                    },
                });
                await tx.stockMovement.create({
                    data: {
                        productId: item.productId,
                        type: client_1.MovementType.OUT,
                        quantity: item.quantity,
                        user: username,
                        notes: `Sold via SO ${code}`,
                    },
                });
            }
        });
    }
    async refundStock(items, username, code) {
        await this.prisma.$transaction(async (tx) => {
            for (const item of items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: { increment: item.quantity },
                    },
                });
                await tx.stockMovement.create({
                    data: {
                        productId: item.productId,
                        type: client_1.MovementType.RETURN,
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
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Sales Order with ID ${id} not found`);
        }
        return so;
    }
    async updateStatus(id, dto, reqUser) {
        const so = await this.findOne(id);
        if (so.status === client_1.SOStatus.CANCELLED) {
            throw new common_1.BadRequestException('Cannot change status of a CANCELLED Sales Order');
        }
        const { status, notes } = dto;
        const oldStatus = so.status;
        const needsDeduction = (oldStatus === client_1.SOStatus.DRAFT) &&
            (status === client_1.SOStatus.PAID || status === client_1.SOStatus.COMPLETED);
        const needsRefund = (oldStatus === client_1.SOStatus.PAID || oldStatus === client_1.SOStatus.COMPLETED) &&
            status === client_1.SOStatus.CANCELLED;
        if (needsDeduction) {
            await this.validateAndDeductStock(so.items, reqUser.username, so.code);
        }
        else if (needsRefund) {
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
        for (const item of so.items) {
            await this.productsService.checkStockLevels(item.productId);
        }
        return this.findOne(id);
    }
};
exports.SalesOrdersService = SalesOrdersService;
exports.SalesOrdersService = SalesOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        products_service_1.ProductsService,
        audit_logs_service_1.AuditLogsService])
], SalesOrdersService);
//# sourceMappingURL=sales-orders.service.js.map