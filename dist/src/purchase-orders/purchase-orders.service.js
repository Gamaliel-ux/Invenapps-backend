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
exports.PurchaseOrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const products_service_1 = require("../products/products.service");
const notifications_service_1 = require("../notifications/notifications.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
const client_1 = require("@prisma/client");
let PurchaseOrdersService = class PurchaseOrdersService {
    prisma;
    productsService;
    notifications;
    auditLogs;
    constructor(prisma, productsService, notifications, auditLogs) {
        this.prisma = prisma;
        this.productsService = productsService;
        this.notifications = notifications;
        this.auditLogs = auditLogs;
    }
    async create(dto, reqUser) {
        const existing = await this.prisma.purchaseOrder.findUnique({
            where: { code: dto.code },
        });
        if (existing) {
            throw new common_1.ConflictException(`Purchase Order code "${dto.code}" already exists`);
        }
        const totalValue = dto.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const status = dto.status || client_1.POStatus.DRAFT;
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
        if (status === client_1.POStatus.PENDING_APPROVAL) {
            await this.notifications.create(client_1.NotificationType.PENDING_APPROVAL, `New Purchase Order ${po.code} awaits your approval.`);
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
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Purchase Order with ID ${id} not found`);
        }
        return po;
    }
    async updateStatus(id, dto, reqUser) {
        const po = await this.findOne(id);
        if (po.status === client_1.POStatus.RECEIVED) {
            throw new common_1.BadRequestException('Cannot change status of an already RECEIVED Purchase Order');
        }
        const { status, notes } = dto;
        let approvedBy = po.approvedBy;
        let receivedBy = po.receivedBy;
        if (status === client_1.POStatus.APPROVED) {
            approvedBy = reqUser.username;
        }
        if (status === client_1.POStatus.RECEIVED) {
            if (po.status !== client_1.POStatus.APPROVED && po.status !== client_1.POStatus.PENDING_APPROVAL) {
                throw new common_1.BadRequestException('Purchase Order must be APPROVED or PENDING_APPROVAL before it can be RECEIVED');
            }
            receivedBy = reqUser.username;
            await this.prisma.$transaction(async (tx) => {
                await tx.purchaseOrder.update({
                    where: { id },
                    data: {
                        status,
                        approvedBy: approvedBy || reqUser.username,
                        receivedBy,
                        notes: notes !== undefined ? notes : po.notes,
                    },
                });
                for (const item of po.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: { increment: item.quantity },
                        },
                    });
                    await tx.stockMovement.create({
                        data: {
                            productId: item.productId,
                            type: client_1.MovementType.IN,
                            quantity: item.quantity,
                            user: reqUser.username,
                            notes: `Received via PO ${po.code}`,
                        },
                    });
                }
            });
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
            action: status === client_1.POStatus.APPROVED ? 'APPROVE_PO' : 'UPDATE_PO_STATUS',
            module: 'Purchase Orders',
            detail: `Updated Purchase Order ${po.code} status to ${status}`,
        });
        if (status === client_1.POStatus.PENDING_APPROVAL) {
            await this.notifications.create(client_1.NotificationType.PENDING_APPROVAL, `New Purchase Order ${po.code} awaits your approval.`);
        }
        return this.findOne(id);
    }
};
exports.PurchaseOrdersService = PurchaseOrdersService;
exports.PurchaseOrdersService = PurchaseOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        products_service_1.ProductsService,
        notifications_service_1.NotificationsService,
        audit_logs_service_1.AuditLogsService])
], PurchaseOrdersService);
//# sourceMappingURL=purchase-orders.service.js.map