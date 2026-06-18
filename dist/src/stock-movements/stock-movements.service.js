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
exports.StockMovementsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const products_service_1 = require("../products/products.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
const client_1 = require("@prisma/client");
let StockMovementsService = class StockMovementsService {
    prisma;
    productsService;
    auditLogs;
    constructor(prisma, productsService, auditLogs) {
        this.prisma = prisma;
        this.productsService = productsService;
        this.auditLogs = auditLogs;
    }
    async create(dto, reqUser) {
        const product = await this.prisma.product.findFirst({
            where: { id: dto.productId, isDeleted: false },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${dto.productId} not found`);
        }
        if (dto.type === client_1.MovementType.IN || dto.type === client_1.MovementType.RETURN) {
            await this.prisma.product.update({
                where: { id: dto.productId },
                data: { stock: { increment: dto.quantity } },
            });
        }
        else if (dto.type === client_1.MovementType.OUT) {
            await this.prisma.product.update({
                where: { id: dto.productId },
                data: { stock: { decrement: dto.quantity } },
            });
        }
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
    async findByProduct(productId) {
        return this.prisma.stockMovement.findMany({
            where: { productId },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.StockMovementsService = StockMovementsService;
exports.StockMovementsService = StockMovementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        products_service_1.ProductsService,
        audit_logs_service_1.AuditLogsService])
], StockMovementsService);
//# sourceMappingURL=stock-movements.service.js.map